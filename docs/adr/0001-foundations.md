# 0001 — Deterministic simulation and browser adapters

Use a 10 Hz fixed step, serializable xorshift32, stable typed IDs, data snapshots,
and validated commands. Pixi and DOM adapters read this state. This permits
headless seed tests and exact save continuation. Render-driven rules were rejected
because outcomes would depend on refresh rate. A general ECS is unnecessary for
four workers; plain typed records are easier to inspect and migrate.

Use semantic HTML without a UI framework: the initial panels are small and keyboard
controls are native. Reconsider a framework only if component complexity justifies
its dependency and state synchronization cost.

Save versioned JSON snapshots to IndexedDB. LocalStorage's synchronous writes and
small quota are poor defaults; server saves would add accounts and infrastructure.
Keep an import/export path for portability. Validation must precede state replacement.

Choose Biome for formatting and linting, with tsc for strict types; using both ESLint
and another formatter would duplicate configuration. Vitest runs without a renderer.

The prototype implements a vertical slice of M01–M04 alongside the core rather than
waiting for every art/world task. Pending GG tasks remain pending; this does not
waive the v0.1 release gate. Production PixelLab art is unavailable in this session.
