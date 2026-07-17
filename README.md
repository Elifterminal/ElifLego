# ElifLego — Brick Studio

A browser-based 3D LEGO builder. Snap real bricks onto a studded baseplate, stack them in
every valid configuration (staggered, overhanging, mixed brick/plate heights), and switch
between visual themes.

No build step — plain ES modules + [Three.js](https://threejs.org/) loaded from a CDN via an
import map. Open it on any static host (GitHub Pages) or a local server.

## Run locally

ES modules need HTTP (not `file://`):

```bash
cd ElifLego
python3 -m http.server 8000
# open http://localhost:8000
```

## Controls

| Action | Input |
| --- | --- |
| Orbit / pan / zoom | left-drag / right-drag / wheel |
| Slide the piece | move mouse (it stays on the surface, hangs off edges) |
| Nudge 1 stud | arrow keys |
| Rotate 90° | `R` |
| Place | click (green = supported, red = would float) |
| Delete | `ESC` to deselect, then click a piece |

## How snapping works

Space is a voxel grid at **plate** resolution (a brick is 3 plates tall). A piece rests at the
highest level where at least one of its studs is supported, so you can offset a 2x4 on a 2x4
down to a single stud of grip — but never float it with zero support.

## Project layout

Everything is split so adding shapes never means editing a giant file.

```
index.html          shell + import map
css/styles.css
js/
  constants.js      grid units
  colors.js         color palette
  themes.js         aesthetics
  kinds.js          PART REGISTRY — add shapes here
  occupancy.js      voxel grid (collide / support / valid)
  selection.js      current piece / color / rotation
  scene.js          scene, camera, baseplate, theme
  factory.js        builds a mesh group for any kind
  snapping.js       cursor → snapped target
  ghost.js          preview + nudge + footprint marker
  blocks.js         place / delete / occupancy writes
  input.js          pointer + keyboard
  ui.js             sidebar built from the registry
  main.js           wire-up + render loop
```

## Adding a new shape

Add one `registerKind({...})` call in `js/kinds.js` (or a new file that imports `registerKind`):

```js
registerKind({
  id: 'tile', label: 'Tiles', heightPlates: 1, studs: false, colorable: true,
  geometry: boxGeometry, sizes: ['1x2', '2x2', '2x4'],
});
```

It shows up in the palette automatically. For a custom shape, pass your own
`geometry(fw, fd, h)` builder.

## Saving

Builds **auto-save to `localStorage`** on every place/delete, so they survive a refresh.
Use **Export** to download a build as JSON and **Import** to load one back (also handy for
sharing or backup). Clearing the board is persisted too.

## Roadmap

- Particle water (tiny mass-bearing droplets) for the Water piece
- Multi-size / multi-brightness light bricks
- More parts (windows, doors, curved slopes, wedge plates) as real LEGO elements
- Named save slots + shareable links
