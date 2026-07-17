// Part registry. A "kind" is a family of pieces (bricks, plates, slopes, ...).
// ADD NEW SHAPES HERE: call registerKind({...}) with a geometry builder + sizes.
import * as THREE from 'three';
import { STUD } from './constants.js';

const kinds = new Map();
export function registerKind(def) { kinds.set(def.id, def); }
export function getKind(id) { return kinds.get(id); }
export function allKinds() { return [...kinds.values()]; }

// Sizes are "WxD" (studs). Optional "@N" suffix overrides height in plates, e.g. "1x1@6".
export function footprint(size) { return size.split('@')[0].split('x').map(Number); }
export function heightPlatesOf(kindId, size) {
    const at = size.indexOf('@');
    if (at !== -1) return Number(size.slice(at + 1));
    return getKind(kindId).heightPlates;
}

// ---- Geometry builders (fw, fd in studs; h in world units) ----
export function boxGeometry(fw, fd, h) {
    return new THREE.BoxGeometry(fw * STUD, h, fd * STUD);
}

export function cylinderGeometry(fw, fd, h) {
    const r = Math.min(fw, fd) * STUD / 2;
    return new THREE.CylinderGeometry(r, r, h, 24);
}

// Straight 45° wedge: high along -Z, low along +Z. Non-indexed for flat faces.
export function slopeGeometry(fw, fd, h) {
    const w = fw * STUD / 2, d = fd * STUD / 2, y = h / 2;
    const A = [-w, -y, -d], B = [-w, -y, d], C = [-w, y, -d];
    const D = [ w, -y, -d], E = [ w, -y, d], F = [ w, y, -d];
    return fromTris([A,B,E, A,E,D,  A,D,F, A,F,C,  B,E,F, B,F,C,  A,C,B,  D,E,F]);
}

// Inverted slope: flat studded top, slope on the underside (an overhang piece).
export function invSlopeGeometry(fw, fd, h) {
    const w = fw * STUD / 2, d = fd * STUD / 2, y = h / 2;
    const a1 = [-w, y, -d], a2 = [-w, y, d], a3 = [-w, -y, -d];   // left cap (triangle)
    const b1 = [ w, y, -d], b2 = [ w, y, d], b3 = [ w, -y, -d];   // right cap
    return fromTris([
        a1,a2,b2, a1,b2,b1,   // flat top
        a1,b1,b3, a1,b3,a3,   // back wall
        a3,b3,b2, a3,b2,a2,   // underside slope
        a1,a3,a2,             // left cap
        b1,b2,b3,             // right cap
    ]);
}

// Corner slope: high at the back-left corner, sloping down to the front-right.
export function cornerSlopeGeometry(fw, fd, h) {
    const a = Math.min(fw, fd) * STUD / 2, y = h / 2;
    const T1 = [-a,  y, -a], T2 = [ a,  0, -a], T3 = [ a, -y,  a], T4 = [-a,  0,  a];
    const B1 = [-a, -y, -a], B2 = [ a, -y, -a], B3 = [ a, -y,  a], B4 = [-a, -y,  a];
    return fromTris([
        B1,B3,B2, B1,B4,B3,   // bottom
        T1,T2,T3, T1,T3,T4,   // sloped top
        B1,B2,T2, B1,T2,T1,   // back wall
        B1,T1,T4, B1,T4,B4,   // left wall
        B2,B3,T2,             // right wall (T3 == B3)
        B4,B3,T4,             // front wall
    ]);
}

