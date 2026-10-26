import { init } from "@embedpdf/pdfium";
import wasmUrl from "@embedpdf/pdfium/pdfium.wasm?url";
import { nativeTextJob } from "./nativeTextCore.ts";
self.onmessage = async (event) => {
  try {
    const response = await fetch(wasmUrl);
    if (!response.ok) throw new Error("The local text-editing engine could not load.");
    const lib = await init({ wasmBinary: await response.arrayBuffer() });
    lib.PDFiumExt_Init();
    const result = await nativeTextJob(lib, new Uint8Array(event.data.bytes), event.data.edits);
    self.postMessage({ result });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Existing-text editing failed.",
    });
  }
};
