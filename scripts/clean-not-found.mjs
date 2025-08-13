import { readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";

function sweep(dir) {
  let removed = 0;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === "_not-found") {
        rmSync(full, { recursive: true, force: true });
        console.log("[clean-not-found] removed:", full);
        removed++;
      } else {
        removed += sweep(full);
      }
    }
  }
  return removed;
}

try {
  const appDir = join(process.cwd(), "app");
  const count = sweep(appDir);
  console.log(`[clean-not-found] done. removed=${count}`);
} catch (e) {
  console.log("[clean-not-found] skipped (no app/ folder or read error).");
}
