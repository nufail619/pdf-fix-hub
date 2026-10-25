/** Escape HTML script delimiters while keeping valid JSON and original values. */
export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
