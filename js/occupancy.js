// Voxel occupancy at plate resolution: which (gx, gy, gz) cells are filled.
// gx/gz are stud indices, gy is a plate-level index (0 = first plate above the baseplate).
export const columns = new Map();               // "gx,gz" -> Set(gy)

export const key = (gx, gz) => gx + ',' + gz;
export const colSet = (gx, gz) => columns.get(key(gx, gz));

export function footCells(minGX, minGZ, ew, ed) {
    const cells = [];
    for (let i = 0; i < ew; i++)
        for (let j = 0; j < ed; j++) cells.push([minGX + i, minGZ + j]);
    return cells;
}

// Does a footprint at this level collide with existing bricks?
export function collides(cells, level, hP) {
    for (const [gx, gz] of cells) {
        const s = colSet(gx, gz);
        if (!s) continue;
        for (let gy = level; gy < level + hP; gy++) if (s.has(gy)) return true;
    }
    return false;
}

// Is at least one stud of the footprint resting on real support (or the baseplate)?
export function supported(cells, level) {
    if (level === 0) return true;                // baseplate holds everything
    for (const [gx, gz] of cells) {
        const s = colSet(gx, gz);
        if (s && s.has(level - 1)) return true;  // something's top is directly beneath us
    }
    return false;
}

export function isValid(cells, level, hP) {
    return !collides(cells, level, hP) && supported(cells, level);
}

export function addVoxels(cells, level, hP) {
    const voxels = [];
    for (const [gx, gz] of cells) {
        let s = colSet(gx, gz);
        if (!s) { s = new Set(); columns.set(key(gx, gz), s); }
        for (let gy = level; gy < level + hP; gy++) { s.add(gy); voxels.push([gx, gy, gz]); }
    }
    return voxels;
}

export function removeVoxels(voxels) {
    for (const [gx, gy, gz] of voxels) {
        const s = colSet(gx, gz);
        if (s) { s.delete(gy); if (!s.size) columns.delete(key(gx, gz)); }
    }
}
