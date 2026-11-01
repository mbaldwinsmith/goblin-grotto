# 0007 — Filtered physical stockpiles

Status: accepted for prototype.12, pending merge.

Stockpiles remain floor designations, with five preset filters: all goods, food,
wood/stone, ore/valuables and crafted bed kits. Add/update painting is idempotent;
explicit Remove mode and an inspector button remove designations. No capacity or
container model is introduced here. Buildings replace storage beneath them.

An unheld item is stored exactly when it physically occupies known, clear,
walkable stockpile floor whose filter accepts its resource. Reconciliation never
moves, splits, merges or deletes objects; it updates flags and invalid zones.
Painting storage under matching supplies counts them in place. Interruptions on
accepted floor also leave stored goods; elsewhere they leave loose goods. The
resource dashboard retains physical totals and adds stored/carried/loose tooltips.

New hauls choose the lowest-cost known route to an accepting pile, breaking ties
by tile index. Existing valid destinations are retained to avoid route churn.
Filter edits, removal or terrain obstruction preserve the same reservation and
cargo when another destination is available. A pre-release drop wind-up is reset
before rerouting. With no destination, the job is cancelled and the worker/item
are freed; normal automatic hauling can recover it after storage becomes available.
All transfers remain tick-driven through the existing frame-5 drop rule.

Schema 8 adds filters with All goods defaults. Older saves reconcile invalid
storage flags without moving or deleting physical items. New saves validate both
sides of the stored/physical-placement invariant. Actual schema-7 migration and
mid-delivery save continuation verify compatibility. Capacity, specialised
containers, equipment and custom policy systems remain later tasks.
