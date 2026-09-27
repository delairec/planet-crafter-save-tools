import { defineConfig, type Plugin } from "vite";
import { nitro } from "nitro/vite";
import { solidStart } from "@solidjs/start/config";
import { readSiteHeaders } from "./siteHeaders.ts";
import { writeVersionDocument } from "./versionDocument.ts";
import uiManifest from "./package.json" with { type: "json" };

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

function allowInlineStyles(policy: string): string {
  return policy.replace("style-src", "style-src 'unsafe-inline'");
}

export default defineConfig(({ command }) => ({
  define: {
    "import.meta.env.SITE_CONTENT_SECURITY_POLICY": JSON.stringify(
      command === "serve" ? allowInlineStyles(siteContentSecurityPolicy) : siteContentSecurityPolicy
    )
  },
  optimizeDeps: {
    include: ["@solidjs/start > @jridgewell/trace-mapping"]
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
}));
