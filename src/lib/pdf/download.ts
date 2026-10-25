export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parse "1-3,5,7-9" into [1,2,3,5,7,8,9] (1-indexed). */
export function parsePageRanges(input: string, totalPages: number): number[] {
  const result = new Set<number>();
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const start = Number(m[1]);
      const end = Number(m[2]);
      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid page range “${part}”. Choose pages from 1 to ${totalPages}.`);
      }
      for (let i = start; i <= end; i++) result.add(i);
    } else if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n < 1 || n > totalPages) {
        throw new Error(`Invalid page “${part}”. Choose pages from 1 to ${totalPages}.`);
      }
      result.add(n);
    } else {
      throw new Error(`Invalid page range “${part}”. Use numbers such as 1-3, 5.`);
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}
