import { toolForJob } from "./sim/work-animation";
import {
  inventoryBalances,
  stockpileContents,
  filterLabel,
  nearestStockpile,
} from "./sim/storage";
import { priorityLabels, workLabels } from "./sim/labour";
import { season, DAY_TICKS } from "./sim/climate";
import { movementTicks } from "./sim/navigation";
import "./style.css";
import { Clock } from "./core/clock";
import { Interaction, type Tool } from "./app/interaction";
import type { ActorId, Position } from "./core/types";
import { createGame, dispatch, quantities, step } from "./sim/game";
import {
  costs,
  materials,
  goblinKinds,
  deposits,
  features,
  walkable,
  type Command,
  type Structure,
  type JobPriority,
  type JobKind,
  type Resource,
  type StockpileFilter,
  stockpileFilters,
  resources,
  jobKinds,
  position,
  tileAt,
} from "./sim/model";
import { Scene } from "./render/scene";
import { decodeSave, encodeSave, loadGame, saveGame } from "./persistence/save";

export let state = createGame("moss-and-moonlight");
const clock = new Clock();
const scene = new Scene();
let tool: Tool = "inspect";
const interaction = new Interaction();
let selectedActor: ActorId | null = null;
let selected: Position = position(30, 30);
let ready = false;
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
<header><a class="brand" href="./"><span class="sigil">♧</span><span>GOBLIN GROTTO<small>A HOME IN THE ROCK</small></span></a><div id="resources"></div><div class="time"><span id="day"></span><span id="weather"></span><small>EARLY PLAYABLE · 0.1.0-prototype.14</small></div></header>
<div class="workspace"><nav aria-label="Grotto tools"><span class="eyebrow">YOUR INFLUENCE</span><label id="new-priority-setting" class="work-setting">New work priority<select id="designation-priority" aria-label="New work priority"><option value="1">Low</option><option value="2" selected>Normal</option><option value="3">High</option></select></label><div id="stockpile-options" hidden><label class="work-setting">Stockpile mode<select id="stockpile-mode" aria-label="Stockpile mode"><option value="add">Add or update</option><option value="remove">Remove</option></select></label><label class="work-setting">Goods for new stockpiles<select id="paint-stockpile-filter" aria-label="Goods for new stockpiles"></select></label></div><div id="tools"></div><div class="nav-bottom"><button id="home">⌂ <span>Home</span></button><button id="reveal" aria-pressed="false">◈ <span>Reveal walls</span></button><button id="help-button">? <span>How to play</span></button></div></nav>
<main><div class="map-heading"><span class="eyebrow">THE HOLLOW UNDER THE HILL</span><h1>A little cave.<br>A grand beginning.</h1><p>Dig deep. Hoard shinies. Make a home.</p></div><div id="map"></div><div class="map-caption"><span class="live-dot"></span><span id="mode">Inspect your grotto</span><span class="map-hint">Scroll to zoom · Right-drag to pan</span></div><div id="notice" role="status" aria-live="polite">Welcome, Spirit. Plant two mushroom patches, build beds, then carve out a home.</div></main>
<aside><div class="aside-title"><span class="eyebrow">THE GROTTO</span><span class="badge">4 SOULS</span></div><h2>Your little troublemakers</h2><p class="muted">A home is only as good as its goblins.</p><div id="goblins"></div><section class="inspector"><span class="eyebrow">UNDER YOUR GAZE</span><h3 id="tile-name">Cavern floor</h3><div id="inspection"></div><label id="job-priority-control" class="work-setting" hidden>Work priority<select id="work-priority" aria-label="Work priority"><option value="1">Low</option><option value="2">Normal</option><option value="3">High</option></select></label><div id="actor-inspection"></div><div id="worker-labour" hidden><label class="work-setting">Preferred work<select id="preferred-work" aria-label="Preferred work"><option value="">Any work</option></select></label><p id="choice-reason" class="muted"></p></div><div id="discovery-inspection"></div><section id="stockpile-details" hidden><label class="work-setting">Accept goods<select id="stockpile-filter" aria-label="Accept goods"></select></label><p id="stored-contents" class="muted"></p><button id="remove-stockpile">Remove this stockpile</button></section><p id="loose-goods" class="muted"></p><form id="tile-form"><label>X <input id="tile-x" type="number" min="0" max="63" value="30"></label><label>Y <input id="tile-y" type="number" min="0" max="63" value="30"></label><button>Apply tool</button></form><p class="muted">Coordinates also let you work by keyboard.</p></section><section class="goal"><span>✧</span><div><strong>A home, not just a hole</strong><p id="goals">Plant patches · Make beds · Dig a room</p></div></section></aside></div>
<footer><div class="speed" aria-label="Simulation speed"><button data-speed="0" aria-label="Pause">Ⅱ</button><button data-speed="1" aria-pressed="true">1×</button><button data-speed="2">2×</button><button data-speed="4">4×</button></div><span id="seed-label"></span><div class="saves"><button id="save">Save</button><button id="load">Load</button><button id="load-auto">Load auto</button><button id="export">Export</button><label class="file-button">Import<input id="import" type="file" accept=".json"></label><button id="new">New grotto</button></div></footer>
<details class="chronicle" id="chronicle" open><summary><div><span class="eyebrow">THE CHRONICLE</span><h2>Small lives. Lasting stories.</h2></div></summary><ol id="events"></ol></details>
<dialog id="help"><span class="eyebrow">WELCOME, SPIRIT</span><h2>Make this hollow a home.</h2><p>Your four goblins choose reachable jobs themselves. Set New work priority before designating, or change a planned tile’s Work priority in the inspector. Select a goblin to set Preferred work and read why they chose their job. Food shortages and loose ceilings add urgency; hungry or exhausted goblins still look after themselves. Excavating weak ceilings can release falling dust: pause and build a Support within two tiles before the countdown ends. Supports cost one wood and one stone. Rain and snow slow travel outside; the cave stays sheltered. Select Explore and send a goblin to the edge of a known passage to reveal more of the world. Inspect glowing groves, old ruins and other discoveries. Select a tool, then click a tile or enter coordinates. Gold outlines are digging jobs; teal outlines are other work. Haulers take a moment to put down supplies at a stockpile. Miners use picks and tree cutters use axes; work happens when the strike lands. Inspect or Gather a tree by clicking its canopy or root tile. Reveal walls also fades tree canopies. Lanterncap plots have young, growing and mature stages, with two appearances per stage.</p><ol><li>Plant two <b>mushroom patches</b> on empty floor. They grow and harvest automatically.</li><li>Build <b>beds</b> with two stored wood each. Goblins eat and rest when they need to.</li><li><b>Dig</b> the exposed rock around your cave. Mark a <b>stockpile</b> on clear floor and choose which goods it accepts. Drag to paint an area. Use Stockpile mode → Remove to erase an area, or edit a pile in the inspector. Haulers choose reachable matching storage.</li><li><b>Gather</b> outdoor trees and wild mushrooms. Build a <b>workshop</b>, then use <b>Craft</b> there to turn one wood into a bed kit, automatically used when building a bed.</li></ol><p>Scroll / + / − to zoom. Right-drag or arrow keys to pan. Hold the left mouse button to paint work. Reveal walls lets you inspect goblins behind foreground walls. Home recentres. Space pauses. Escape selects Inspect. Browser tabs pause when hidden.</p><p>This prototype has no raids, Souls, possession, or win condition yet. Your goal: a sustainable little home. Saves stay in this browser; export a backup to keep it.</p><button id="close-help">Into the grotto →</button></dialog>
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
const buttons: {
  tool: Tool;
  label: string;
  icon: string;
  hint: string;
  disabled?: boolean;
}[] = [
  { tool: "inspect", label: "Inspect", icon: "◇", hint: "Look closer" },
  {
    tool: "explore",
    label: "Explore",
    icon: "⌖",
    hint: "Scout a known passage",
  },
  { tool: "dig", label: "Dig", icon: "⚒", hint: "Expose rock faces" },
  {
    tool: "stockpile",
    label: "Stockpile",
    icon: "▧",
    hint: "Automatic hauling",
  },
  { tool: "farm", label: "Mushroom patch", icon: "♧", hint: "1 stone" },
  { tool: "bed", label: "Bed", icon: "▰", hint: "2 wood" },
  {
    tool: "support",
    label: "Support",
    icon: "Π",
    hint: "1 wood · 1 stone · 2-tile radius",
  },
  { tool: "workshop", label: "Workshop", icon: "⚒", hint: "3 wood · 2 stone" },
  { tool: "door", label: "Door", icon: "▥", hint: "2 wood" },
  { tool: "wall", label: "Wall", icon: "▦", hint: "2 stone" },
  { tool: "harvest", label: "Gather", icon: "❋", hint: "Mushrooms & trees" },
  { tool: "craft", label: "Craft", icon: "✧", hint: "Use a workshop" },
  { tool: "cancel", label: "Cancel work", icon: "×", hint: "Release a job" },
  {
    tool: "guard",
    label: "Guard",
    icon: "⚑",
    hint: "Requires combat milestone",
    disabled: true,
  },
  {
    tool: "possess",
    label: "Possess",
    icon: "✧",
    hint: "Requires Spirit milestone",
    disabled: true,
  },
];
for (const b of buttons) {
  const btn = document.createElement("button");
  btn.dataset.tool = b.tool;
  btn.disabled = !!b.disabled;
  btn.innerHTML = `<span class="tool-icon">${b.icon}</span><span>${b.label}<small>${b.hint}</small></span>`;
  btn.onclick = () => setTool(b.tool);
  el("tools").append(btn);
}
function setTool(next: Tool): void {
  if (buttons.find((b) => b.tool === next)?.disabled) return;
  interaction.select(next);
  tool = next;
  scene.scouting = tool === "explore";
  el("stockpile-options").hidden = tool !== "stockpile";
  el("new-priority-setting").hidden = tool === "stockpile";
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-tool]"))
    b.setAttribute("aria-pressed", String(b.dataset.tool === tool));
  el("mode").textContent =
    tool === "inspect"
      ? "Inspect your grotto"
      : tool === "explore"
        ? "Explore · Send a goblin to a turquoise frontier dot"
        : `${buttons.find((b) => b.tool === tool)?.label} · Choose a tile`;
}
function choose(p: Position): void {
  if (!tileAt(state, p)) return;
  selected = p;
  selectedActor = null;
  scene.selectedActor = null;
  scene.selected = p;
  el<HTMLInputElement>("tile-x").value = String(p.x);
  el<HTMLInputElement>("tile-y").value = String(p.y);
  if (tool !== "inspect" && tool !== "guard" && tool !== "possess") {
    const build = tool in costs;
    const command: Command = {
      type: "designate",
      tool: build
        ? "build"
        : (tool as
            | "dig"
            | "stockpile"
            | "cancel"
            | "harvest"
            | "craft"
            | "explore"),
      position: p,
      priority: Number(
        el<HTMLSelectElement>("designation-priority").value,
      ) as JobPriority,
      ...(build ? { structure: tool as Structure } : {}),
      ...(tool === "stockpile"
        ? {
            stockpileFilter: el<HTMLSelectElement>("paint-stockpile-filter")
              .value as StockpileFilter,
            stockpileMode: el<HTMLSelectElement>("stockpile-mode").value as
              | "add"
              | "remove",
          }
        : {}),
    };
    const r = dispatch(state, command);
    notice(
      r.ok && tool === "stockpile"
        ? `Stockpile updated at ${p.x}, ${p.y}. Goods stay physical and hauling adjusts automatically.`
        : r.ok
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
  scene.focus(selected);
};
for (const [key, filter] of Object.entries(stockpileFilters))
  for (const id of ["paint-stockpile-filter", "stockpile-filter"]) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = filter.label;
    el(id).append(option);
  }
el("stockpile-mode").onchange = () => {
  el<HTMLSelectElement>("paint-stockpile-filter").disabled =
    el<HTMLSelectElement>("stockpile-mode").value === "remove";
};
el("stockpile-filter").onchange = () => {
  const result = dispatch(state, {
    type: "designate",
    tool: "stockpile",
    position: selected,
    stockpileMode: "add",
    stockpileFilter: el<HTMLSelectElement>("stockpile-filter")
      .value as StockpileFilter,
  });
  notice(
    result.ok
      ? "Storage filter updated. Goods remain here; deliveries will adjust."
      : result.reason,
  );
  update();
};
el("remove-stockpile").onclick = () => {
  const result = dispatch(state, {
    type: "designate",
    tool: "stockpile",
    position: selected,
    stockpileMode: "remove",
  });
  notice(
    result.ok
      ? "Stockpile removed. Its goods remain available to eat or haul elsewhere."
      : result.reason,
  );
  update();
};
for (const kind of jobKinds) {
  const option = document.createElement("option");
  option.value = kind;
  option.textContent = workLabels[kind];
  el("preferred-work").append(option);
}
el("preferred-work").onchange = () => {
  if (!selectedActor) return;
  const value = el<HTMLSelectElement>("preferred-work").value;
  const result = dispatch(state, {
    type: "preference",
    actor: selectedActor,
    work: value ? (value as JobKind) : null,
  });
  notice(
    result.ok
      ? "Preference updated. It guides the next job; urgent food and rest still come first."
      : result.reason,
  );
  update();
};
el("work-priority").onchange = () => {
  const result = dispatch(state, {
    type: "prioritize",
    position: selected,
    priority: Number(
      el<HTMLSelectElement>("work-priority").value,
    ) as JobPriority,
  });
  notice(
    result.ok
      ? "Work priority updated. Active jobs finish before workers choose again."
      : result.reason,
  );
  update();
};
function setSpeed(speed: number): void {
  clock.speed = speed;
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-speed]"))
    b.setAttribute("aria-pressed", String(Number(b.dataset.speed) === speed));
}
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-speed]"))
  b.onclick = () => setSpeed(Number(b.dataset.speed));
