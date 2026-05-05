const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "client", "src");
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
let changedFiles = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (ent.isFile() && exts.has(path.extname(ent.name))) {
      let content = fs.readFileSync(full, "utf8");
      if (content.includes("@/src/")) {
        const updated = content.split("@/src/").join("@/");
        fs.writeFileSync(full, updated, "utf8");
        console.log("Updated", full);
        changedFiles++;
      }
    }
  }
}

if (!fs.existsSync(root)) {
  console.error("client/src not found at", root);
  process.exit(1);
}

walk(root);
console.log("Done. Files changed:", changedFiles);
