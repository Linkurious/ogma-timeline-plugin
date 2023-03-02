import fs from "fs/promises";
import path from "path";

fs.readFile("package.json", { encoding: "utf-8" })
  .then((file) => {
    const pkg = JSON.parse(file);
    const ogmaVersion = pkg.dependencies["@linkurious/ogma"];
    pkg.devDependencies = {};
    delete pkg.dependencies["@linkurious/ogma"];
    delete pkg.engines;
    delete pkg.scripts;
    pkg.peerDependencies["@linkurious/ogma"] = ogmaVersion;
    // return fs.writeFile(
    //   path.resolve("dist/package.json"),
    //   JSON.stringify(pkg, 0, 2),
    //   "utf-8"
    // );
  })
  .catch((err) => console.log("Error writing JSON", err));
