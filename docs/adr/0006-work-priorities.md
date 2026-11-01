# 0006 — Work priorities and free-worker matching

Status: accepted for prototype.11, pending merge.

Players assign Low/Normal/High priority to a designation and may change pending
work in the inspector. Each goblin can have one optional preferred job type; this
is player guidance, not a skill, trait or capability restriction. Preferences and
priority changes apply at the next free choice. Urgent needs and existing cancel,
blocked-route and drop rules retain their interruption behaviour.

After needs/drop processing, a global pool compares eligible free-worker/job
pairs. Explicit priority tiers come first. Within a tier, score is minus three
times known route cost, plus 80 for preferred work and 25 for existing progress or
paid materials. Fatigue penalties vary modestly by exertion. Low food gives edible
harvests 180 and new farms 80; hungry workers add 40 to edible harvesting. Supports
within two tiles of a warned ceiling receive 300. A seeded 0–3 variation breaks
close ties; remaining ties use stable job/actor IDs. Greedy matching claims each
job/worker once. These modest weights are tuning defaults, not an optimal-matching
promise. No scoring happens in rendering; pure evaluation consumes no RNG.

Eligibility requires known routes, usable targets, physical haul items and stored,
unheld construction/crafting materials. Haul cost includes pickup and delivery;
terrain, weather and warning costs count. Existing active jobs are retained to
avoid switching back and forth. Resource reservations and stockpile retargeting
are separate acceptance criteria under GG-053/GG-044.

Choices save a concise human-readable reason on the job. The goblin inspector
labels it as the reason they chose that job, which remains meaningful if the
player changes the next-choice preference during active work. Priority dots and
labelled HTML selects make controls usable without colour or dragging alone.

Schema 7 adds task priority and nullable goblin preference. Versions 1–6 migrate
with Normal/Any work defaults, retaining RNG, identities, reservations and drop
progress. Broader labour policies, skills and debug overlays remain later tasks.
