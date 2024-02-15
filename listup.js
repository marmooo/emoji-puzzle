import { expandGlobSync } from "https://deno.land/std/fs/expand_glob.ts";

const dirs = [
  "noto-emoji",
  "twemoji",
  "fluentui-emoji-flat",
  "blobmoji",
  "emojitwo",
  "noto-emoji-twotone",
  "fluentui-emoji-high-contrast",
  "android-emoji",
  "emojitwo-twotone",
];
const baseDir = Deno.realPathSync("svg");
for (const dir of dirs) {
  const paths = [];
  const glob = expandGlobSync(`${baseDir}/${dir}/**/*.svg`, { globstar: true });
  for (const file of glob) {
    const path = file.path.slice(baseDir.length + dir.length + 2);
    paths.push(path);
  }
  Deno.writeTextFileSync(`src/data/${dir}.txt`, paths.join("\n"));
}
