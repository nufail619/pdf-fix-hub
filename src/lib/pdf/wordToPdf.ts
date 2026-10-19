// DOCX -> PDF in the browser: mammoth turns the .docx into clean HTML, then a
// small layout engine writes real (selectable) text into a PDF with pdf-lib.
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;
const TEXT = rgb(0.1, 0.1, 0.12);

type Run = { text: string; bold: boolean; italic: boolean; link?: boolean };
type Block =
  | {
      kind: "para";
      runs: Run[];
      size: number;
      before: number;
      after: number;
      indent: number;
      marker?: string;
      heading?: boolean;
    }
  | { kind: "image"; src: string }
  | { kind: "table"; rows: string[][] }
  | { kind: "rule" };

type Fonts = { regular: PDFFont; bold: PDFFont; italic: PDFFont; boldItalic: PDFFont };

const HEADING_SIZE: Record<string, number> = { H1: 22, H2: 18, H3: 15, H4: 13, H5: 12, H6: 11 };

function collectRuns(
  node: Node,
  style: { bold: boolean; italic: boolean; link?: boolean },
  out: Run[],
) {
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = (child.textContent ?? "").replace(/\s+/g, " ");
      if (text) out.push({ text, ...style });
      return;
    }
    if (!(child instanceof HTMLElement)) return;
    const tag = child.tagName;
    if (tag === "BR") out.push({ text: "\n", ...style });
    else if (tag === "IMG" || tag === "UL" || tag === "OL" || tag === "TABLE") return;
    else
      collectRuns(
        child,
        {
          bold: style.bold || tag === "STRONG" || tag === "B",
          italic: style.italic || tag === "EM" || tag === "I",
          link: style.link || tag === "A",
        },
        out,
      );
  });
}

function htmlToBlocks(html: string): Block[] {
  const dom = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const blocks: Block[] = [];

  const pushImages = (el: Element) =>
    el.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") ?? "";
      if (src.startsWith("data:image/")) blocks.push({ kind: "image", src });
    });

  const walkList = (list: Element, depth: number) => {
    let n = 1;
    Array.from(list.children).forEach((li) => {
      if (li.tagName !== "LI") return;
      const runs: Run[] = [];
      collectRuns(li, { bold: false, italic: false }, runs);
      blocks.push({
        kind: "para",
        runs,
        size: 11,
        before: 1,
        after: 2,
        indent: 18 * (depth + 1),
        marker: list.tagName === "OL" ? `${n++}.` : "•",
      });
      li.querySelectorAll(":scope > ul, :scope > ol").forEach((sub) => walkList(sub, depth + 1));
    });
  };

  Array.from(dom.body.children).forEach((el) => {
    const tag = el.tagName;
    if (tag in HEADING_SIZE) {
      const runs: Run[] = [];
      collectRuns(el, { bold: true, italic: false }, runs);
      const size = HEADING_SIZE[tag];
      blocks.push({
        kind: "para",
        runs,
        size,
        before: size * 0.8,
        after: size * 0.35,
        indent: 0,
        heading: true,
      });
    } else if (tag === "UL" || tag === "OL") {
      walkList(el, 0);
    } else if (tag === "TABLE") {
      const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
        Array.from(tr.children).map((td) => (td.textContent ?? "").replace(/\s+/g, " ").trim()),
      );
      if (rows.length) blocks.push({ kind: "table", rows });
    } else if (tag === "HR") {
      blocks.push({ kind: "rule" });
    } else {
      const runs: Run[] = [];
      collectRuns(el, { bold: false, italic: false }, runs);
      if (runs.some((r) => r.text.trim())) {
        blocks.push({ kind: "para", runs, size: 11, before: 0, after: 7, indent: 0 });
      }
    }
    pushImages(el);
  });
  return blocks;
}

class Writer {
  page!: PDFPage;
  y = 0;
  replaced = 0;
  private safe = new Map<string, boolean>();
  constructor(
    private doc: PDFDocument,
    private fonts: Fonts,
  ) {
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN;
  }
  ensure(h: number) {
    if (this.y - h < MARGIN) this.newPage();
  }
  font(r: { bold: boolean; italic: boolean }) {
    const f = this.fonts;
    return r.bold ? (r.italic ? f.boldItalic : f.bold) : r.italic ? f.italic : f.regular;
  }
  /** Standard PDF fonts only cover Latin (WinAnsi). Swap anything else for "?". */
  clean(text: string) {
    let out = "";
    for (const ch of text) {
      let ok = this.safe.get(ch);
      if (ok === undefined) {
        try {
          this.fonts.regular.encodeText(ch);
          ok = true;
        } catch {
          ok = false;
        }
        this.safe.set(ch, ok);
      }
      if (ok) out += ch;
      else {
        out += "?";
        this.replaced++;
      }
    }
    return out;
  }

