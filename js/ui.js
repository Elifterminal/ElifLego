// Builds the sidebar from the part registry + wires color/theme/clear controls.
import { allKinds } from './kinds.js';
import { COLORS } from './colors.js';
import { THEMES } from './themes.js';
import { setPiece, setColor, setRot, setSticky, selType, selSize, selColor } from './selection.js';
import { rebuildGhost } from './ghost.js';
import { setHovered, clearAll } from './blocks.js';
import { applyTheme } from './scene.js';

const modePill = () => document.getElementById('mode-pill');

export function buildUI() {
    buildThemeSelect();
    buildColorRow();
    buildPalette();
    document.getElementById('clear-all').addEventListener('click', clearAll);
}

function buildThemeSelect() {
    const ts = document.getElementById('theme-select');
    Object.keys(THEMES).forEach(k => {
        const o = document.createElement('option');
        o.value = o.textContent = k;
        ts.appendChild(o);
    });
    ts.addEventListener('change', () => applyTheme(ts.value));
}

function buildColorRow() {
    const cr = document.getElementById('color-row');
    COLORS.forEach(c => {
        const s = document.createElement('div');
        s.className = 'swatch' + (c.hex === selColor ? ' active' : '');
        s.title = c.name;
        s.style.background = '#' + c.hex.toString(16).padStart(6, '0');
        s.addEventListener('click', () => {
            setColor(c.hex);
            cr.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
            s.classList.add('active');
            if (selType) rebuildGhost();
        });
        cr.appendChild(s);
    });
}

function buildPalette() {
    const pal = document.getElementById('palette');
    allKinds().forEach(kind => {
        const h = document.createElement('h2');
        h.className = 'section';
        h.textContent = kind.label.toUpperCase();
        pal.appendChild(h);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-3 gap-1';
        kind.sizes.forEach(size => {
            const b = document.createElement('button');
            b.className = 'block-button';
            b.textContent = size;
            b.dataset.type = kind.id;
            b.dataset.size = size;
            b.addEventListener('click', () => selectPiece(b));
            grid.appendChild(b);
        });
        pal.appendChild(grid);
    });
}

function selectPiece(btn) {
    const wasActive = btn.classList.contains('active');
    document.querySelectorAll('#palette .block-button').forEach(b => b.classList.remove('active'));
    if (wasActive) setPiece(null, null);
    else { btn.classList.add('active'); setPiece(btn.dataset.type, btn.dataset.size); }
    setRot(0); setSticky(0);
    setHovered(null);
    rebuildGhost();
    updateModePill();
}

export function deselect() {
    document.querySelectorAll('#palette .block-button').forEach(b => b.classList.remove('active'));
    setPiece(null, null);
    setHovered(null);
    rebuildGhost();
    updateModePill();
}

export function updateModePill() {
    const el = modePill();
    if (selType) {
        el.textContent = `BUILD: ${selType} ${selSize}`;
        el.style.borderColor = 'var(--accent)';
        el.style.color = 'var(--accent)';
    } else {
        el.textContent = 'ERASE — click a piece to delete';
        el.style.borderColor = '#ff6b6b';
        el.style.color = '#ff9b9b';
    }
}
