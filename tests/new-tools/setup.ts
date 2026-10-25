import { execFileSync } from "node:child_process";
export default function setup() {
  execFileSync("python3", ["tests/new-tools/fixtures.py"], { stdio: "inherit" });
}
