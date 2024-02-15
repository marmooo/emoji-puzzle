import { basename } from "https://deno.land/std/path/mod.ts";
import { expandGlobSync } from "https://deno.land/std/fs/mod.ts";
import { ttf2svg } from "npm:@marmooo/ttf2svg@0.1.4";

function parseTTF(inFile, outDir, options = {}) {
  Deno.mkdirSync(outDir, { recursive: true });
  const svgs = ttf2svg(inFile, undefined, options);
  for (const { glyph, svg } of svgs) {
    if (!glyph.unicode) continue;
    if (!svg) continue;
    const { x1 } = glyph.getBoundingBox();
    const fileName = Number(glyph.unicode).toString(16);
    const char = String.fromCodePoint(glyph.unicode);
    if (x1 < 0) {
      console.log("x1", x1, glyph.unicode, fileName, char);
      continue;
    }
    // if (y1 < 0) {
    //   console.log("y1", y1, glyph.unicode, fileName, char);
    //   continue;
    // }
    Deno.writeTextFileSync(`${outDir}/${fileName}.svg`, svg);
  }
}

function notoEmojiTwotone() {
  console.log("Noto Emoji Twotone");
  parseTTF("vendor/NotoEmoji[wght].ttf", "svg/noto-emoji-twotone");
}

function androidEmoji() {
  console.log("Android Emoji");
  parseTTF("vendor/AndroidEmoji.ttf", "svg/android-emoji");
}

function fluentUIEmoji() {
  console.log("Fluent UI Emoji");
  const dir = "svg/fluentui-emoji";
  try {
    Deno.statSync(dir);
    Deno.removeSync(dir, { recursive: true });
  } catch {
    // skip
  }
  Deno.mkdirSync(`${dir}-flat`, { recursive: true });
  Deno.mkdirSync(`${dir}-high-contrast`, { recursive: true });
  const glob = expandGlobSync("vendor/fluentui-emoji/assets/**/*.svg", {
    globstar: true,
  });
  for (const file of glob) {
    const fileName = basename(file.path);
    if (fileName.endsWith("flat.svg")) {
      const name = fileName.slice(0, -9);
      Deno.copyFileSync(file.path, `${dir}-flat/${name}.svg`);
    } else if (fileName.endsWith("high_contrast.svg")) {
      const name = fileName.slice(0, -18);
      Deno.copyFileSync(file.path, `${dir}-high-contrast/${name}.svg`);
    }
  }
}

notoEmojiTwotone();
androidEmoji();
fluentUIEmoji();
