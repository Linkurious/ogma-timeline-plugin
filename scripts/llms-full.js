// Builds docs/public/llms-full.txt: llms.txt + docs pages + typings. Run after `tsc`.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");
const pages = ["getting-started", "API", "filtering", "timebars", "grouping", "styling", "selecting", "timezone"];
const types = readdirSync("dist/types").filter((f) => f.endsWith(".d.ts")).sort();

const out = [
  read("docs/public/llms.txt"),
  ...pages.map((p) => `\n\n---\n\n<!-- docs/${p}.md -->\n\n${read(`docs/${p}.md`)}`),
  "\n\n---\n\n# TypeScript typings\n",
  ...types.map((f) => `\n## ${f}\n\n\`\`\`ts\n${read(`dist/types/${f}`)}\`\`\`\n`),
];
writeFileSync("docs/public/llms-full.txt", out.join(""));
