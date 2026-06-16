import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "/opt/cursor/artifacts/screenshots/mobile-audit";
const VIEWPORTS = [
  { width: 320, height: 568, name: "320x568" },
  { width: 360, height: 800, name: "360x800" },
  { width: 375, height: 812, name: "375x812" },
  { width: 390, height: 844, name: "390x844" },
  { width: 414, height: 896, name: "414x896" },
  { width: 768, height: 1024, name: "768x1024" },
];

const ROUTES = [
  { path: "/empresas", name: "empresas-lista" },
  { path: "/empresas/novo", name: "empresas-novo" },
];

function rectArea(r) {
  return Math.max(0, r.width) * Math.max(0, r.height);
}

function intersectionArea(a, b) {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  const w = right - left;
  const h = bottom - top;
  if (w <= 0 || h <= 0) return 0;
  return w * h;
}

function describeEl(el) {
  const id = el.id ? `#${el.id}` : "";
  const cls = (el.className || "").toString().trim().split(/\s+/).slice(0, 4).join(".");
  const tag = el.tagName.toLowerCase();
  const label = el.getAttribute("aria-label") || el.getAttribute("placeholder") || "";
  const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
  return { tag, id, cls, label, text };
}

async function analyzePage(page) {
  return page.evaluate(() => {
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const doc = document.documentElement;
    const horizontalOverflow = Math.max(doc.scrollWidth - doc.clientWidth, document.body.scrollWidth - document.body.clientWidth);

    const selectors = [
      "button",
      "a",
      "input",
      "textarea",
      "select",
      "[role='button']",
      "[role='combobox']",
      ".mobile-header",
      ".mobile-bottom-bar",
      ".emp-toolbar",
      ".mg-action-bar",
      ".mg-search",
      ".mg-context-panel",
      ".mg-mobile-filter-strip",
      ".emp-table-pagination",
      ".filter-panel",
      ".mobile-menu",
      ".emp-form-mobile-footer",
      "header",
      "h1",
      "h2",
    ];

    const nodes = [...new Set(selectors.flatMap((sel) => [...document.querySelectorAll(sel)]))].filter((el) => {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
      if (rect.right < 0 || rect.left > window.innerWidth) return false;
      return true;
    });

    const rects = nodes.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        el,
        rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
      };
    });

    const overlaps = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;

        const aTag = a.el.tagName;
        const bTag = b.el.tagName;
        const aInteractive = ["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"].includes(aTag) || a.el.getAttribute("role");
        const bInteractive = ["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT"].includes(bTag) || b.el.getAttribute("role");
        if (!aInteractive && !bInteractive) continue;

        const area = intersectionArea(a.rect, b.rect);
        const minArea = Math.min(rectArea(a.rect), rectArea(b.rect));
        if (area <= 0 || minArea <= 0) continue;
        const ratio = area / minArea;
        if (ratio < 0.15) continue;

        const describe = (el) => {
          const id = el.id ? `#${el.id}` : "";
          const cls = (el.className || "").toString().trim().split(/\s+/).slice(0, 5).join(".");
          const tag = el.tagName.toLowerCase();
          const label = el.getAttribute("aria-label") || el.getAttribute("placeholder") || "";
          const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
          return { tag, id, cls, label, text };
        };

        overlaps.push({
          ratio: Number(ratio.toFixed(2)),
          area: Number(area.toFixed(1)),
          a: describe(a.el),
          b: describe(b.el),
        });
      }
    }

    function intersectionArea(x, y) {
      const left = Math.max(x.left, y.left);
      const top = Math.max(x.top, y.top);
      const right = Math.min(x.right, y.right);
      const bottom = Math.min(x.bottom, y.bottom);
      const w = right - left;
      const h = bottom - top;
      if (w <= 0 || h <= 0) return 0;
      return w * h;
    }

    function rectArea(r) {
      return Math.max(0, r.width) * Math.max(0, r.height);
    }

    const clipped = nodes
      .map((el) => {
        const r = el.getBoundingClientRect();
        const out = {
          left: r.left < -1,
          right: r.right > window.innerWidth + 1,
          top: r.top < -1,
          bottom: r.bottom > window.innerHeight + 1,
        };
        if (!out.left && !out.right && !out.top && !out.bottom) return null;
        const tag = el.tagName.toLowerCase();
        const cls = (el.className || "").toString().trim().split(/\s+/).slice(0, 5).join(".");
        return { tag, cls, edges: out, width: Math.round(r.width), height: Math.round(r.height) };
      })
      .filter(Boolean)
      .slice(0, 20);

    return {
      viewport,
      horizontalOverflow,
      overlapCount: overlaps.length,
      overlaps: overlaps.sort((x, y) => y.ratio - x.ratio).slice(0, 25),
      clipped,
    };
  });
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const report = [];

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`http://127.0.0.1:5173${route.path}`, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(2500);

    const file = `${route.name}__${vp.name}.png`;
    const filePath = path.join(OUT_DIR, file);
    await page.screenshot({ path: filePath, fullPage: true });

    const analysis = await analyzePage(page);
    report.push({ route: route.name, viewport: vp.name, screenshot: file, ...analysis });
  }
}

await browser.close();
await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map((r) => ({
  route: r.route,
  viewport: r.viewport,
  horizontalOverflow: r.horizontalOverflow,
  overlapCount: r.overlapCount,
  topOverlaps: r.overlaps.slice(0, 3),
  clipped: r.clipped.slice(0, 3),
})), null, 2));
