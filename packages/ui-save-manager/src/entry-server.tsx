// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";
import type { PageEvent } from "@solidjs/start/server";
import { appName } from "~/messages/appMessages";
import { allowScriptsCarryingNonce, drawScriptNonce } from "~/lib/scriptNonce";

const contentSecurityPolicyHeader = "Content-Security-Policy";

/**
 * Sends the content security policy of `public/_headers` on the document, allowing the inline
 * scripts Solid writes into it by a nonce drawn for that document alone.
 */
function allowTheInlineScriptsOf(context: PageEvent): { nonce: string } {
  const nonce = drawScriptNonce();
  const policy = allowScriptsCarryingNonce(import.meta.env.SITE_CONTENT_SECURITY_POLICY, nonce);
  context.response.headers.set(contentSecurityPolicyHeader, policy);

  return { nonce };
}

export default createHandler(() => (
  <StartServer
    document={(props) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <title>{appName}</title>
          {props.assets}
        </head>
        <body>
          <div id="app">{props.children}</div>
          {props.scripts}
        </body>
      </html>
    )}
  />
), allowTheInlineScriptsOf);
