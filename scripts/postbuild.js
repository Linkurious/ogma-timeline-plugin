import fs from "fs/promises";
import path from "path";

fs.readFile("package.json", { encoding: "utf-8" })
  .then((file) => {
    const pkg = JSON.parse(file);
    const ogmaVersion = pkg.dependencies["@linkurious/ogma"];
    ["main", "module", "types"].forEach((key) => {
      pkg[key] = pkg[key].replace("dist", ".");
    });
    pkg.files = pkg.files.map((filename) => filename.replace("dist", "."));
    pkg.devDependencies = {};
    delete pkg.dependencies["@linkurious/ogma"];
    delete pkg.engines;
    delete pkg.scripts;
    pkg.peerDependencies["@linkurious/ogma"] = ogmaVersion;
    return fs.writeFile(
      path.resolve("dist/package.json"),
      JSON.stringify(pkg, 0, 2),
      "utf-8"
    );
  })
  .catch((e) => {
    console.log("Error writing JSON", err);
  });
