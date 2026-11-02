/** Display grid; source PNG canvases and native foot anchors stay unchanged. */
export const TILE_SIZE = 48;
export const HALF_TILE = TILE_SIZE / 2;
export const WALL_HEIGHT = TILE_SIZE;
/** Existing owner art and code-drawn props use 32px design units. */
export const SOURCE_TILE_SIZE = 32;
export const LEGACY_ART_SCALE = TILE_SIZE / SOURCE_TILE_SIZE;
export const ACTOR_FEET = 28 * LEGACY_ART_SCALE;
export const DEFAULT_ZOOM = 1;
