import createModule from "@neslinesli93/qpdf-wasm";
import wasmUrl from "@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url";

// One short-lived Worker per attempt. Passwords never enter storage or a request.
self.onmessage = async (event: MessageEvent<{ data: ArrayBuffer; password: string }>) => {
  let password = event.data.password;
  event.data.password = "";
  try {
    let diagnostics = "";
    const capture = (...values: unknown[]) => {
      diagnostics = (diagnostics + values.map(String).join(" ") + "\n").slice(-8192);
    };
    // This Emscripten build binds console directly rather than honoring printErr.
    // Override it only inside this isolated Worker; raw diagnostics stay private.
    console.log = capture;
    console.warn = capture;
    console.error = capture;
    const module = await createModule({
      locateFile: () => wasmUrl,
    });
    const fs = module.FS as typeof module.FS & {
      writeFile: (path: string, bytes: Uint8Array) => void;
      unlink: (path: string) => void;
    };
    fs.writeFile("/input.pdf", new Uint8Array(event.data.data));
    let code;
    try {
      code = module.callMain([`--password=${password}`, "--decrypt", "/input.pdf", "/output.pdf"]);
    } catch {
      code = 2;
    } finally {
      password = "";
    }
    if (code !== 0 && code !== 3) {
      const incorrect = /invalid password|incorrect password/i.test(diagnostics);
      throw new Error(
        incorrect
          ? "The password is incorrect. Please try again."
          : "This encrypted PDF is unsupported or damaged. Certificate encryption and DRM are not supported.",
      );
    }
    const output = fs.readFile("/output.pdf").slice();
    fs.unlink("/input.pdf");
    fs.unlink("/output.pdf");
    self.postMessage({ data: output.buffer }, { transfer: [output.buffer] });
  } catch (error) {
    // Only our safe, fixed messages can leave the Worker.
    const message =
      error instanceof Error &&
      /^(The password is incorrect|This encrypted PDF is unsupported)/.test(error.message)
        ? error.message
        : "This encrypted PDF is unsupported or could not be processed on this device.";
    self.postMessage({ error: message });
  } finally {
    password = "";
    self.close();
  }
};
