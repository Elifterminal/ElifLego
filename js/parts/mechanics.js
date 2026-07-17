// Mechanics: gears (mesh to drive other axles) and cranks (drive an axle).
// Both mount on axles like wheels; `rotates` gives them a rotor the driveline turns.
import { registerKind } from '../registry.js';
import { gearGeometry, crankGeometry } from '../geometry.js';

registerKind({ id: 'gear', category: 'Mechanics', label: 'Gears', heightPlates: 4, studs: false, colorable: true,
    mount: 'axle', rotates: true, gear: true, geometry: gearGeometry, sizes: ['1x1','2x2','3x3'] });

registerKind({ id: 'crank', category: 'Mechanics', label: 'Cranks (driver)', heightPlates: 4, studs: false, colorable: true,
    mount: 'axle', rotates: true, driver: 3.0, geometry: crankGeometry, sizes: ['2x2'] });
