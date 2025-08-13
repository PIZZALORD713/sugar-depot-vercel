import { readdirSync, statSync } from "fs";
import { join, sep } from "path";

const roots = ["app", join("src", "app")];

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "_not-found") yield full;
      yield* walk(full);
    }
  }
}

let hits = [];
for (const root of roots) {
  try {
    for (const p of walk(join(process.cwd(), root))) hits.push(p);
  } catch {}
}

if (hits.length) {
  console.log("[diagnose-not-found] Found invalid folders:");
  for (const p of hits) console.log("  -", p.replace(process.cwd() + sep, ""));
} else {
  console.log("[diagnose-not-found] OK: no _not-found folders");
}
