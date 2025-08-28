"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();
  const router = useRouter();

  const initializeGoogle = async () => {
    const [nonce, hashedNonce] = await generateNonce();
    if (window.hashedNonce !== hashedNonce) {
      window.hashedNonce = hashedNonce;
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID, // Your client ID from Google Cloud
        callback: async (response: CredentialResponse) => {
          try {
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
          }
        }, // Handler to process login token
        nonce: hashedNonce,
        // with chrome's removal of third-party cookies, we need to use FedCM instead (https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
        use_fedcm_for_prompt: true,
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
  }, []); //eslint-disable-line

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async defer></Script>
      <div id="google-login-btn" className="w-full"></div>
    </>
  );
}