  paragraph(b: Extract<Block, { kind: "para" }>) {
    const lineH = b.size * 1.4;
    this.y -= b.before;
    // Split runs into words while keeping their style.
    type Word = { text: string; run: Run; width: number; space: number };
    const lines: Word[][] = [[]];
    let lineW = 0;
    const maxW = CONTENT_W - b.indent;
    for (const run of b.runs) {
      if (run.text === "\n") {
        lines.push([]);
        lineW = 0;
        continue;
      }
      const font = this.font(run);
      const pieces = this.clean(run.text).split(/(\s+)/);
      for (const piece of pieces) {
        if (!piece) continue;
        if (/^\s+$/.test(piece)) {
          const cur = lines[lines.length - 1];
          if (cur.length) cur[cur.length - 1].space = font.widthOfTextAtSize(" ", b.size);
          continue;
        }
        const width = font.widthOfTextAtSize(piece, b.size);
        const cur = lines[lines.length - 1];
        const prevSpace = cur.length ? cur[cur.length - 1].space : 0;
        if (cur.length && lineW + prevSpace + width > maxW) {
          lines.push([{ text: piece, run, width, space: 0 }]);
          lineW = width;
        } else {
          cur.push({ text: piece, run, width, space: 0 });
          lineW += prevSpace + width;
        }
      }
    }
    lines.forEach((line, i) => {
      this.ensure(lineH);
      this.y -= b.size;
      if (i === 0 && b.marker) {
        this.page.drawText(b.marker, {
          x: MARGIN + b.indent - 14,
          y: this.y,
          size: b.size,
          font: this.fonts.regular,
          color: TEXT,
        });
      }
      // Draw consecutive words of the same style as one string so copied
      // text keeps its spaces.
      let x = MARGIN + b.indent;
      let k = 0;
      while (k < line.length) {
        const run = line[k].run;
        const same = (r: Run) =>
          r.bold === run.bold && r.italic === run.italic && !!r.link === !!run.link;
        let text = line[k].text;
        let j = k + 1;
        while (j < line.length && same(line[j].run)) {
          text += " " + line[j].text;
          j++;
        }
        const font = this.font(run);
        this.page.drawText(text, {
          x,
          y: this.y,
          size: b.size,
          font,
          color: run.link ? rgb(0.1, 0.3, 0.75) : TEXT,
        });
        x += font.widthOfTextAtSize(text, b.size) + line[j - 1].space;
        k = j;
      }
      this.y -= lineH - b.size;
    });
    this.y -= b.after;
  }

  async image(src: string) {
    const [meta, data] = src.split(",");
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    let img;
    try {
      if (meta.includes("png")) img = await this.doc.embedPng(bytes);
      else if (meta.includes("jpeg") || meta.includes("jpg")) img = await this.doc.embedJpg(bytes);
      else return; // EMF/WMF/GIF etc. are skipped
    } catch {
      return;
    }
    const maxH = PAGE_H - MARGIN * 2;
    const scale = Math.min(1, CONTENT_W / img.width, maxH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    this.ensure(h + 8);
    this.y -= h;
    this.page.drawImage(img, { x: MARGIN, y: this.y, width: w, height: h });
    this.y -= 10;
  }

  table(rows: string[][]) {
    const cols = Math.max(...rows.map((r) => r.length));
    const colW = CONTENT_W / cols;
    const size = 9.5;
    const pad = 4;
    const lineH = size * 1.3;
    const font = this.fonts.regular;
    const wrap = (text: string) => {
      const words = this.clean(text).split(" ");
      const lines: string[] = [];
      let cur = "";
      for (const word of words) {
        const next = cur ? `${cur} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > colW - pad * 2 && cur) {
          lines.push(cur);
          cur = word;
        } else cur = next;
      }
      lines.push(cur);
      return lines;
    };
    this.y -= 4;
    rows.forEach((row, ri) => {
      const cells = Array.from({ length: cols }, (_, i) => wrap(row[i] ?? ""));
      const h = Math.max(...cells.map((c) => c.length)) * lineH + pad * 2;
      this.ensure(h);
      cells.forEach((lines, ci) => {
        const x = MARGIN + ci * colW;
        this.page.drawRectangle({
          x,
          y: this.y - h,
          width: colW,
          height: h,
          borderColor: rgb(0.75, 0.75, 0.78),
          borderWidth: 0.6,
          color: ri === 0 ? rgb(0.95, 0.95, 0.96) : undefined,
        });
        lines.forEach((line, li) =>
          this.page.drawText(line, {
            x: x + pad,
            y: this.y - pad - size - li * lineH,
            size,
            font: ri === 0 ? this.fonts.bold : font,
            color: TEXT,
          }),
        );
      });
      this.y -= h;
    });
    this.y -= 10;
  }

  rule() {
    this.ensure(12);
    this.y -= 6;
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.6,
      color: rgb(0.7, 0.7, 0.72),
    });
    this.y -= 6;
  }
}

export async function wordToPdf(file: File) {
  if (!/\.docx$/i.test(file.name)) {
    throw new Error(
      "Only .docx files are supported. In Word, use File › Save As › Word Document (.docx) first.",
    );
  }
  const mammoth = await import("mammoth");
  const { value: html } = await mammoth.convertToHtml(
    { arrayBuffer: await file.arrayBuffer() },
    { styleMap: ["p[style-name='Title'] => h1:fresh", "p[style-name='Subtitle'] => h2:fresh"] },
  );
  const blocks = htmlToBlocks(html);
  if (blocks.length === 0) throw new Error("This document looks empty.");

  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
  };
  const w = new Writer(doc, fonts);
  for (const b of blocks) {
    if (b.kind === "para") w.paragraph(b);
    else if (b.kind === "image") await w.image(b.src);
    else if (b.kind === "table") w.table(b.rows);
    else w.rule();
  }
  doc.setTitle(file.name.replace(/\.docx$/i, ""));
  const bytes = await doc.save({ useObjectStreams: true });
  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    note:
      w.replaced > 0
        ? `${w.replaced} character(s) outside the Latin alphabet (e.g. Sinhala, Tamil, Arabic) couldn't be shown and were replaced with “?”.`
        : "Converted with selectable text. Complex layouts (text boxes, columns) are simplified.",
  };
}
