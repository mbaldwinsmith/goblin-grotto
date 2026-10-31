import "./style.css";
import { Clock } from "./core/clock";
import type { Position } from "./core/types";
import { createGame, dispatch, quantities, step } from "./sim/game";
import {
  costs,
  type Command,
  type Structure,
  position,
  tileAt,
} from "./sim/model";
import { Scene } from "./render/scene";
import { decodeSave, encodeSave, loadGame, saveGame } from "./persistence/save";

export let state = createGame("moss-and-moonlight");
const clock = new Clock();
const scene = new Scene();
type Tool =
  | "inspect"
  | "dig"
  | "stockpile"
  | "cancel"
  | "harvest"
  | "craft"
  | Structure;
let tool: Tool = "inspect";
let selected: Position = position(30, 30);
let ready = false;
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<header><a class="brand" href="./"><span class="sigil">♧</span><span>GOBLIN GROTTO<small>A HOME IN THE ROCK</small></span></a><div id="resources"></div><div class="time"><span id="day"></span><small>EARLY PLAYABLE · 0.1.0-prototype.1</small></div></header>
<div class="workspace"><nav aria-label="Grotto tools"><span class="eyebrow">YOUR INFLUENCE</span><div id="tools"></div><div class="nav-bottom"><button id="home">⌂ <span>Home</span></button><button id="help-button">? <span>How to play</span></button></div></nav>
<main><div class="map-heading"><span class="eyebrow">THE HOLLOW UNDER THE HILL</span><h1>A little cave.<br>A grand beginning.</h1><p>Dig deep. Hoard shinies. Make a home.</p></div><div id="map"></div><div class="map-caption"><span class="live-dot"></span><span id="mode">Inspect your grotto</span><span class="map-hint">Scroll to zoom · Right-drag to pan</span></div><div id="notice" role="status" aria-live="polite">Welcome, Spirit. Plant two mushroom patches, build beds, then carve out a home.</div></main>
<aside><div class="aside-title"><span class="eyebrow">THE GROTTO</span><span class="badge">4 SOULS</span></div><h2>Your little troublemakers</h2><p class="muted">A home is only as good as its goblins.</p><div id="goblins"></div><section class="inspector"><span class="eyebrow">UNDER YOUR GAZE</span><h3 id="tile-name">Cavern floor</h3><div id="inspection"></div><form id="tile-form"><label>X <input id="tile-x" type="number" min="0" max="63" value="30"></label><label>Y <input id="tile-y" type="number" min="0" max="63" value="30"></label><button>Apply tool</button></form><p class="muted">Coordinates also let you work by keyboard.</p></section><section class="goal"><span>✧</span><div><strong>A home, not just a hole</strong><p id="goals">Plant patches · Make beds · Dig a room</p></div></section></aside></div>
<footer><div class="speed" aria-label="Simulation speed"><button data-speed="0" aria-label="Pause">Ⅱ</button><button data-speed="1" aria-pressed="true">1×</button><button data-speed="2">2×</button><button data-speed="4">4×</button></div><span id="seed-label"></span><div class="saves"><button id="save">Save</button><button id="load">Load</button><button id="load-auto">Load auto</button><button id="export">Export</button><label class="file-button">Import<input id="import" type="file" accept=".json"></label><button id="new">New grotto</button></div></footer>
<section class="chronicle"><div><span class="eyebrow">THE CHRONICLE</span><h2>Small lives. Lasting stories.</h2></div><ol id="events"></ol></section>
<dialog id="help"><span class="eyebrow">WELCOME, SPIRIT</span><h2>Make this hollow a home.</h2><p>Your four goblins choose reachable jobs themselves. Select a tool, then click a tile or enter coordinates. Gold outlines are digging jobs; teal outlines are other work.</p><ol><li>Plant two <b>mushroom patches</b> on empty floor. They grow and harvest automatically.</li><li>Build <b>beds</b> with two stored wood each. Goblins eat and rest when they need to.</li><li><b>Dig</b> the exposed rock around your cave. Mark a <b>stockpile</b> on floor to have loose supplies hauled there.</li><li><b>Gather</b> outdoor trees and wild mushrooms. Build a <b>workshop</b>, then use <b>Craft</b> there to turn one wood into a bed kit, automatically used when building a bed.</li></ol><p>Scroll / + / − to zoom. Right-drag or arrow keys to pan. Home recentres. Space pauses. Escape selects Inspect. Browser tabs pause when hidden.</p><p>This prototype has no raids, Souls, possession, or win condition yet. Your goal: a sustainable little home. Saves stay in this browser; export a backup to keep it.</p><button id="close-help">Into the grotto →</button></dialog>
<dialog id="new-dialog"><h2>A fresh beginning</h2><p>Save your current grotto before replacing it.</p><form id="new-form"><label>World seed <input id="new-seed" maxlength="100" value="a-golden-spoon" required></label><button>Begin new grotto</button><button id="cancel-new" type="button">Keep this grotto</button></form></dialog>`;
function el<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}
function notice(text: string): void {
  el("notice").textContent = text;
}
function fail(e: unknown): void {
  notice(e instanceof Error ? e.message : String(e));
}
const buttons: { tool: Tool; label: string; icon: string; hint: string }[] = [
  { tool: "inspect", label: "Inspect", icon: "◇", hint: "Look closer" },
  { tool: "dig", label: "Dig", icon: "⚒", hint: "Expose rock faces" },
  {
    tool: "stockpile",
    label: "Stockpile",
    icon: "▧",
    hint: "Automatic hauling",
  },
  { tool: "farm", label: "Mushroom patch", icon: "♧", hint: "1 stone" },
  { tool: "bed", label: "Bed", icon: "▰", hint: "2 wood" },
  { tool: "workshop", label: "Workshop", icon: "⚒", hint: "3 wood · 2 stone" },
  { tool: "door", label: "Door", icon: "▥", hint: "2 wood" },
  { tool: "wall", label: "Wall", icon: "▦", hint: "2 stone" },
  { tool: "harvest", label: "Gather", icon: "❋", hint: "Mushrooms & trees" },
  { tool: "craft", label: "Craft", icon: "✧", hint: "Use a workshop" },
  { tool: "cancel", label: "Cancel work", icon: "×", hint: "Release a job" },
];
for (const b of buttons) {
  const btn = document.createElement("button");
  btn.dataset.tool = b.tool;
  btn.innerHTML = `<span class="tool-icon">${b.icon}</span><span>${b.label}<small>${b.hint}</small></span>`;
  btn.onclick = () => setTool(b.tool);
  el("tools").append(btn);
}
function setTool(next: Tool): void {
  tool = next;
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-tool]"))
    b.setAttribute("aria-pressed", String(b.dataset.tool === tool));
  el("mode").textContent =
    tool === "inspect"
      ? "Inspect your grotto"
      : `${buttons.find((b) => b.tool === tool)?.label} · Choose a tile`;
}
function choose(p: Position): void {
  if (!tileAt(state, p)) return;
  selected = p;
  scene.selected = p;
  el<HTMLInputElement>("tile-x").value = String(p.x);
  el<HTMLInputElement>("tile-y").value = String(p.y);
  if (tool !== "inspect") {
    const build = tool in costs;
    const command: Command = {
      type: "designate",
      tool: build
        ? "build"
        : (tool as "dig" | "stockpile" | "cancel" | "harvest" | "craft"),
      position: p,
      ...(build ? { structure: tool as Structure } : {}),
    };
    const r = dispatch(state, command);
    notice(
      r.ok
        ? `${buttons.find((b) => b.tool === tool)?.label} planned at ${p.x}, ${p.y}. Your goblins will take it from here.`
        : r.reason,
    );
  }
  update();
}
el("tile-form").onsubmit = (e) => {
  e.preventDefault();
  choose(
    position(
      Number(el<HTMLInputElement>("tile-x").value),
      Number(el<HTMLInputElement>("tile-y").value),
    ),
  );
};
function setSpeed(speed: number): void {
  clock.speed = speed;
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-speed]"))
    b.setAttribute("aria-pressed", String(Number(b.dataset.speed) === speed));
}
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-speed]"))
  b.onclick = () => setSpeed(Number(b.dataset.speed));
el("home").onclick = () => scene.focus(position(32, 30));
el("help-button").onclick = () => el<HTMLDialogElement>("help").showModal();
el("close-help").onclick = () => el<HTMLDialogElement>("help").close();
el("save").onclick = () => {
  void saveGame(state)
    .then(() => notice("Grotto saved in this browser."))
    .catch(fail);
};
el("load").onclick = () => {
  void loadGame()
    .then((s) => {
      state = s;
      scene.focus(position(32, 30));
      notice("Welcome home. Grotto restored.");
      update();
    })
    .catch(fail);
};
el("load-auto").onclick = () => {
  void loadGame("auto")
    .then((s) => {
      state = s;
      notice("Autosaved grotto restored.");
      update();
    })
    .catch(fail);
};
el("export").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([encodeSave(state)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "goblin-grotto-save.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notice("Save exported. Keep it somewhere safe.");
};
el<HTMLInputElement>("import").onchange = async (e) => {
  const input = e.target as HTMLInputElement;
  const f = input.files?.[0];
  if (!f) return;
  try {
    if (f.size > 8_000_000) throw new Error("Save exceeds 8 MB.");
    state = decodeSave(await f.text());
    notice("Imported grotto restored.");
    update();
  } catch (e) {
    fail(e);
  } finally {
    input.value = "";
  }
};
el("new").onclick = () => el<HTMLDialogElement>("new-dialog").showModal();
el("cancel-new").onclick = () => el<HTMLDialogElement>("new-dialog").close();
el("new-form").onsubmit = (e) => {
  e.preventDefault();
  state = createGame(el<HTMLInputElement>("new-seed").value);
  scene.focus(position(32, 30));
  el<HTMLDialogElement>("new-dialog").close();
  notice("A new grotto, a new beginning.");
  update();
};
function update(): void {
  const q = quantities(state);
  el("resources").replaceChildren(
    ...(["food", "wood", "stone", "ore", "bedkit"] as const).map((r) => {
      const span = document.createElement("span");
      span.innerHTML = `<i>${r === "food" ? "♧" : r === "wood" ? "▥" : r === "stone" ? "◆" : "✧"}</i><b>${q[r]}</b><small>${r === "bedkit" ? "kits" : r}</small>`;
      return span;
    }),
  );
  el("day").textContent =
    `Day ${1 + Math.floor(state.tick / 2400)} · ${clock.speed === 0 ? "Paused" : "The early days"}`;
  el("seed-label").textContent = `Seed: ${state.seed}`;
  const list = el("goblins");
  if (!list.children.length)
    for (const [i] of state.goblins.entries()) {
      const b = document.createElement("button");
      b.className = `goblin goblin-${i}`;
      b.onclick = () => {
        const current = state.goblins[i];
        selected = { ...current.position };
        scene.selected = selected;
        scene.focus(state.goblins[i].position);
        update();
      };
      list.append(b);
    }
  state.goblins.forEach((g, i) => {
    const b = list.children[i] as HTMLButtonElement;
    b.replaceChildren();
    const face = document.createElement("span");
    face.className = "face";
    face.textContent = ["◕", "◉", "◕", "◉"][i];
    const info = document.createElement("span");
    info.className = "goblin-info";
    const name = document.createElement("strong");
    name.textContent = g.name;
    const activity = document.createElement("small");
    activity.textContent = g.activity;
    const bars = document.createElement("span");
    bars.className = "needs";
    bars.innerHTML = `<meter min="0" max="100" value="${100 - g.hunger}" aria-label="${g.name} fullness"></meter><meter min="0" max="100" value="${100 - g.fatigue}" aria-label="${g.name} energy"></meter>`;
    info.append(name, activity, bars);
    b.append(face, info);
  });
  const t = tileAt(state, selected)!;
  el("tile-name").textContent = !t.discovered
    ? "Unexplored"
    : t.solid
      ? `${t.material === "loose" ? "Loose rock" : t.material === "hard" ? "Hard stone" : t.material} face`
      : (t.structure ?? (t.outside ? "The world outside" : "Cavern floor"));
  const jobs = state.jobs.filter(
    (j) =>
      j.target.x === selected.x &&
      j.target.y === selected.y &&
      ["active", "open"].includes(j.status),
  );
  el("inspection").textContent =
    `${selected.x}, ${selected.y} · ${t.stockpile ? "Stockpile" : t.solid ? "Needs excavation" : "Walkable"}${t.structure === "farm" ? ` · Growth ${Math.floor(t.growth / 6)}%` : ""}${jobs.map((j) => ` · ${j.kind}: ${j.reason} (${j.progress} work)`).join("")}`;
  const farm = state.tiles.filter((t) => t.structure === "farm").length,
    bed = state.tiles.filter((t) => t.structure === "bed").length,
    dug = state.jobs.some((j) => j.kind === "dig" && j.status === "done");
  el("goals").textContent =
    `${farm >= 2 ? "✓" : "○"} ${farm}/2 patches · ${bed >= 4 ? "✓" : "○"} ${bed}/4 beds · ${dug ? "✓ Room to grow" : "○ Dig a room"}`;
  el("events").replaceChildren(
    ...state.events
      .slice(-5)
      .reverse()
      .map((e) => {
        const li = document.createElement("li");
        const time = document.createElement("small");
        time.textContent = `DAY ${Math.floor(e.tick / 2400) + 1}`;
        const text = document.createElement("span");
        text.textContent = e.text;
        li.append(time, text);
        return li;
      }),
  );
}
async function start(): Promise<void> {
  try {
    await scene.init(el("map"));
    ready = true;
    scene.focus(position(32, 30));
  } catch (e) {
    el("map").textContent =
      "WebGL could not start. Enable hardware acceleration or try another desktop browser.";
    fail(e);
    return;
  }
  const canvas = scene.app.canvas;
  let drag: { x: number; y: number } | null = null;
  canvas.oncontextmenu = (e) => e.preventDefault();
  canvas.onpointerdown = (e) => {
    if (e.button === 2 || e.button === 1) {
      drag = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    } else choose(scene.pick(e.clientX, e.clientY));
  };
  canvas.onpointermove = (e) => {
    if (drag) {
      scene.camera.x += e.clientX - drag.x;
      scene.camera.y += e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
    } else scene.hover = scene.pick(e.clientX, e.clientY);
  };
  const end = () => {
    drag = null;
  };
  canvas.onpointerup = end;
  canvas.onpointercancel = end;
  canvas.onlostpointercapture = end;
  canvas.onpointerleave = () => {
    scene.hover = null;
  };
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scene.camera.zoom = Math.max(
        0.6,
        Math.min(4, scene.camera.zoom * (e.deltaY < 0 ? 1.1 : 0.9)),
      );
    },
    { passive: false },
  );
  let last = performance.now();
  function frame(now: number): void {
    const dt = (now - last) / 1000;
    last = now;
    if (!document.hidden && !document.querySelector("dialog[open]"))
      clock.advance(dt, () => step(state));
    scene.draw(state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setInterval(update, 300);
  setInterval(() => {
    if (!document.hidden) void saveGame(state, "auto").catch(fail);
  }, 30000);
}
document.addEventListener("keydown", (e) => {
  if (
    (e.target as HTMLElement).matches("input,button") ||
    document.querySelector("dialog[open]")
  )
    return;
  const key = e.key;
  if (key === " ") {
    e.preventDefault();
    setSpeed(clock.speed ? 0 : 1);
  }
  if (key === "Escape") setTool("inspect");
  if (key === "Home") scene.focus(position(32, 30));
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
    e.preventDefault();
    scene.camera.x += key === "ArrowLeft" ? 40 : key === "ArrowRight" ? -40 : 0;
    scene.camera.y += key === "ArrowUp" ? 40 : key === "ArrowDown" ? -40 : 0;
  }
  if (key === "+" || key === "=")
    scene.camera.zoom = Math.min(4, scene.camera.zoom * 1.1);
  if (key === "-") scene.camera.zoom = Math.max(0.6, scene.camera.zoom / 1.1);
});
document.addEventListener("visibilitychange", () => {
  clock.accumulator = 0;
});
setTool("inspect");
update();
void start();
export function isReady(): boolean {
  return ready;
}
