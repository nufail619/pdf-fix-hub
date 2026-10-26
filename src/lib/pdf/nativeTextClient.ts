import type { NativeInspection, TextEdit } from "./nativeTextCore.ts";
export function nativeText(file: File, edits?: TextEdit[]): Promise<NativeInspection | Uint8Array> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./nativeText.worker.ts", import.meta.url), {
      type: "module",
    });
    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error("Text analysis took too long. Try a smaller PDF."));
    }, 60000);
    const close = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    worker.onmessage = (event) => {
      close();
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.result);
    };
    worker.onerror = () => {
      close();
      reject(
        new Error(
          "The local text-editing engine could not run. Your original file has not changed.",
        ),
      );
    };
    file
      .arrayBuffer()
      .then((bytes) => worker.postMessage({ bytes, edits }, [bytes]))
      .catch((error) => {
        close();
        reject(error);
      });
  });
}
