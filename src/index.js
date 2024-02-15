import { shape2path } from "https://cdn.jsdelivr.net/npm/@marmooo/shape2path@0.0.2/+esm";
import svgpath from "https://cdn.jsdelivr.net/npm/svgpath@2.6.0/+esm";

const courseNode = document.getElementById("course");
const audioContext = new AudioContext();
const audioBufferCache = {};
loadAudio("error", "/emoji-puzzle/mp3/boyon1.mp3");
loadAudio("correct1", "/emoji-puzzle/mp3/pa1.mp3");
loadAudio("correct2", "/emoji-puzzle/mp3/papa1.mp3");
loadAudio("correctAll", "/emoji-puzzle/mp3/levelup1.mp3");
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

function getTransforms(node) {
  const transforms = [];
  while (node.tagName) {
    const transform = node.getAttribute("transform");
    if (transform) transforms.push(transform);
    node = node.parentNode;
  }
  return transforms.reverse();
}

function removeTransforms(svg) {
  for (const path of svg.getElementsByTagName("path")) {
    const d = path.getAttribute("d");
    const transforms = getTransforms(path);
    if (transforms.length > 0) {
      const newD = svgpath(d);
      transforms.forEach((transform) => {
        newD.transform(transform);
      });
      path.setAttribute("d", newD.toString());
    }
  }
  for (const node of svg.querySelectorAll("[transform]")) {
    node.removeAttribute("transform");
  }
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
  // url = "/svg/bootstrap-icons/shield-fill-check.svg";
  // url = "/svg/majesticons/line/image-circle-story-line.svg";
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

function draggable(svg) {
  document.onmouseup = () => {
    drag.isMouseDown = false;
  }
  document.onmousemove = (event) => {
    if (drag.isMouseDown == true) {
      const tx = (event.clientX - drag.offsetX) * drag.scale;
      const ty = (event.clientY - drag.offsetY) * drag.scale;
      const transform = `translate(${tx},${ty})`;
      drag.target.setAttribute("transform", transform);
    }
  }
  [...svg.querySelectorAll("path")].forEach((path) => {
    path.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const target = document.elementsFromPoint(event.clientX, event.clientY)
        .find((node) => node.tagName == "path");
      if (target) {
        drag.target = target;
        const transform = target.getAttribute("transform");
        const [px, py] = transform
          ? transform.slice(10, -1).split(",").map(Number)
          : [0, 0];
        drag.offsetX = event.clientX - px / drag.scale;
        drag.offsetY = event.clientY - py / drag.scale;
        drag.scale = getViewBox(svg)[3] / svg.getBoundingClientRect().width;
        drag.isMouseDown = true;
      }
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
  const widthStep = (width - strokeWidth) / n;
  const heightStep = (height - strokeWidth) / n;
  const pathData = [["M", 0, 0]];
  for (let i = 0; i <= n; i++) {
    pathData.push(["h", width]);
    pathData.push(["m", -width, heightStep]);
  }
  pathData.push(["M", 0, 0]);
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

async function nextProblem() {
  const courseNode = document.getElementById("course");
  const course = courseNode.options[courseNode.selectedIndex].value;
  if (iconList.length == 0) {
    iconList = await fetchIconList(course);
  }
  const filePath = iconList[getRandomInt(0, iconList.length)];
  const url = `/svg/${course}/${filePath}`;
  const icon = await fetchIcon(url);
  svg = icon.documentElement;
  const tehon = svg.cloneNode(true);
  tehon.style.width = "100%";
  tehon.style.height = "100%";

  styleAttributeToAttributes(svg);
  removeSvgTagAttributes(svg);
  shape2path(svg, createPath, { circleAlgorithm: "QuadBezier" });
  removeUseTags(svg);
  removeTransforms(svg);
  problem = [];
  [...svg.getElementsByTagName("path")].forEach((path) => {
    problem.push({ path });
  });
  draggable(svg);
  setViewBox(svg);
  tehon.setAttribute("viewBox", svg.getAttribute("viewBox"));

  svg.style.width = "100%";
  svg.style.height = "100%";
  const targets = document.querySelectorAll("#problems .iconContainer");
  targets[0].replaceChildren(tehon);
  targets[1].replaceChildren(svg);
  drawLatice(tehon);
  drawLatice(svg);
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

const svgNamespace = "http://www.w3.org/2000/svg";
const xlinkNamespace = "http://www.w3.org/1999/xlink";
const drag = {
  isMouseDown : false,
  target : null,
  offsetX : 0,
  offsetY : 0,
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity,
  scale: 1,
}
let svg;
let problem;
let iconList = [];

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
