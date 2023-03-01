const fs = require("fs");
const path = require("path");
const package = require("../package.json");

const ogmaVersion = package.dependencies["@linkurious/ogma"];

["main", "module", "types"].forEach((key) => {
  package[key] = package[key].replace("dist", ".");
});
package.files = package.files.map((filename) => filename.replace("dist", "."));
package.devDependencies = {};
delete package.dependencies["@linkurious/ogma"];
delete package.scripts;
package.peerDependencies["@linkurious/ogma"] = ogmaVersion;
fs.writeFile(
  path.resolve("dist/package.json"),
  JSON.stringify(package, 0, 2),
  "utf-8",
  (err) => {
    if (!err) return;
    console.log("Error writing JSON", err);
  }
);
