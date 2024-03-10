import { shape2path } from "https://cdn.jsdelivr.net/npm/@marmooo/shape2path@0.0.2/+esm";
import { toPixelData } from "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm";

const courseNode = document.getElementById("course");
const audioContext = new AudioContext();
const audioBufferCache = {};
loadAudio("modified", "/emoji-puzzle/mp3/decision50.mp3");
loadAudio("correctAll", "/emoji-puzzle/mp3/correct1.mp3");
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

async function playAudio(name, volume) {
  const audioBuffer = await loadAudio(name, audioBufferCache[name]);
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    sourceNode.connect(gainNode);
    sourceNode.start();
  } else {
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
  }
}

async function loadAudio(name, url) {
  if (audioBufferCache[name]) return audioBufferCache[name];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBufferCache[name] = audioBuffer;
  return audioBuffer;
}

function unlockAudio() {
  audioContext.resume();
}

function changeLang() {
  const langObj = document.getElementById("lang");
  const lang = langObj.options[langObj.selectedIndex].value;
  location.href = `/emoji-puzzle/${lang}/`;
}

function createPath(node) {
  const path = document.createElementNS(svgNamespace, "path");
  for (const attribute of node.attributes) {
    path.setAttribute(attribute.name, attribute.value);
  }
  return path;
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => {
    return characters[Math.floor(Math.random() * characters.length)];
  }).join("");
}

function uniqIds(svg) {
  const ids = {};
  [...svg.querySelectorAll("[id]")].forEach((node) => {
    const id = node.getAttribute("id");
    const newId = `id_${generateRandomString(64)}`;
    node.setAttribute("id", newId);
    ids[id] = newId;
  });
  [...svg.getElementsByTagName("*")].forEach((node) => {
    for (const attr of node.attributes) {
      if (attr.value.startsWith("url(#")) {
        const id = attr.value.slice(5, -1);
        const newId = ids[id];
        if (newId) {
          attr.value = `url(#${newId})`;
        } else {
          console.log("uniqIds error");
        }
      }
    }
  });
}

function resetTransforms(svg) {
  // getCTM() requires visibility=visible & numerical width/height attributes
  const viewBox = getViewBox(svg);
  svg.setAttribute("width", viewBox[2]);
  svg.setAttribute("height", viewBox[3]);
  const transforms = [];
  for (const node of svg.querySelectorAll("path, text")) {
    transforms.push([node, node.getCTM()]);
  }
  for (const node of svg.querySelectorAll("[transform]")) {
    node.removeAttribute("transform");
  }
  transforms.forEach(([node, ctm]) => {
    const matrix = DOMMatrix.fromMatrix(ctm);
    node.style.transform = matrix.toString();
  });
}

function removeUseTags(svg) {
  const uses = [...svg.getElementsByTagName("use")];
  for (const use of uses) {
    let id = use.getAttributeNS(xlinkNamespace, "href").slice(1);
    if (!id) id = use.getAttribute("href").slice(1); // SVG 2
    if (!id) continue;
    const g = svg.getElementById(id).cloneNode(true);
    for (const attribute of use.attributes) {
      if (attribute.localName == "href") continue;
      g.setAttribute(attribute.name, attribute.value);
    }
    g.removeAttribute("id");
    use.replaceWith(g);
  }
}

// https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
function lengthToPixel(str) {
  const x = parseFloat(str);
  switch (str.slice(0, -2)) {
    case "cm":
      return x / 96 * 2.54;
    case "mm":
      return x / 96 * 254;
    case "in":
      return x / 96;
    case "pc":
      return x * 16;
    case "pt":
      return x / 96 * 72;
    case "px":
      return x;
    default:
      return x;
  }
}

function getViewBox(svg) {
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    return viewBox.split(" ").map(Number);
  } else {
    const width = lengthToPixel(svg.getAttribute("width"));
    const height = lengthToPixel(svg.getAttribute("height"));
    return [0, 0, width, height];
  }
}

function setViewBox(svg) {
  const viewBox = getViewBox(svg);
  svg.setAttribute("viewBox", viewBox.join(" "));
}

async function fetchIconList(course) {
  const response = await fetch(`/emoji-puzzle/data/${course}.txt`);
  const text = await response.text();
  return text.trimEnd().split("\n");
}

