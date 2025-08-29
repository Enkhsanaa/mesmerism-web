"use client";

import { useSupabase } from "@/app/supabase-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

declare global {
  interface Window {
    google: any;
    hashedNonce: string;
  }
}
const generateNonce = async (): Promise<string[]> => {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
  );
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return [nonce, hashedNonce];
};

interface CredentialResponse {
  credential: string;
  select_by: string;
  state: string;
}

export default function GoogleLoginButton() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const initializeGoogle = async () => {
    const [nonce, hashedNonce] = await generateNonce();
    if (window.hashedNonce !== hashedNonce) {
      window.hashedNonce = hashedNonce;
      const isFedCMSupported =
        "IdentityCredential" in window && "IdentityProvider" in window;
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID, // Your client ID from Google Cloud
        callback: async (response: CredentialResponse) => {
          try {
            setIsLoggingIn(true);
            // send id token returned in response.credential to supabase
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce,
            });
            if (error) throw error;
            console.log("Session data: ", data);
            console.log("Successfully logged in with Google One Tap");
            // redirect to protected page
            router.push("/");
          } catch (error) {
            console.error("Error logging in with Google One Tap", error);
            setIsLoggingIn(false);
          }
        }, // Handler to process login token
        nonce: hashedNonce,
        // with chrome's removal of third-party cookies, we need to use FedCM instead (https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
        use_fedcm_for_prompt: isFedCMSupported,
      });
    }

    // Render the Google button
    window.google.accounts.id.renderButton(
      document.getElementById("google-login-btn"),
      {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
      }
    );
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    window.google.accounts.id.prompt();
  };

  useEffect(() => {
    // We check every 300ms to see if google client is loaded
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        initializeGoogle();
      }
    }, 300);
  }, []);

  return (
    <div className="grid grid-cols-1 grid-rows-1">
      <Script src="https://accounts.google.com/gsi/client" async defer></Script>
      <div
        id="google-login-btn"
        className="col-start-1 col-end-2 row-start-1 row-end-2 h-[38px] w-[231px]"
      ></div>
      {isLoading && (
        <div className="h-[38px] w-[210px] bg-gray-200 rounded-2xl col-start-1 col-end-2 row-start-1 row-end-2" />
      )}
      {isLoggingIn && (
        <Button
          variant="glass"
          className="col-start-1 col-end-2 row-start-1 row-end-2 h-[38px] w-[210px]"
        >
          <Loader2 className="animate-spin" /> Нэвтэрж байна...
        </Button>
      )}
    </div>
  );
}
