import { defineConfig, type Plugin } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import { readSiteHeaders } from "./siteHeaders";
import { writeVersionDocument } from "./versionDocument.ts";
import uiManifest from "./package.json" with { type: "json" };

// The document carries the content security policy with a nonce drawn per response by
// `src/entry-server.tsx`; the server route rule carries the rest of `public/_headers`.
const { "Content-Security-Policy": siteContentSecurityPolicy, ...otherSiteHeaders } = readSiteHeaders();

function emitVersionDocument(): Plugin {
  return {
    name: "ui-save-manager:version-document",
    applyToEnvironment: (environment) => environment.name === "client",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: writeVersionDocument(uiManifest.version, process.env.COMMIT_REF)
      });
    }
  };
}

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
    }),
    emitVersionDocument()
  ]
});
