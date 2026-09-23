import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import { readSiteHeaders } from "./siteHeaders";

// The document carries the content security policy with a nonce drawn per response by
// `src/entry-server.tsx`; the server route rule carries the rest of `public/_headers`.
const { "Content-Security-Policy": siteContentSecurityPolicy, ...otherSiteHeaders } = readSiteHeaders();

export default defineConfig({
  define: {
    "import.meta.env.SITE_CONTENT_SECURITY_POLICY": JSON.stringify(siteContentSecurityPolicy)
  },
  plugins: [
    solidStart(),
    nitro({
      routeRules: {
        "/**": { headers: otherSiteHeaders }
      }
    })
  ]
});
