const nonceSource = /\s'nonce-[^']*'/g;

/** A fresh nonce, drawn for one rendered document. */
export function drawScriptNonce(): string {
  return crypto.randomUUID().replaceAll('-', '');
}

/** The content security policy allowing, besides what it already allows, the scripts carrying `nonce`. */
export function allowScriptsCarryingNonce(policy: string, nonce: string): string {
  return policy.replace('script-src', `script-src 'nonce-${nonce}'`);
}

/** The content security policy stripped of its nonces, as `public/_headers` declares it. */
export function removeScriptNonces(policy: string): string {
  return policy.replace(nonceSource, '');
}
