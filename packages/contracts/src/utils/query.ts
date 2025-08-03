/**
 * Converts an object of query parameters to a URL query string.
 * Example: { a: 1, b: "foo" } => "?a=1&b=foo"
 */
export function toQueryString(
  params: Record<string, string | number | boolean | undefined | null> | undefined,
): string {
  // filter out nulls and udnefineds
  if (!params) return '';
  const entries: [string, string][] = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)]);

  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
}
