import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mesmerism",
    short_name: "Mesmerism",
    description: "Mesmerism - Social Media Influencer website.",
    start_url: "/",
    display: "standalone",
    background_color: "#2f3136",
    theme_color: "#2f3136",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
