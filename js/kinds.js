// Part registry. A "kind" is a family of pieces (bricks, plates, slopes, ...).
// ADD NEW SHAPES HERE: call registerKind({...}) with a geometry builder + sizes.
import * as THREE from 'three';
import { STUD } from './constants.js';

const kinds = new Map();
export function registerKind(def) { kinds.set(def.id, def); }
export function getKind(id) { return kinds.get(id); }
export function allKinds() { return [...kinds.values()]; }

// "2x4" -> [2, 4]  (studs wide, studs deep)
export function footprint(size) { return size.split('x').map(Number); }

// ---- Geometry builders (fw, fd in studs; h in world units) ----
export function boxGeometry(fw, fd, h) {
    return new THREE.BoxGeometry(fw * STUD, h, fd * STUD);
}

// A clean 45° wedge: high along -Z, low along +Z. Non-indexed so faces stay flat.
export function slopeGeometry(fw, fd, h) {
    const w = fw * STUD / 2, d = fd * STUD / 2, y = h / 2;
    const A = [-w, -y, -d], B = [-w, -y, d], C = [-w, y, -d];
    const D = [ w, -y, -d], E = [ w, -y, d], F = [ w, y, -d];
    const tris = [A,B,E, A,E,D,  A,D,F, A,F,C,  B,E,F, B,F,C,  A,C,B,  D,E,F];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
    g.computeVertexNormals();
    return g;
}

// ---- Default catalog (the "original set") ----
// heightPlates: brick = 3, plate = 1. studs: whether the top has studs.
// colorable: uses the picked color; otherwise `color` is fixed.
registerKind({ id: 'brick', label: 'Bricks', heightPlates: 3, studs: true,  colorable: true,
    geometry: boxGeometry, sizes: ['1x1','1x2','1x3','1x4','1x6','1x8','2x2','2x3','2x4','2x6'] });

registerKind({ id: 'plate', label: 'Plates', heightPlates: 1, studs: true,  colorable: true,
    geometry: boxGeometry, sizes: ['1x2','1x4','2x2','2x4','2x6'] });

registerKind({ id: 'slope', label: 'Slopes', heightPlates: 3, studs: false, colorable: true,
    geometry: slopeGeometry, sizes: ['2x1','2x2'] });

registerKind({ id: 'light', label: 'Lights', heightPlates: 3, studs: true,  colorable: false,
    color: 0xfff2a0, emissive: 0x998100, glow: true,
    geometry: boxGeometry, sizes: ['1x1','2x2'] });

registerKind({ id: 'water', label: 'Water', heightPlates: 3, studs: true,   colorable: false,
    color: 0x2aa8ff, water: true,
    geometry: boxGeometry, sizes: ['1x1'] });
