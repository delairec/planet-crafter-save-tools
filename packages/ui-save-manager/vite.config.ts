import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import { readSiteHeaders } from "./siteHeaders";

const { "Content-Security-Policy": siteContentSecurityPolicy, ...otherSiteHeaders } = readSiteHeaders();

const commitBuiltByNetlify = process.env.COMMIT_REF;
const buildCommitHeader: Record<string, string> = commitBuiltByNetlify ? { "X-Build-Commit": commitBuiltByNetlify } : {};

export default defineConfig({
  define: {
    "import.meta.env.SITE_CONTENT_SECURITY_POLICY": JSON.stringify(siteContentSecurityPolicy)
  },
  plugins: [
    solidStart(),
    nitro({
      routeRules: {
        "/**": { headers: { ...otherSiteHeaders, ...buildCommitHeader } }
      }
    })
  ]
});
