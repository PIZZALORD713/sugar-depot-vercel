import { readdirSync, rmSync } from "fs";
import { join } from "path";

const roots = ["app", join("src", "app")];

function sweep(dir) {
  let removed = 0;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_not-found") {
        rmSync(full, { recursive: true, force: true });
        console.log("[clean-not-found] removed:", full.replace(process.cwd() + "/", ""));
        removed++;
      } else {
        removed += sweep(full);
      }
    }
  }
  return removed;
}

let total = 0;
for (const root of roots) {
  total += sweep(join(process.cwd(), root));
}
console.log(`[clean-not-found] done. removed=${total}`);