async function fetchIcon(url) {
  console.log(url);
  const response = await fetch(url);
  const svg = await response.text();
  return new DOMParser().parseFromString(svg, "image/svg+xml");
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
const presentationAttributes = new Set([
  "alignment-baseline",
  "baseline-shift",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cursor",
  // "d",
  "direction",
  "display",
  "dominant-baseline",
  "enable-background",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "image-rendering",
  "kerning",
  "letter-spacing",
  "lighting-color",
  "marker-end",
  "marker-mid",
  "marker-start",
  "mask",
  "opacity",
  "overflow",
  "pointer-events",
  "shape-rendering",
  "solid-color",
  "solid-opacity",
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "text-anchor",
  "text-decoration",
  "text-rendering",
  "transform",
  "unicode-bidi",
  "vector-effect",
  "visibility",
  "word-spacing",
  "writing-mode",
]);

function removeSvgTagAttributes(svg) {
  const candidates = [];
  [...svg.attributes].forEach((attribute) => {
    if (presentationAttributes.has(attribute.name)) {
      candidates.push(attribute);
      svg.removeAttribute(attribute.name);
    }
  });
  if (candidates.length > 0) {
    const g = document.createElementNS(svgNamespace, "g");
    candidates.forEach((attribute) => {
      g.setAttribute(attribute.name, attribute.value);
    });
    [...svg.children].forEach((node) => {
      g.appendChild(node);
    });
    svg.appendChild(g);
  }
}

function styleAttributeToAttributes(svg) {
  [...svg.querySelectorAll("[style]")].forEach((node) => {
    node.getAttribute("style").split(";").forEach((style) => {
      const [property, value] = style.split(":").map((str) => str.trim());
      if (presentationAttributes.has(property)) {
        node.setAttribute(property, value);
        node.style.removeProperty(property);
      }
    });
  });
}

function pieceUpEvent() {
  if (!drag.isMouseDown) return;
  drag.target.style.cursor = "grab";
  drag.isMouseDown = false;
  scoring(svg);
}

function pieceMoveEvent(event) {
  if (!drag.isMouseDown) return;
  const { minX, minY, maxX, maxY, scale, x, y } = drag;
  let clientX = event.clientX;
  let clientY = event.clientY;
  if (clientX < minX) clientX = minX;
  if (clientY < minY) clientY = minY;
  if (maxX < clientX) clientX = maxX;
  if (maxY < clientY) clientY = maxY;
  const prevArray = drag.target.style.transform
    .slice(7, -1).split(",").map(Number);
  const prevMatrix = new DOMMatrix(prevArray);
  const tx = (clientX - x) / scale;
  const ty = (clientY - y) / scale;
  const p = new DOMPoint(tx, ty).matrixTransform(prevMatrix.inverse());
  const moveMatrix = new DOMMatrix([1, 0, 0, 1, p.x, p.y]);
  drag.target.style.transform = prevMatrix.multiply(moveMatrix).toString();
}

function pieceDownEvent(event, ratio) {
  const { clientX, clientY } = event;
  const target = document.elementsFromPoint(clientX, clientY)
    .find((node) => node.tagName == "path" || node.tagName == "text");
  target.style.cursor = "grabbing";
  if (target) {
    drag.id = event.identifier || Date.now();
    drag.target = target;
    const transform = target.style.transform;
    const matrix = transform
      ? transform.slice(7, -1).split(",").map(Number)
      : [1, 0, 0, 1, 0, 0];
    const [px, py] = matrix.slice(4);
    const scale = svg.getBoundingClientRect().width / getViewBox(svg)[3];
    drag.scale = scale;
    drag.x = clientX - px * scale;
    drag.y = clientY - py * scale;
    const svgRect = svg.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const centerX = targetRect.left + targetRect.width / 2;
    const centerY = targetRect.top + targetRect.height / 2;
    const dx = centerX - clientX;
    const dy = centerY - clientY;
    const widthRange = targetRect.width * ratio;
    const heightRange = targetRect.height * ratio;
    drag.minX = svgRect.left - dx - widthRange;
    drag.minY = svgRect.top - dy - heightRange;
    drag.maxX = svgRect.right - dx + widthRange;
    drag.maxY = svgRect.bottom - dy + heightRange;
    drag.isMouseDown = true;
  }
}

function draggable(svg) {
  const ratio = motionRatio - 0.5;
  svg.addEventListener("mouseup", pieceUpEvent);
  svg.addEventListener("mousemove", pieceMoveEvent);
  svg.addEventListener("touchend", pieceUpEvent);
  svg.addEventListener("touchmove", (event) => {
    for (let i = 0; event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (touch.identifier == drag.id) {
        pieceMoveEvent(touch);
      }
    }
  });
  [...svg.querySelectorAll("path, text")].forEach((path) => {
    path.addEventListener("mousedown", (event) => {
      pieceDownEvent(event, ratio);
    });
    path.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      pieceDownEvent(touch, ratio);
    });
  });
}

