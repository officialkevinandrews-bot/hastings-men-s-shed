import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_PREFIXES = ["gallery/", "site/", "supporters/"];

export const Route = createFileRoute("/api/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const objectPath = (params._splat || "").replace(/^\/+/, "");
        if (
          !objectPath ||
          objectPath.includes("..") ||
          !ALLOWED_PREFIXES.some((prefix) => objectPath.startsWith(prefix))
        ) {
          return new Response("Not found", { status: 404 });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.storage.from("shed-media").download(objectPath);
          if (error || !data) {
            return new Response("Not found", { status: 404 });
          }
          const arrayBuffer = await data.arrayBuffer();
          return new Response(arrayBuffer, {
            status: 200,
            headers: {
              "content-type": data.type || "image/jpeg",
              "cache-control": "public, max-age=31536000, immutable",
            },
          });
        } catch {
          return new Response("Media unavailable", { status: 500 });
        }
      },
    },
  },
});
