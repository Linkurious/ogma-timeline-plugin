#!/bin/node
const fs = require("fs");
const path = require("path");
const package = require("../package.json");

const ogmaVersion = package.dependencies["@linkurious/ogma"];

package.devDependencies = {};
delete package.dependencies["@linkurious/ogma"];
delete package.scripts;
package.peerDependencies["@linkurious/ogma"] = ogmaVersion;
fs.writeFile(
  path.resolve("package.json"),
  JSON.stringify(package, 0, 2),
  "utf-8",
  (err) => {
    console.log("wirte", err);
  }
);