function drawLatice(svg) {
  const n = 10;
  const path = document.createElementNS(svgNamespace, "path");
  const viewBox = getViewBox(svg);
  const width = viewBox[2] - viewBox[0];
  const height = viewBox[3] - viewBox[1];
  const strokeWidth = width / svg.getBoundingClientRect().width;
  const widthStep = (height - strokeWidth) / n;
  const heightStep = (height - strokeWidth) / n;
  const left = (width - height) / 2;
  const pathData = [["M", left, 0]];
  for (let i = 0; i <= n; i++) {
    pathData.push(["h", height]);
    pathData.push(["m", -height, heightStep]);
  }
  pathData.push(["M", left, 0]);
  for (let i = 0; i <= n; i++) {
    pathData.push(["v", height]);
    pathData.push(["m", widthStep, -height]);
  }
  const d = pathData.map((segment) => segment.join(" ")).join(" ");
  path.setAttribute("d", d);
  path.setAttribute("stroke", "gray");
  path.setAttribute("stroke-width", strokeWidth);
  svg.appendChild(path);
}

function shuffle(svg) {
  const svgRect = svg.getBoundingClientRect();
  const svgX = svgRect.x + svgRect.width / 2;
  const svgY = svgRect.y + svgRect.height / 2;
  const scale = svgRect.width / getViewBox(svg)[3];
  [...svg.querySelectorAll("path, text")].forEach((path) => {
    const pathRect = path.getBoundingClientRect();
    const pathX = pathRect.x + pathRect.width / 2;
    const pathY = pathRect.y + pathRect.height / 2;
    const prevArray = path.style.transform
      .slice(7, -1).split(",").map(Number);
    const prevMatrix = new DOMMatrix(prevArray);
    const tx = (svgX - pathX) * scale;
    const ty = (svgY - pathY) * scale;
    const p = new DOMPoint(tx, ty).matrixTransform(prevMatrix.inverse());
    const moveMatrix = new DOMMatrix([1, 0, 0, 1, p.x, p.y]);
    path.style.transform = prevMatrix.multiply(moveMatrix).toString()
    path.style.cursor = "grab";
  });
}

async function nextProblem() {
  maxScore = clearScore;
  const courseNode = document.getElementById("course");
  const course = courseNode.options[courseNode.selectedIndex].value;
  if (iconList.length == 0) {
    iconList = await fetchIconList(course);
  }
  const filePath = iconList[getRandomInt(0, iconList.length)];
  const url = `/svg/${course}/${filePath}`;
  const icon = await fetchIcon(url);
  svg = icon.documentElement;
  styleAttributeToAttributes(svg);
  const tehon = svg.cloneNode(true);

  removeSvgTagAttributes(svg);
  shape2path(svg, createPath, { circleAlgorithm: "QuadBezier" });
  removeUseTags(svg);
  uniqIds(svg);

  const targets = document.querySelectorAll("#problems .iconContainer");
  targets[0].replaceChildren(tehon);
  targets[1].replaceChildren(svg);

  resetTransforms(svg);
  problem = [];
  [...svg.querySelectorAll("path, text")].forEach((path) => {
    problem.push({ path });
  });
  draggable(svg);
  shuffle(svg);

  tehon.style.width = "100%";
  tehon.style.height = "100%";
  svg.style.width = "100%";
  svg.style.height = "100%";
  setViewBox(svg);
  tehon.setAttribute("viewBox", svg.getAttribute("viewBox"));
  drawLatice(tehon);
  drawLatice(svg);
  tehonPixels = await toPixelData(tehon, htmlToImageOptions);
}

async function changeCourse() {
  const course = courseNode.options[courseNode.selectedIndex].value;
  iconList = await fetchIconList(course);
  selectAttribution(courseNode.selectedIndex);
  nextProblem();
}

function selectRandomCourse() {
  const index = getRandomInt(0, courseNode.options.length);
  courseNode.options[index].selected = true;
  selectAttribution(index);
}

function selectAttribution(index) {
  const divs = [...document.getElementById("attribution").children];
  divs.forEach((div, i) => {
    if (i == index) {
      div.classList.remove("d-none");
    } else {
      div.classList.add("d-none");
    }
  });
}

async function scoring(svg) {
  const pixels = await toPixelData(svg, htmlToImageOptions);
  let correctCount = 0;
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] == tehonPixels[i]) correctCount += 1;
  }
  const score = Math.round(correctCount / pixels.length * 100);
  if (maxScore < score) {
    maxScore = score;
    playAudio("correctAll");
  } else {
    playAudio("modified");
  }
  document.getElementById("score").textContent = score;
}

const svgNamespace = "http://www.w3.org/2000/svg";
const xlinkNamespace = "http://www.w3.org/1999/xlink";
const drag = {
  id: null,
  target: null,
  isMouseDown: false,
  x: 0,
  y: 0,
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
  scale: 1,
};
const clearScore = 85;
const motionRatio = 0.8;
const htmlToImageOptions = { width: 256, height: 256 };
let svg;
let problem;
let iconList = [];
let tehonPixels;
let maxScore = clearScore;

selectRandomCourse();
nextProblem();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("lang").onchange = changeLang;
document.getElementById("startButton").onclick = nextProblem;
courseNode.onclick = changeCourse;
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
