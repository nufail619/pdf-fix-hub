import { PDFDocument } from "pdf-lib";

export async function unlockPdf(file: File, password: string, authorized: boolean) {
  if (!authorized)
    throw new Error("Confirm that you own this PDF or have permission to unlock it.");
  const data = await file.arrayBuffer();
  const worker = new Worker(new URL("./unlock.worker.ts", import.meta.url), { type: "module" });
  try {
    const result = await new Promise<ArrayBuffer>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Unlocking timed out. Try a smaller PDF or another device.")),
        120000,
      );
      worker.onmessage = (event: MessageEvent<{ data?: ArrayBuffer; error?: string }>) => {
        clearTimeout(timeout);
        if (event.data.data) resolve(event.data.data);
        else reject(new Error(event.data.error || "This encrypted PDF is unsupported."));
      };
      worker.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("The local PDF unlock engine could not load. Reload and try again."));
      };
      worker.postMessage({ data, password }, [data]);
      password = "";
    });
    // Independently reject an output that remains encrypted or cannot be parsed.
    try {
      await PDFDocument.load(result);
    } catch {
      throw new Error("This encrypted PDF is unsupported. No unlocked file was produced.");
    }
    return new Blob([result], { type: "application/pdf" });
  } finally {
    password = "";
    worker.terminate();
  }
}
