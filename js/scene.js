// Three.js scene, camera, renderer, controls, lights, baseplate + theme application.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STUD, PLATE, STUD_H, STUD_R, BASE_R, span } from './constants.js';
import { THEMES, setCurrent, edgeMats } from './themes.js';

export let scene, camera, renderer, controls, raycaster, pointer;
let baseSlab, baseStuds, grid, ambient, dirLight, ptLight;

export function initScene(canvas, container) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(58, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(14, 16, 20);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 4; controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 1, 0);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    ambient = new THREE.AmbientLight(0xffffff, 1);
    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(18, 26, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    Object.assign(dirLight.shadow.camera, { near: 0.5, far: 90, left: -40, right: 40, top: 40, bottom: -40 });
    ptLight = new THREE.PointLight(0xffffff, 0.5, 160);
    ptLight.position.set(-18, 16, -14);
    scene.add(ambient, dirLight, ptLight);

    buildBaseplate();

    window.addEventListener('resize', () => onResize(container));
}

function buildBaseplate() {
    const s = span();
    baseSlab = new THREE.Mesh(
        new THREE.BoxGeometry(s, PLATE, s),
        new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.15 })
    );
    baseSlab.position.y = -PLATE / 2;         // top surface at y = 0
    baseSlab.receiveShadow = true;
    scene.add(baseSlab);

    const n = (BASE_R * 2 + 1) ** 2;
    const studGeo = new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_H, 12);
    baseStuds = new THREE.InstancedMesh(studGeo, new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.2 }), n);
    baseStuds.receiveShadow = true;
    const m = new THREE.Matrix4();
    let i = 0;
    for (let gx = -BASE_R; gx <= BASE_R; gx++)
        for (let gz = -BASE_R; gz <= BASE_R; gz++) {
            m.setPosition(gx * STUD, STUD_H / 2, gz * STUD);
            baseStuds.setMatrixAt(i++, m);
        }
    baseStuds.instanceMatrix.needsUpdate = true;
    scene.add(baseStuds);
}

export function applyTheme(name) {
    const t = THEMES[name];
    setCurrent(t);
    scene.background = new THREE.Color(t.bg);

    baseSlab.material.color.setHex(t.base);
    baseSlab.material.emissive = new THREE.Color(t.studGlow).multiplyScalar(0.4);
    baseStuds.material.color.setHex(t.base);
    baseStuds.material.emissive.setHex(t.studGlow);

    if (grid) scene.remove(grid);
    grid = new THREE.GridHelper(span(), BASE_R * 2 + 2, t.grid[0], t.grid[1]);
    grid.material.transparent = true;
    grid.material.opacity = t.gridOp;
    grid.position.y = 0.002;
    scene.add(grid);

    ambient.color.setHex(t.amb[0]); ambient.intensity = t.amb[1];
    dirLight.color.setHex(t.dir[0]); dirLight.intensity = t.dir[1];
    ptLight.color.setHex(t.pt[0]);  ptLight.intensity = t.pt[1]; ptLight.visible = t.pt[2];

    edgeMats.forEach(m => { m.color.setHex(t.edge); m.opacity = t.edgeOp; });
    document.documentElement.style.setProperty('--accent', '#' + t.edge.toString(16).padStart(6, '0'));
}

export function dolly(factor) {
    const off = camera.position.clone().sub(controls.target).multiplyScalar(factor);
    const len = off.length();
    if (len < controls.minDistance) off.setLength(controls.minDistance);
    if (len > controls.maxDistance) off.setLength(controls.maxDistance);
    camera.position.copy(controls.target).add(off);
}

function onResize(container) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}
