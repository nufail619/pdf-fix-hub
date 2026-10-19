import { PDFDocument } from "pdf-lib";

export type MetadataInput = {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  clear?: boolean;
};

export async function readMetadata(file: File) {
  const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), {
    updateMetadata: false,
    ignoreEncryption: true,
  });
  return {
    title: doc.getTitle() ?? "",
    author: doc.getAuthor() ?? "",
    subject: doc.getSubject() ?? "",
    keywords: doc.getKeywords() ?? "",
  };
}

export async function editMetadata(file: File, input: MetadataInput) {
  const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), {
    updateMetadata: false,
  });
  if (input.clear) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setCreator("");
    doc.setProducer("");
  } else {
    if (input.title !== undefined) doc.setTitle(input.title.trim());
    if (input.author !== undefined) doc.setAuthor(input.author.trim());
    if (input.subject !== undefined) doc.setSubject(input.subject.trim());
    if (input.keywords !== undefined)
      doc.setKeywords(
        input.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      );
  }
  doc.setModificationDate(new Date());
  const bytes = await doc.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
