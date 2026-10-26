import { rmSync } from "node:fs";

// Vite clears dist/client, but finalized Pages files live directly in dist.
// Remove only generated output, including obsolete article pages and redirects.
rmSync(new URL("../dist/", import.meta.url), { recursive: true, force: true });
