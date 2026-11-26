/// <reference types="vite/client" />

/**
 * Resolves root-relative public asset paths (e.g. `/images/...`, `/crests/...`)
 * against Vite's `BASE_URL` so subpath deployments like GitHub Pages never 404.
 */
export function resolvePublicAssetUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (!url.startsWith('/')) return url;
  const rawBase = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.BASE_URL : '/';
  const base = (rawBase || '/').replace(/\/+$/, '');
  if (!base || url.startsWith(`${base}/`)) {
    return url;
  }
  return `${base}${url}`;
}
