/** Next.js `searchParams` 单项：数组时取首值。 */
export function parseFirstQueryValue(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
