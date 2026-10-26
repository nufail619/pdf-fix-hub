/** Map display coordinates to PDF coordinates, including cropped/rotated pages. */
export function displayGeometry(
  crop: { x: number; y: number; width: number; height: number },
  rotation: number,
) {
  const { x, y, width: w, height: h } = crop;
  const angle = ((rotation % 360) + 360) % 360;
  const matrices: Record<number, [number, number, number, number, number, number]> = {
    0: [1, 0, 0, 1, x, y],
    90: [0, 1, -1, 0, x + w, y],
    180: [-1, 0, 0, -1, x + w, y + h],
    270: [0, -1, 1, 0, x, y + h],
  };
  if (!matrices[angle]) throw new Error("Unsupported page rotation.");
  return { width: angle % 180 ? h : w, height: angle % 180 ? w : h, matrix: matrices[angle] };
}
