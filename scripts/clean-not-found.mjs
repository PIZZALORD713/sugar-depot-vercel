import { readdirSync, rmSync } from "fs";
import { join } from "path";

function sweep(dir) {
  let removed = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_not-found") {
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
} catch {
  console.log("[clean-not-found] skipped (no app/ folder or read error).");
}
