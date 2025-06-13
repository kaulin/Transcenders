export function toQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)]);

  return entries.length ? `?${new URLSearchParams(entries)}` : '';
}