el("reveal").onclick = () => {
  scene.reveal = !scene.reveal;
  el("reveal").setAttribute("aria-pressed", String(scene.reveal));
};
el("home").onclick = () => scene.reset();
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
  const q = quantities(state),
    balances = inventoryBalances(state);
  el("resources").replaceChildren(
    ...(["food", "wood", "stone", "ore", "gems", "bedkit"] as const).map(
      (r) => {
        const span = document.createElement("span");
        span.innerHTML = `<i>${r === "food" ? "♧" : r === "wood" ? "▥" : r === "stone" ? "◆" : "✧"}</i><b>${r === "ore" ? q.ore + q.iron + q.copper + q.gold : q[r]}</b><small>${r === "bedkit" ? "crafts" : r}</small>`;
        const kinds: Resource[] =
          r === "ore" ? ["ore", "iron", "copper", "gold"] : [r];
        const count = (bucket: Record<Resource, number>) =>
          kinds.reduce((n, kind) => n + bucket[kind], 0);
        span.title = `Stored ${count(balances.stored)} · Carried ${count(balances.carried)} · Loose ${count(balances.loose)}`;
        if (r === "ore")
          span.title += ` · Mixed ${q.ore} · Iron ${q.iron} · Copper ${q.copper} · Gold ${q.gold}`;
        return span;
      },
    ),
  );
  el("day").textContent =
    `Day ${1 + Math.floor(state.tick / DAY_TICKS)} · ${clock.speed === 0 ? "Paused" : "The early days"}`;
  el("weather").textContent =
    `${season(state)} · ${state.weather.kind === "clear" ? "Clear skies" : state.weather.kind === "rain" ? "Rain outside" : "Snow outside"}`;
  el("seed-label").textContent = `Seed: ${state.seed}`;
  const list = el("goblins");
  if (!list.children.length)
    for (const [i] of state.goblins.entries()) {
      const b = document.createElement("button");
      b.className = `goblin goblin-${i}`;
      b.onclick = () => {
        const current = state.goblins[i];
        selectedActor = current.id;
        scene.selectedActor = current.id;
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
    const portrait = document.createElement("img");
    const tool =
      g.workAction?.kind === "mine"
        ? "pick"
        : g.workAction?.kind === "chop"
          ? "axe"
          : toolForJob(
              state,
              state.jobs.find((j) => j.id === g.job),
            );
    portrait.src = `${import.meta.env.BASE_URL}assets/goblin/base/${g.carrying ? "haul-pose" : tool ? `${tool}-pose` : "idle"}/south.png`;
    portrait.width = 32;
    portrait.height = 32;
    portrait.alt = "";
    face.append(portrait);
    const info = document.createElement("span");
    info.className = "goblin-info";
    const name = document.createElement("strong");
    name.textContent = g.name;
    const activity = document.createElement("small");
    activity.textContent = g.activity;
    const bars = document.createElement("span");
    bars.className = "needs";
    for (const [label, value] of [
      ["fullness", 100 - g.hunger],
      ["energy", 100 - g.fatigue],
    ] as const) {
      const meter = document.createElement("meter");
      meter.min = 0;
      meter.max = 100;
      meter.value = value;
      meter.setAttribute("aria-label", `${g.name} ${label}`);
      bars.append(meter);
    }
    info.append(name, activity, bars);
    b.append(face, info);
  });
  const inspectedActor = state.goblins.find((g) => g.id === selectedActor);
  if (inspectedActor) {
    selected = { ...inspectedActor.position };
    scene.selectedActor = inspectedActor.id;
  }
  el("actor-inspection").textContent = inspectedActor
    ? `${inspectedActor.name} · ${goblinKinds[inspectedActor.kind].label} · Facing ${inspectedActor.facing} · ${inspectedActor.activity} · Fullness ${Math.round(100 - inspectedActor.hunger)}% · Energy ${Math.round(100 - inspectedActor.fatigue)}%`
    : "";
  el("worker-labour").hidden = !inspectedActor;
  if (inspectedActor) {
    el<HTMLSelectElement>("preferred-work").value =
      inspectedActor.preferredWork ?? "";
    const job = state.jobs.find((j) => j.id === inspectedActor.job);
    el("choice-reason").textContent = job
      ? `Chose ${workLabels[job.kind].toLowerCase()} · ${job.reason}`
      : inspectedActor.drop
        ? "Finishing a delivery."
        : "No job reserved.";
  }
  const t = tileAt(state, selected)!;
  el("tile-name").textContent = !t.discovered
    ? "Unexplored"
    : t.solid
      ? `${materials[t.material].label} face`
      : (t.structure ??
        (t.feature
          ? features[t.feature].label
          : t.outside
            ? "The world outside"
            : "Cavern floor"));
  const jobs = state.jobs.filter(
    (j) =>
      j.target.x === selected.x &&
      j.target.y === selected.y &&
      ["active", "open"].includes(j.status),
  );
  el("job-priority-control").hidden = !t.discovered || !jobs.length;
  if (jobs.length)
    el<HTMLSelectElement>("work-priority").value = String(jobs[0].priority);
  el("discovery-inspection").textContent = t.discovered
    ? [
        t.feature
          ? `${features[t.feature].label} — ${features[t.feature].description}`
          : "",
        t.deposit
          ? `${deposits[t.deposit].label} · ${deposits[t.deposit].action === "mine" ? "Dig to extract" : "Gather to collect"} ${deposits[t.deposit].quantity} ${deposits[t.deposit].resource}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";
  el("stockpile-details").hidden = !t.discovered || !t.stockpile;
  if (t.discovered && t.stockpile) {
    el<HTMLSelectElement>("stockpile-filter").value = t.stockpileFilter;
    const contents = stockpileContents(state, selected);
    const text = Object.entries(contents)
      .filter(([, q]) => q > 0)
      .map(([r, q]) => `${q} ${resources[r as Resource].label.toLowerCase()}`)
      .join(" · ");
    el("stored-contents").textContent =
      `Accepts ${filterLabel(t.stockpileFilter).toLowerCase()}. Stored here: ${text || "empty"}.`;
  }
  const loose = t.discovered
    ? state.items.filter(
        (i) =>
          !i.holder &&
          !i.stored &&
          i.position.x === selected.x &&
          i.position.y === selected.y,
      )
    : [];
  el("loose-goods").textContent = loose
    .map(
      (i) =>
        `${i.quantity} ${resources[i.resource].label.toLowerCase()} loose${nearestStockpile(state, i) ? " · awaiting hauling" : " · no reachable stockpile accepts it"}`,
    )
    .join(". ");
  const danger =
    t.discovered && t.collapseAt !== null
      ? ` Loose ceiling: fall in ${Math.max(0, Math.ceil((t.collapseAt - state.tick) / 10))} game seconds. Build a Support within two tiles.`
      : "";
  const terrain = materials[t.material];
  el("inspection").textContent = !t.discovered
    ? "No goblin has seen this place. Scout the edge of a known passage to reveal more."
    : `${selected.x}, ${selected.y} · ${t.stockpile ? "Stockpile" : t.solid ? "Needs excavation" : walkable(t) ? "Walkable" : "Blocked"}${t.structure === "farm" ? ` · Growth ${Math.floor(t.growth / 6)}%` : ""} · ${terrain.label}: ${t.solid ? `dig ${terrain.diggable ? `${terrain.hardness} work` : "blocked"} · support ${terrain.stability}/10` : `step ${movementTicks(state, selected)} ticks`}${jobs.map((j) => ` · ${j.kind}: ${priorityLabels[j.priority]} · ${j.reason} (${j.progress} work)`).join("")}`;
  if (danger) el("inspection").textContent += danger;
  const farm = state.tiles.filter((t) => t.structure === "farm").length,
    bed = state.tiles.filter((t) => t.structure === "bed").length,
    dug = state.jobs.some((j) => j.kind === "dig" && j.status === "done");
  el("goals").textContent =
    `${farm >= 2 ? "✓" : "○"} ${farm}/2 patches · ${bed >= 4 ? "✓" : "○"} ${bed}/4 beds · ${dug ? "✓ Room to grow" : "○ Dig a room"}`;
  el("events").replaceChildren(
    ...state.events
      .slice(-80)
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
  canvas.tabIndex = 0;
  canvas.oncontextmenu = (e) => e.preventDefault();
  canvas.onpointerdown = (e) => {
    if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
    const phase = e.button === 0 ? "paint" : "pan";
    if (!interaction.begin(e.pointerId, phase)) return;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture(e.pointerId);
    if (phase === "pan") drag = { x: e.clientX, y: e.clientY };
    else if (tool === "inspect") {
      const hit = scene.inspect(state, e.clientX, e.clientY);
      choose(hit.position);
      selectedActor = hit.actor;
      scene.selectedActor = hit.actor;
      update();
    } else
      for (const p of interaction.paint(
        scene.pick(e.clientX, e.clientY, tool === "harvest"),
      ))
        choose(p);
  };
  canvas.onpointermove = (e) => {
    if (interaction.pointer !== null && interaction.pointer !== e.pointerId)
      return;
    if (interaction.phase === "pan" && drag) {
      scene.pan(e.clientX - drag.x, e.clientY - drag.y);
      drag = { x: e.clientX, y: e.clientY };
    } else if (interaction.phase === "paint" && tool !== "inspect")
      for (const p of interaction.paint(
        scene.pick(e.clientX, e.clientY, tool === "harvest"),
      ))
        choose(p);
    else {
      const hit =
        tool === "inspect"
          ? scene.inspect(state, e.clientX, e.clientY)
          : {
              position: scene.pick(e.clientX, e.clientY, tool === "harvest"),
              actor: null,
            };
      scene.hover = hit.position;
      scene.hoverActor = hit.actor;
    }
  };
  const end = (e: PointerEvent) => {
    if (e.pointerId !== interaction.pointer) return;
    interaction.end(e.pointerId);
    drag = null;
  };
  canvas.onpointerup = end;
  canvas.onpointercancel = end;
  canvas.onlostpointercapture = end;
  canvas.onpointerleave = () => {
    scene.hover = null;
    scene.hoverActor = null;
  };
  window.addEventListener("blur", () => {
    interaction.end();
    drag = null;
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scene.zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, { x: e.clientX, y: e.clientY });
    },
    { passive: false },
  );
  let last = performance.now();
  function frame(now: number): void {
    const dt = (now - last) / 1000;
    last = now;
    if (!document.hidden && !document.querySelector("dialog[open]"))
      clock.advance(dt, () => step(state));
    scene.draw(state, clock.accumulator / 0.1);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setInterval(update, 300);
  setInterval(() => {
    if (!document.hidden) void saveGame(state, "auto").catch(fail);
  }, 30000);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    setTool("inspect");
    return;
  }
  if (
    (e.target as HTMLElement).matches("input,button,select,textarea") ||
    document.querySelector("dialog[open]")
  )
    return;
  const key = e.key;
  if (key === " ") {
    e.preventDefault();
    setSpeed(clock.speed ? 0 : 1);
  }
  if (key === "Escape") setTool("inspect");
  if (key === "Home") scene.reset();
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) {
    e.preventDefault();
    scene.pan(
      key === "ArrowLeft" ? 40 : key === "ArrowRight" ? -40 : 0,
      key === "ArrowUp" ? 40 : key === "ArrowDown" ? -40 : 0,
    );
  }
  if (key === "+" || key === "=") scene.zoom(1.1);
  if (key === "-") scene.zoom(1 / 1.1);
});
document.addEventListener("visibilitychange", () => {
  clock.accumulator = 0;
  interaction.end();
});
setTool("inspect");
update();
void start();
export function isReady(): boolean {
  return ready;
}