// Arch: a rectangle with a curved opening cut from the bottom, extruded across the depth.
export function archGeometry(fw, fd, h) {
    const L = fw * STUD, D = fd * STUD, H = h;
    const innerX = Math.max(L / 2 - STUD, L * 0.15);   // legs ~1 stud wide
    const footTopY = -H / 2 + H * 0.28;
    const archTopY = H / 2 - H * 0.12;
    const cY = 2 * archTopY - footTopY;                // control pt so the arch peaks at archTopY

    const s = new THREE.Shape();
    s.moveTo(-L / 2, H / 2);
    s.lineTo( L / 2, H / 2);
    s.lineTo( L / 2, -H / 2);
    s.lineTo( innerX, -H / 2);
    s.lineTo( innerX, footTopY);
    s.quadraticCurveTo(0, cY, -innerX, footTopY);
    s.lineTo(-innerX, -H / 2);
    s.lineTo(-L / 2, -H / 2);
    s.closePath();

    const g = new THREE.ExtrudeGeometry(s, { depth: D, bevelEnabled: false });
    g.translate(0, 0, -D / 2);
    return g;
}

function fromTris(verts) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts.flat(), 3));
    g.computeVertexNormals();
    return g;
}

// ================= Default catalog =================
// heightPlates: brick = 3, plate/tile = 1. studs: whether the top has studs.
// colorable: uses the picked color; otherwise `color` is fixed.

registerKind({ id: 'brick', label: 'Bricks', heightPlates: 3, studs: true,  colorable: true,
    geometry: boxGeometry, sizes: ['1x1','1x2','1x3','1x4','1x6','1x8','2x2','2x3','2x4','2x6'] });

registerKind({ id: 'plate', label: 'Plates', heightPlates: 1, studs: true,  colorable: true,
    geometry: boxGeometry, sizes: ['1x2','1x4','2x2','2x4','2x6'] });

registerKind({ id: 'tile', label: 'Tiles (smooth)', heightPlates: 1, studs: false, colorable: true,
    geometry: boxGeometry, sizes: ['1x1','1x2','1x4','2x2','2x4'] });

registerKind({ id: 'round', label: 'Round Bricks', heightPlates: 3, studs: true, colorable: true,
    geometry: cylinderGeometry, sizes: ['1x1','2x2'] });

registerKind({ id: 'roundplate', label: 'Round Plates', heightPlates: 1, studs: true, colorable: true,
    geometry: cylinderGeometry, sizes: ['1x1','2x2'] });

registerKind({ id: 'arch', label: 'Arches', heightPlates: 3, studs: true, colorable: true,
    geometry: archGeometry, sizes: ['3x1','4x1'] });

registerKind({ id: 'slope', label: 'Slopes', heightPlates: 3, studs: false, colorable: true,
    geometry: slopeGeometry, sizes: ['2x1','2x2'] });

registerKind({ id: 'islope', label: 'Inverted Slopes', heightPlates: 3, studs: true, colorable: true,
    geometry: invSlopeGeometry, sizes: ['2x1','2x2'] });

registerKind({ id: 'cslope', label: 'Corner Slopes', heightPlates: 3, studs: false, colorable: true,
    geometry: cornerSlopeGeometry, sizes: ['2x2'] });

// Pillars/columns: tall pieces via the "@plates" height suffix (6 = 2 bricks, 9 = 3 bricks).
registerKind({ id: 'pillar', label: 'Round Pillars', heightPlates: 3, studs: true, colorable: true,
    geometry: cylinderGeometry, sizes: ['1x1@6','1x1@9','2x2@6','2x2@9'] });

registerKind({ id: 'column', label: 'Square Columns', heightPlates: 3, studs: true, colorable: true,
    geometry: boxGeometry, sizes: ['1x1@6','1x1@9','2x2@6'] });

registerKind({ id: 'light', label: 'Lights', heightPlates: 3, studs: true,  colorable: false,
    color: 0xfff2a0, emissive: 0x998100, glow: true,
    geometry: boxGeometry, sizes: ['1x1','2x2'] });

registerKind({ id: 'water', label: 'Water', heightPlates: 3, studs: true,   colorable: false,
    color: 0x2aa8ff, water: true,
    geometry: boxGeometry, sizes: ['1x1'] });
