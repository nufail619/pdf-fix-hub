// An estimate for reading the article text, excluding time spent doing the task.
export function estimateReadTime(markdown) {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[#*_`>~|]/g, " ");
  const words = text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || [];
  return `${Math.max(1, Math.ceil(words.length / 200))} min read`;
}
