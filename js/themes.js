// Visual aesthetics. `current` is read live by the factory (for new edge colors).
// Edge materials register themselves so a theme switch can recolor existing pieces.
export const THEMES = {
    Tron:      { bg:0x0a0a1e, base:0x0b2436, studGlow:0x0a5a66, grid:[0x00ffff,0x0a4a55], gridOp:0.45,
                 amb:[0x404060,1.3], dir:[0x9ff7ff,1.3], pt:[0xff00ff,0.6,true], edge:0x8ffcff, edgeOp:0.9 },
    Classic:   { bg:0x8fc9ff, base:0x2f8f3f, studGlow:0x000000, grid:[0x2a6a34,0x2a6a34], gridOp:0.15,
                 amb:[0xffffff,1.15], dir:[0xffffff,1.5], pt:[0xffffff,0.0,false], edge:0x1f2a1f, edgeOp:0.25 },
    Synthwave: { bg:0x1a0a2e, base:0x2a0f45, studGlow:0x7a1f6a, grid:[0xff2a9d,0x53206a], gridOp:0.5,
                 amb:[0x442255,1.2], dir:[0xffa6f0,1.2], pt:[0xff7a1f,0.8,true], edge:0xff8adf, edgeOp:0.9 },
    Night:     { bg:0x101014, base:0x24262e, studGlow:0x000000, grid:[0x555b6a,0x2a2e38], gridOp:0.35,
                 amb:[0x8890a0,1.1], dir:[0xdfe6ff,1.3], pt:[0x4466ff,0.4,true], edge:0xcfd6e6, edgeOp:0.6 },
};

export let current = THEMES.Tron;
export function setCurrent(theme) { current = theme; }

export const edgeMats = [];                       // line materials that follow the theme
export function registerEdgeMat(mat) { edgeMats.push(mat); }
