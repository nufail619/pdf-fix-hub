import { createServer } from "node:http";
import sirv from "sirv";

// Serve the finalized SPA, which intentionally has no SSR server bundle.
createServer(sirv("dist", { single: true })).listen(4173, "127.0.0.1", () => {
  console.log("PDF tool production test server listening on port 4173");
});
