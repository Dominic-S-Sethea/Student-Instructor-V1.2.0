function readBaseUrl(): string {
  const meta = import.meta as { env?: { BASE_URL?: string } };
  return meta.env?.BASE_URL || '/';
}

/**
 * Resolves root-relative public asset paths (e.g. `/images/...`, `/crests/...`)
 * against Vite's `BASE_URL` so subpath deployments like GitHub Pages never 404.
 */
export function resolvePublicAssetUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (!url.startsWith('/')) return url;
  const base = readBaseUrl().replace(/\/+$/, '');
  if (!base || url.startsWith(`${base}/`)) {
    return url;
  }
  return `${base}${url}`;
}
