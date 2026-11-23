import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const host = document.getElementById('room3d');
const loadingEl = document.getElementById('viewer-loading');

if (host) {
  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfe6f2);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 160);
    camera.position.set(7.4, 5.2, 8.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 0.5;
    controls.maxDistance = 19;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 1.0, -0.2);

    // Materials library
    const mats = {};
    const makeMat = (name, color, roughness = 0.8, metalness = 0.02, extra = {}) => {
      mats[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
      return mats[name];
    };

    makeMat('floor', 0xc7b194, 0.72);
    makeMat('tile', 0xd8ddd9, 0.35, 0.05);
    makeMat('wall', 0xede9e0, 0.9);
    makeMat('wood', 0x94643f, 0.62);
    makeMat('darkwood', 0x463123, 0.58);
    makeMat('linen', 0xf6f3ec, 0.85);
    makeMat('accent', 0x527966, 0.82);
    makeMat('curtain', 0xe6e1d6, 0.88, 0, { side: THREE.DoubleSide });
    makeMat('glass', 0x8cc8de, 0.08, 0.15, { transparent: true, opacity: 0.22, depthWrite: false });
    makeMat('showerGlass', 0xa8d8e6, 0.08, 0.1, { transparent: true, opacity: 0.28, depthWrite: false });
    makeMat('mirror', 0xdbe9ef, 0.06, 0.85);
    makeMat('ceramic', 0xfbfbfa, 0.2, 0.05);
    makeMat('chrome', 0xd4d9dc, 0.2, 0.88);
    makeMat('black', 0x1d2523, 0.45, 0.3);
    makeMat('white', 0xffffff, 0.7);
    makeMat('plant', 0x4b7d58, 0.75);
    makeMat('rug', 0xd7dfd7, 0.92);
    makeMat('lampShade', 0xfff5e0, 0.5, 0, { emissive: new THREE.Color(0xffb86b), emissiveIntensity: 0.15 });
    makeMat('coveGlow', 0xfff3db, 0.3, 0, { emissive: new THREE.Color(0xffd79e), emissiveIntensity: 0.35 });
    makeMat('screen', 0x11181c, 0.2, 0.4, { emissive: new THREE.Color(0x214452), emissiveIntensity: 0.4 });

    const roomGroup = new THREE.Group();
    const exteriorGroup = new THREE.Group();
    const dimLinesGroup = new THREE.Group();
    dimLinesGroup.visible = false;
    scene.add(roomGroup);
    scene.add(exteriorGroup);
    scene.add(dimLinesGroup);

    const cutawayWalls = [];
    const exteriorNightMeshes = [];
    const disposableGeoms = [];

    function trackGeom(geom) {
      disposableGeoms.push(geom);
      return geom;
    }

    function addBox(w, h, d, x, y, z, material, parent = roomGroup, wallRole = null) {
      const m = new THREE.Mesh(
        trackGeom(new THREE.BoxGeometry(w, h, d)),
        typeof material === 'string' ? mats[material] : material
      );
      m.position.set(x, y, z);
      m.castShadow = !wallRole;
      m.receiveShadow = true;
      parent.add(m);
      if (wallRole) {
        m.userData.wallRole = wallRole;
        m.userData.origY = y;
        m.userData.origH = h;
        cutawayWalls.push(m);
      }
      return m;
    }

    function addCylinder(rt, rb, h, x, y, z, material, parent = roomGroup) {
      const m = new THREE.Mesh(
        trackGeom(new THREE.CylinderGeometry(rt, rb, h, 16)),
        typeof material === 'string' ? mats[material] : material
      );
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }

    function addPlant(x, z, parent = roomGroup) {
      const g = new THREE.Group();
      addCylinder(0.21, 0.15, 0.34, 0, 0.17, 0, 'darkwood', g);
      addCylinder(0.032, 0.05, 0.62, 0, 0.48, 0, 'wood', g);
      for (let i = 0; i < 8; i++) {
        const leaf = new THREE.Mesh(trackGeom(new THREE.SphereGeometry(0.21, 10, 8)), mats.plant);
        leaf.scale.set(0.42, 0.18, 1.05);
        leaf.position.set(Math.cos(i * 0.8) * 0.26, 0.68 + (i % 3) * 0.17, Math.sin(i * 0.8) * 0.26);
        leaf.rotation.y = i * 0.8;
        leaf.rotation.z = 0.35;
        leaf.castShadow = true;
        g.add(leaf);
      }
      g.position.set(x, 0, z);
      parent.add(g);
    }

    function addDimensionLine(p1, p2, color = 0x2f5d46) {
      const pts = [new THREE.Vector3(...p1), new THREE.Vector3(...p2)];
      const geom = trackGeom(new THREE.BufferGeometry().setFromPoints(pts));
      const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color }));
      dimLinesGroup.add(line);

      // End ticks
      pts.forEach(pt => {
        const tick = new THREE.Mesh(
          trackGeom(new THREE.SphereGeometry(0.055, 8, 8)),
          new THREE.MeshBasicMaterial({ color })
        );
        tick.position.copy(pt);
        dimLinesGroup.add(tick);
      });
    }

    // Lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x8d8578, 1.85);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1d8, 2.2);
    sun.position.set(-3, 7.5, -6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const fillLight = new THREE.PointLight(0xfff4e4, 16, 16);
    fillLight.position.set(0, 2.8, 0.3);
    scene.add(fillLight);

    const lampLight = new THREE.PointLight(0xffb566, 0, 7);
    lampLight.position.set(-2.4, 1.25, 0.1);
    scene.add(lampLight);

    const bathLight = new THREE.PointLight(0xeef6ff, 6, 6);
    bathLight.position.set(2.2, 2.5, 1.8);
    scene.add(bathLight);

    // True-to-scale metric room configurations
    const roomConfigs = {
      urban: {
        dims: {
          w: 6.33,
          d: 6.00,
          h: 3.10,
          widthText: 'Width 6.33 m',
          depthText: 'Depth 6.00 m (38 m²)',
          bedText: 'King 180 × 200 cm',
          winText: 'Glass 4.83 × 2.40 m',
          bathText: 'En-suite 2.30 × 2.40 m'
        },
        accentColor: 0x4f7a68,
        bedLabel: 'King bed',
        viewLabel: 'Skyline view',
        floorLabel: 'Floor 14 · 6.33 × 6.00 m',
        viewType: 'city',
        isQueen: false,
        hasLounge: false,
        hasTub: false,
        spots: {
          bed: {
            title: 'King Bed · 180 × 200 cm (True Scale)',
            body: 'Positioned on the left sleeping zone with tufted oak headboard, 400TC linen, dual nightstands, reading lamps, and 3.4 m sightline to the 55" TV.'
          },
          window: {
            title: 'Floor 14 · East-Facing Sukhumvit Skyline',
            body: '4.83 m wide × 2.40 m high acoustic double-glazed window with sheer/blackout curtains and private 1.1 m deep balcony.'
          },
          tv: {
            title: '55" 4K Smart TV & Refreshment Credenza',
            body: 'Mounted at 1.45 m eye-height directly opposite the King bed with espresso machine, kettle, and silent mini-fridge.'
          },
          desk: {
            title: 'Daylight Workstation · 145 × 68 cm',
            body: 'Positioned beside the panoramic window for natural lighting, equipped with ergonomic swivel chair and universal AC/USB-C outlets.'
          },
          bath: {
            title: 'En-Suite Bathroom · 2.30 × 2.40 m',
            body: 'Tiled wet zone featuring a frameless glass walk-in rain shower, backlit vanity mirror, stone basin, and WC.'
          }
        }
      },
      calm: {
        dims: {
          w: 6.15,
          d: 5.20,
          h: 3.00,
          widthText: 'Width 6.15 m',
          depthText: 'Depth 5.20 m (32 m²)',
          bedText: 'Queen 160 × 200 cm',
          winText: 'Glass 4.65 × 2.30 m',
          bathText: 'En-suite 2.15 × 2.10 m'
        },
        accentColor: 0x7c8f7a,
        bedLabel: 'Queen bed',
        viewLabel: 'Garden view',
        floorLabel: 'Floor 4 · 6.15 × 5.20 m',
        viewType: 'garden',
        isQueen: true,
        hasLounge: false,
        hasTub: false,
        spots: {
          bed: {
            title: 'Queen Bed · 160 × 200 cm (True Scale)',
            body: 'Low-profile natural ash bed frame maximizing floor circulation space, paired with breathable cotton bedding and warm sconces.'
          },
          window: {
            title: 'Floor 4 · Quiet Ari Courtyard Greenery',
            body: '4.65 m wide window overlooking lush courtyard canopy trees and low-rise Ari rooftops at ~12 m elevation.'
          },
          tv: {
            title: '50" Smart TV & Artisanal Tea Bar',
            body: 'Clean wall-mounted display facing the Queen bed with ceramic tea set and integrated storage cabinet.'
          },
          desk: {
            title: 'Garden-Facing Desk · 135 × 65 cm',
            body: 'Timber writing desk angled toward the courtyard greenery with task lamp and high-speed Wi-Fi access.'
          },
          bath: {
            title: 'En-Suite Bathroom · 2.15 × 2.10 m',
            body: 'Bright stone-tiled bathroom with glass shower enclosure, vanity counter, backlit mirror, and WC.'
          }
        }
      },
      atelier: {
        dims: {
          w: 8.80,
          d: 6.25,
          h: 3.20,
          widthText: 'Width 8.80 m',
          depthText: 'Depth 6.25 m (55 m²)',
          bedText: 'King 180 × 200 cm',
          winText: 'Glass 7.20 × 2.50 m',
          bathText: 'Spa Bath 2.80 × 2.60 m'
        },
        accentColor: 0x9c6b4e,
        bedLabel: 'King bed',
        viewLabel: 'River view',
        floorLabel: 'Floor 22 · 8.80 × 6.25 m',
        viewType: 'river',
        isQueen: false,
        hasLounge: true,
        hasTub: true,
        spots: {
          bed: {
            title: 'King Suite Bed · 180 × 200 cm',
            body: 'Expansive sleeping zone with upholstered acoustic headboard and direct west-facing Chao Phraya River sightlines.'
          },
          window: {
            title: 'Floor 22 · West-Facing Chao Phraya River Bend',
            body: '7.20 m floor-to-ceiling panoramic glass wall at ~66 m elevation with unobstructed sunset river views.'
          },
          tv: {
            title: '65" 4K Smart TV & Suite Console',
            body: 'Large-format screen positioned cleanly across from both the King bed and the lounge seating area.'
          },
          desk: {
            title: 'Executive Desk & Lounge Sofa Zone',
            body: 'Dedicated 160 × 75 cm executive desk paired with a 2-seater lounge sofa and oak coffee table.'
          },
          bath: {
            title: 'Spa En-Suite · Freestanding Tub & Rain Shower',
            body: '2.80 × 2.60 m luxury bathroom equipped with a deep soaking tub, separate glass rain shower, and double-width vanity.'
          }
        }
      }
    };

    let currentRoomKey = 'urban';
    let viewMode = 'room';
    let currentLight = 'day';
    let showDimensions = false;

    const anchors = {
      bed: new THREE.Vector3(-2.0, 1.0, 0.2),
      window: new THREE.Vector3(0, 1.65, -2.9),
      tv: new THREE.Vector3(2.9, 1.55, -0.5),
      desk: new THREE.Vector3(1.8, 1.05, -2.0),
      bath: new THREE.Vector3(2.0, 1.25, 1.8)
    };

    const dimAnchors = {
      width: new THREE.Vector3(0, 0.18, 3.0),
      depth: new THREE.Vector3(-3.1, 0.18, 0),
      bed: new THREE.Vector3(-2.0, 1.35, -0.3),
      window: new THREE.Vector3(0, 2.8, -2.95),
      bath: new THREE.Vector3(2.0, 1.4, 1.8)
    };

    const cameraPresets = {
      overview: { pos: [7.4, 5.2, 8.6], target: [0, 1.0, -0.2] },
      eye: { pos: [-0.2, 1.65, 1.35], target: [-0.6, 1.45, -2.8] },
      dollhouse: { pos: [0.05, 11.4, 7.2], target: [0, 0.3, -0.1] },
      bed: { pos: [1.4, 2.25, 2.3], target: [-2.0, 0.75, -0.3] },
      window: { pos: [0, 1.75, 1.8], target: [0, 1.55, -7.5] },
      desk: { pos: [-0.3, 2.25, 0.8], target: [1.9, 0.9, -2.0] },
      tv: { pos: [-1.2, 2.15, 2.1], target: [3.0, 1.5, -0.4] },
      bath: { pos: [-0.4, 2.55, 2.6], target: [2.1, 1.0, 1.8] }
    };

    function clearSceneGroups() {
      while (roomGroup.children.length > 0) roomGroup.remove(roomGroup.children[0]);
      while (exteriorGroup.children.length > 0) exteriorGroup.remove(exteriorGroup.children[0]);
      while (dimLinesGroup.children.length > 0) dimLinesGroup.remove(dimLinesGroup.children[0]);
      while (disposableGeoms.length > 0) {
        const g = disposableGeoms.pop();
        if (g && g.dispose) g.dispose();
      }
      cutawayWalls.length = 0;
      exteriorNightMeshes.length = 0;
    }

    function buildExterior(viewType, W, D) {
      // Private Balcony Deck & Glass Balustrade outside back panoramic window
      const balcD = 1.15;
      const balcZ = -D / 2 - balcD / 2;
      addBox(W + 0.3, 0.16, balcD, 0, -0.08, balcZ, 'tile', exteriorGroup);
      const railGlass = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(W, 1.0)), mats.glass);
      railGlass.position.set(0, 0.52, -D / 2 - balcD + 0.04);
      exteriorGroup.add(railGlass);
      addBox(W + 0.1, 0.06, 0.08, 0, 1.04, -D / 2 - balcD + 0.04, 'black', exteriorGroup);

      if (viewType === 'city') {
        // Floor 14 (~42m elevation) Sukhumvit urban fabric & towers
        const street = new THREE.Mesh(
          trackGeom(new THREE.PlaneGeometry(80, 50)),
          new THREE.MeshStandardMaterial({ color: 0x5d6765, roughness: 0.95 })
        );
        street.rotation.x = -Math.PI / 2;
        street.position.set(0, -18, -24);
        exteriorGroup.add(street);

        const towers = [
          [-13, 16, -15, 3.6, 3.6, 0x7b8d96],
          [-7.5, 22, -17, 4.0, 3.8, 0x677b86],
          [-2.2, 13, -13.5, 3.2, 3.0, 0x8798a0],
          [3.2, 24, -18, 4.4, 4.0, 0x5e7380],
          [8.6, 17, -15, 3.6, 3.4, 0x7a8b94],
          [13.5, 14, -14, 3.4, 3.2, 0x8a9aa1]
        ];

        towers.forEach(([tx, th, tz, tw, td, col]) => {
          const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.2 });
          const tower = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(tw, th, td)), bMat);
          tower.position.set(tx, -18 + th / 2, tz);
          exteriorGroup.add(tower);

          const winMat = new THREE.MeshStandardMaterial({
            color: 0xffe6a3,
            emissive: new THREE.Color(0xffcf70),
            emissiveIntensity: 0.05,
            roughness: 0.3
          });
          exteriorNightMeshes.push(winMat);
          for (let row = 0; row < 6; row++) {
            const band = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(tw * 0.74, 0.24)), winMat);
            band.position.set(tx, -8 + row * 1.75, tz + td / 2 + 0.02);
            exteriorGroup.add(band);
          }
        });
      } else if (viewType === 'garden') {
        // Floor 4 (~12m elevation) Ari courtyard garden & neighboring villas
        const lawn = new THREE.Mesh(
          trackGeom(new THREE.PlaneGeometry(60, 40)),
          new THREE.MeshStandardMaterial({ color: 0x628758, roughness: 0.9 })
        );
        lawn.rotation.x = -Math.PI / 2;
        lawn.position.set(0, -5.2, -18);
        exteriorGroup.add(lawn);

        for (let i = 0; i < 16; i++) {
          const tx = -13 + i * 1.75;
          const tz = -8.5 - (i % 3) * 2.6;
          const canopy = new THREE.Mesh(
            trackGeom(new THREE.SphereGeometry(1.45 + (i % 2) * 0.38, 14, 10)),
            new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x4c7a49 : 0x619157, roughness: 0.85 })
          );
          canopy.position.set(tx, -2.4 + (i % 3) * 0.65, tz);
          exteriorGroup.add(canopy);
        }
      } else {
        // Floor 22 (~66m elevation) Chao Phraya River & opposite bank skyline
        const river = new THREE.Mesh(
          trackGeom(new THREE.PlaneGeometry(90, 45)),
          new THREE.MeshStandardMaterial({ color: 0x47828f, roughness: 0.22, metalness: 0.38 })
        );
        river.rotation.x = -Math.PI / 2;
        river.position.set(0, -20, -24);
        exteriorGroup.add(river);

        const farBank = new THREE.Mesh(
          trackGeom(new THREE.BoxGeometry(90, 3.0, 10)),
          new THREE.MeshStandardMaterial({ color: 0x657d6e, roughness: 0.85 })
        );
        farBank.position.set(0, -19, -40);
        exteriorGroup.add(farBank);

        const skylineMat = new THREE.MeshStandardMaterial({
          color: 0x73858e,
          emissive: new THREE.Color(0xffc978),
          emissiveIntensity: 0.05,
          roughness: 0.5
        });
        exteriorNightMeshes.push(skylineMat);
        for (let i = 0; i < 10; i++) {
          const h = 4.5 + (i % 4) * 2.5;
          const b = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(2.8, h, 2.6)), skylineMat);
          b.position.set(-18 + i * 4, -18 + h / 2, -37);
          exteriorGroup.add(b);
        }
      }
    }

    function buildRoom(key) {
      currentRoomKey = key;
      const cfg = roomConfigs[key] || roomConfigs.urban;
      const { w: W, d: D, h: H } = cfg.dims;

      clearSceneGroups();
      mats.accent.color.setHex(cfg.accentColor);

      // En-suite Bathroom Zone (front-right corner) vs Main Timber Floor
      const bathW = cfg.hasTub ? 2.80 : 2.25;
      const bathD = cfg.hasTub ? 2.60 : 2.25;
      const bathX = W / 2 - bathW / 2;
      const bathZ = D / 2 - bathD / 2;

      // Main bedroom oak floor
      addBox(W, 0.18, D, 0, -0.09, 0, 'floor');
      // Raised stone-tile floor inlay for en-suite bathroom
      addBox(bathW - 0.08, 0.02, bathD - 0.08, bathX, 0.01, bathZ, 'tile');

      // Outer Left Wall, Right Wall, Back Window Sill/Header/Pillars
      addBox(0.16, H, D, -W / 2, H / 2, 0, 'wall', roomGroup, 'side');
      addBox(0.16, H, D, W / 2, H / 2, 0, 'wall', roomGroup, 'side');
      addBox(W, 0.36, 0.16, 0, 0.18, -D / 2, 'wall', roomGroup, 'sill');
      addBox(W, 0.34, 0.16, 0, H - 0.17, -D / 2, 'wall', roomGroup, 'header');
      addBox(0.75, H, 0.16, -W / 2 + 0.375, H / 2, -D / 2, 'wall', roomGroup, 'pillar');
      addBox(0.75, H, 0.16, W / 2 - 0.375, H / 2, -D / 2, 'wall', roomGroup, 'pillar');

      // Recessed Ceiling Cove Lighting Strip along Left & Right walls
      addBox(0.12, 0.05, D - 0.4, -W / 2 + 0.16, H - 0.08, 0, 'coveGlow', roomGroup, 'header');
      addBox(0.12, 0.05, D - 0.4, W / 2 - 0.16, H - 0.08, 0, 'coveGlow', roomGroup, 'header');

      // Panoramic Window Glass, Mullions & Sheer Drapes
      const winW = W - 1.5;
      const glass = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(winW, H - 0.70)), mats.glass);
      glass.position.set(0, H / 2, -D / 2 + 0.02);
      roomGroup.add(glass);

      [-winW / 2, -winW / 6, winW / 6, winW / 2].forEach(mx => {
        addBox(0.07, H - 0.68, 0.11, mx, H / 2, -D / 2 + 0.04, 'black');
      });
      addBox(winW + 0.1, 0.08, 0.12, 0, 0.36, -D / 2 + 0.04, 'black');
      addBox(winW + 0.1, 0.08, 0.12, 0, H - 0.34, -D / 2 + 0.04, 'black');

      // Side Curtain Panels framing the window
      addBox(0.45, H - 0.15, 0.14, -W / 2 + 0.55, H / 2, -D / 2 + 0.14, 'curtain', roomGroup, 'pillar');
      addBox(0.45, H - 0.15, 0.14, W / 2 - 0.55, H / 2, -D / 2 + 0.14, 'curtain', roomGroup, 'pillar');

      // Baseboards
      addBox(0.05, 0.09, D, -W / 2 + 0.1, 0.045, 0, 'darkwood');
      addBox(0.05, 0.09, D - bathD, W / 2 - 0.1, 0.045, -bathD / 2, 'darkwood');

      // Bedroom Area Rug
      const bedZ = -0.35;
      addBox(3.0, 0.022, 2.6, -0.85, 0.012, bedZ, 'rug');

      // Bed (True metric proportions: King 1.80×2.00m or Queen 1.60×2.00m)
      const bedLen = 2.15; // includes frame
      const bedWid = cfg.isQueen ? 1.72 : 1.92;
      const bedX = -W / 2 + 0.14 + bedLen / 2;

      // Tufted Wood & Upholstered Headboard
      addBox(0.14, 1.35, bedWid + 0.32, -W / 2 + 0.15, 0.675, bedZ, 'wood');
      addBox(0.06, 0.85, bedWid + 0.16, -W / 2 + 0.23, 0.85, bedZ, 'accent');
      // Bed Frame & Mattress
      addBox(bedLen, 0.26, bedWid, bedX, 0.13, bedZ, 'darkwood');
      addBox(bedLen - 0.08, 0.27, bedWid - 0.08, bedX + 0.02, 0.395, bedZ, 'linen');
      // Accent Duvet Runner
      addBox(0.88, 0.07, bedWid - 0.04, bedX + 0.52, 0.55, bedZ, 'accent');

      // Pillows
      const pOffset = bedWid * 0.23;
      addBox(0.46, 0.15, bedWid * 0.37, -W / 2 + 0.50, 0.60, bedZ - pOffset, 'white');
      addBox(0.46, 0.15, bedWid * 0.37, -W / 2 + 0.50, 0.60, bedZ + pOffset, 'white');

      // Dual Nightstands & Lamps
      [-bedWid / 2 - 0.38, bedWid / 2 + 0.38].forEach(dz => {
        const nz = bedZ + dz;
        addBox(0.50, 0.46, 0.50, -W / 2 + 0.40, 0.23, nz, 'wood');
        addCylinder(0.04, 0.06, 0.24, -W / 2 + 0.40, 0.58, nz, 'darkwood');
        addCylinder(0.11, 0.14, 0.22, -W / 2 + 0.40, 0.78, nz, 'lampShade');
      });

      // Smart TV & Refreshment Credenza on Right Wall (facing bed)
      const tvX = W / 2 - 0.12;
      addBox(0.44, 0.48, 1.75, W / 2 - 0.30, 0.24, bedZ, 'wood');
      // Coffee maker & kettle detail on credenza
      addBox(0.22, 0.26, 0.18, W / 2 - 0.30, 0.61, bedZ - 0.55, 'black');
      addCylinder(0.07, 0.08, 0.18, W / 2 - 0.30, 0.57, bedZ - 0.30, 'chrome');
      // Wall-mounted TV
      addBox(0.07, 0.92, 1.56, tvX, 1.50, bedZ, 'black');
      addBox(0.02, 0.82, 1.44, tvX - 0.04, 1.50, bedZ, 'screen');

      // Daylight Work Desk & Ergonomic Swivel Chair near Window
      const deskX = W / 2 - 1.15;
      const deskZ = -D / 2 + 0.82;
      addBox(1.45, 0.06, 0.66, deskX, 0.75, deskZ, 'wood');
      addBox(0.06, 0.75, 0.58, deskX - 0.64, 0.375, deskZ, 'black');
      addBox(0.06, 0.75, 0.58, deskX + 0.64, 0.375, deskZ, 'black');
      // Laptop on desk
      addBox(0.35, 0.02, 0.24, deskX - 0.08, 0.79, deskZ, 'chrome');
      addBox(0.35, 0.23, 0.02, deskX - 0.08, 0.91, deskZ - 0.11, 'screen');
      // Ergonomic chair
      addBox(0.48, 0.07, 0.46, deskX, 0.45, deskZ + 0.52, 'accent');
      addBox(0.46, 0.42, 0.06, deskX, 0.68, deskZ + 0.72, 'accent');
      addCylinder(0.035, 0.035, 0.42, deskX, 0.21, deskZ + 0.52, 'chrome');
      addBox(0.44, 0.03, 0.44, deskX, 0.02, deskZ + 0.52, 'black');

      // Wardrobe & Luggage Bench (front-left corner)
      addBox(0.95, 2.35, 0.58, -W / 2 + 0.58, 1.175, D / 2 - 0.42, 'wood');
      addBox(0.95, 0.42, 0.46, -W / 2 + 1.62, 0.21, D / 2 - 0.38, 'darkwood');

      // Optional Suite Lounge Sofa (Grand Atelier 55 m²)
      if (cfg.hasLounge) {
        const sofaX = -0.25;
        const sofaZ = D / 2 - 0.85;
        addBox(1.85, 0.38, 0.80, sofaX, 0.19, sofaZ, 'accent');
        addBox(1.85, 0.44, 0.16, sofaX, 0.56, sofaZ + 0.32, 'accent');
        addBox(1.0, 0.05, 0.52, sofaX, 0.35, sofaZ - 0.82, 'wood');
        addBox(0.05, 0.33, 0.05, sofaX - 0.42, 0.165, sofaZ - 1.02, 'black');
        addBox(0.05, 0.33, 0.05, sofaX + 0.42, 0.165, sofaZ - 1.02, 'black');
      }

      // En-Suite Bathroom Architectural Partition & Fixtures (front-right corner)
      const partWallX = W / 2 - bathW;
      const partWallZ = D / 2 - bathD;
      // Glass + half-wall partition separating bedroom & bathroom
      addBox(0.10, 1.05, bathD - 0.75, partWallX, 0.525, bathZ - 0.375, 'wall', roomGroup, 'partition');
      const bathGlass = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(bathD - 0.75, H - 1.15)), mats.showerGlass);
      bathGlass.rotation.y = Math.PI / 2;
      bathGlass.position.set(partWallX, 1.05 + (H - 1.15) / 2, bathZ - 0.375);
      roomGroup.add(bathGlass);

      // Vanity Counter, Sink Basin & Mirror along back bathroom wall
      addBox(bathW - 0.95, 0.78, 0.52, bathX - 0.35, 0.39, partWallZ + 0.34, 'wood');
      addCylinder(0.20, 0.16, 0.14, bathX - 0.35, 0.85, partWallZ + 0.34, 'ceramic');
      addBox(bathW - 1.05, 0.95, 0.04, bathX - 0.35, 1.48, partWallZ + 0.10, 'mirror');

      // Walk-in Glass Shower Enclosure & Rain Showerhead
      const shwX = W / 2 - 0.55;
      const shwZ = partWallZ + 0.58;
      const shwGlass = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(0.95, 2.15)), mats.showerGlass);
      shwGlass.position.set(shwX, 1.08, partWallZ + 1.08);
      roomGroup.add(shwGlass);
      addCylinder(0.14, 0.14, 0.03, shwX, 2.25, shwZ, 'chrome');

      // Ceramic WC
      addBox(0.42, 0.42, 0.56, W / 2 - 0.42, 0.21, D / 2 - 0.45, 'ceramic');
      addBox(0.42, 0.45, 0.18, W / 2 - 0.42, 0.62, D / 2 - 0.24, 'ceramic');

      // Optional Freestanding Soaking Tub (Grand Atelier)
      if (cfg.hasTub) {
        addBox(0.76, 0.54, 1.45, partWallX + 0.52, 0.27, D / 2 - 0.85, 'ceramic');
      }

      // Plants
      addPlant(-W / 2 + 0.52, -D / 2 + 0.52);

      // Update 3D anchor coordinates for hotspots & dimensions
      anchors.bed.set(bedX, 0.95, bedZ);
      anchors.window.set(0, 1.65, -D / 2);
      anchors.tv.set(tvX - 0.1, 1.50, bedZ);
      anchors.desk.set(deskX, 1.05, deskZ);
      anchors.bath.set(bathX, 1.15, bathZ);

      dimAnchors.width.set(0, 0.18, D / 2 - 0.12);
      dimAnchors.depth.set(-W / 2 + 0.15, 0.18, 0);
      dimAnchors.bed.set(bedX, 1.25, bedZ);
      dimAnchors.window.set(0, H - 0.42, -D / 2 + 0.08);
      dimAnchors.bath.set(bathX, 1.35, bathZ);

      // Build 3D Physical Measurement Lines
      addDimensionLine([-W / 2, 0.06, D / 2 - 0.08], [W / 2, 0.06, D / 2 - 0.08]); // Width
      addDimensionLine([-W / 2 + 0.12, 0.06, -D / 2], [-W / 2 + 0.12, 0.06, D / 2]); // Depth
      addDimensionLine([-W / 2 + 0.15, 0.68, bedZ - bedWid / 2], [-W / 2 + 0.15, 0.68, bedZ + bedWid / 2]); // Bed width
      addDimensionLine([-winW / 2, H - 0.36, -D / 2 + 0.08], [winW / 2, H - 0.36, -D / 2 + 0.08]); // Window span
      addDimensionLine([partWallX, 0.06, partWallZ], [partWallX, 0.06, D / 2]); // Bath depth

      // Update UI labels for selected room
      const spotBedEl = document.getElementById('spot-label-bed');
      const spotWinEl = document.getElementById('spot-label-window');
      const floorChipEl = document.getElementById('room3d-floor-chip');
      const outsideTabEl = document.getElementById('tab-outside-view');
      if (spotBedEl) spotBedEl.textContent = cfg.bedLabel;
      if (spotWinEl) spotWinEl.textContent = cfg.viewLabel;
      if (floorChipEl) floorChipEl.textContent = cfg.floorLabel;
      if (outsideTabEl) outsideTabEl.textContent = cfg.viewLabel;

      const setDimText = (keyName, text) => {
        const el = document.querySelector(`[data-dim="${keyName}"]`);
        if (el) el.textContent = text;
      };
      setDimText('width', cfg.dims.widthText);
      setDimText('depth', cfg.dims.depthText);
      setDimText('bed', cfg.dims.bedText);
      setDimText('window', cfg.dims.winText);
      setDimText('bath', cfg.dims.bathText);

      buildExterior(cfg.viewType, W, D);
      applyWallCutaway();
    }

    function applyWallCutaway() {
      const isDollhouse = viewMode === 'dollhouse';
      cutawayWalls.forEach(w => {
        if (!isDollhouse) {
          w.visible = true;
          w.scale.y = 1;
          w.position.y = w.userData.origY;
        } else if (w.userData.wallRole === 'header') {
          w.visible = false;
        } else {
          w.visible = true;
          const targetH = Math.min(w.userData.origH, 0.42);
          w.scale.y = targetH / w.userData.origH;
          w.position.y = targetH / 2;
        }
      });
    }

    let anim = null;
    controls.addEventListener('start', () => { anim = null; });

    function focus(name, showCard = true) {
      const preset = cameraPresets[name] || cameraPresets.overview;
      anim = {
        from: camera.position.clone(),
        to: new THREE.Vector3(...preset.pos),
        targetFrom: controls.target.clone(),
        targetTo: new THREE.Vector3(...preset.target),
        t: 0
      };

      document.querySelectorAll('[data-spot]').forEach(b => {
        b.classList.toggle('active', b.dataset.spot === name);
      });

      const infoCard = document.getElementById('room3d-info');
      const cfg = roomConfigs[currentRoomKey] || roomConfigs.urban;
      if (showCard && cfg.spots[name] && infoCard) {
        document.getElementById('room3d-info-title').textContent = cfg.spots[name].title;
        document.getElementById('room3d-info-body').textContent = cfg.spots[name].body;
        infoCard.classList.remove('hidden');
      } else if (infoCard) {
        infoCard.classList.add('hidden');
      }
    }

    function setMode(next) {
      viewMode = next;
      applyWallCutaway();
      const statusEl = document.getElementById('room3d-status');
      const cfg = roomConfigs[currentRoomKey] || roomConfigs.urban;

      if (next === 'eye') {
        focus('eye', false);
        if (statusEl) statusEl.textContent = 'Eye-Level 360° (1.65 m height) · Drag to look around';
      } else if (next === 'outside') {
        focus('window', true);
        if (statusEl) statusEl.textContent = `${cfg.viewLabel} · ${cfg.floorLabel}`;
      } else if (next === 'dollhouse') {
        focus('dollhouse', false);
        if (statusEl) statusEl.textContent = 'Architectural Floor Plan · Top-down cutaway';
      } else {
        focus('overview', false);
        if (statusEl) statusEl.textContent = '3D Cutaway · Drag to rotate, scroll to zoom';
      }

      document.querySelectorAll('[data-viewmode]').forEach(b => {
        b.classList.toggle('active', b.dataset.viewmode === next);
      });
    }

    function setLight(next) {
      currentLight = next;
      const cfgs = {
        day: { bg: 0xcfe6f2, hemi: 1.85, sun: 2.2, sunCol: 0xfff1d8, lamp: 0, shade: 0.15, cove: 0.25, nightGlow: 0.04, exp: 1.12 },
        sunset: { bg: 0xe6a67e, hemi: 1.25, sun: 1.75, sunCol: 0xff9f5a, lamp: 6, shade: 0.65, cove: 0.55, nightGlow: 0.45, exp: 1.04 },
        night: { bg: 0x132033, hemi: 0.55, sun: 0.35, sunCol: 0x8ab4e8, lamp: 14, shade: 1.15, cove: 0.95, nightGlow: 1.1, exp: 0.92 }
      };
      const c = cfgs[next] || cfgs.day;
      scene.background.setHex(c.bg);
      hemi.intensity = c.hemi;
      sun.intensity = c.sun;
      sun.color.setHex(c.sunCol);
      lampLight.intensity = c.lamp;
      mats.lampShade.emissiveIntensity = c.shade;
      mats.coveGlow.emissiveIntensity = c.cove;
      exteriorNightMeshes.forEach(m => { m.emissiveIntensity = c.nightGlow; });
      renderer.toneMappingExposure = c.exp;

      document.querySelectorAll('[id^="light-"]').forEach(b => {
        b.classList.toggle('active', b.id === 'light-' + next);
      });
    }

    document.querySelectorAll('[data-spot]').forEach(b => {
      b.addEventListener('click', () => {
        const s = b.dataset.spot;
        focus(s, s !== 'overview');
      });
    });

    document.querySelectorAll('[data-viewmode]').forEach(b => {
      b.addEventListener('click', () => setMode(b.dataset.viewmode));
    });

    ['day', 'sunset', 'night'].forEach(n => {
      const btn = document.getElementById('light-' + n);
      if (btn) btn.addEventListener('click', () => setLight(n));
    });

    const dimBtn = document.getElementById('toggle-dimensions');
    const dimContainer = document.getElementById('room3d-dimensions');
    if (dimBtn && dimContainer) {
      dimBtn.addEventListener('click', () => {
        showDimensions = !showDimensions;
        dimLinesGroup.visible = showDimensions;
        dimBtn.classList.toggle('active', showDimensions);
        dimContainer.classList.toggle('hidden', !showDimensions);
      });
    }

    const closeInfoBtn = document.getElementById('room3d-info-close');
    if (closeInfoBtn) {
      closeInfoBtn.addEventListener('click', () => {
        document.getElementById('room3d-info').classList.add('hidden');
      });
    }

    const resetBtn = document.getElementById('room3d-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => setMode(viewMode));
    }

    const fsBtn = document.getElementById('room3d-fullscreen');
    const wrapEl = document.querySelector('.room3d-wrap');
    if (fsBtn && wrapEl) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (wrapEl.requestFullscreen) wrapEl.requestFullscreen();
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      });
      document.addEventListener('fullscreenchange', () => {
        const isFs = document.fullscreenElement === wrapEl;
        fsBtn.textContent = isFs ? '✕ Exit fullscreen' : '⛶ Fullscreen';
        fsBtn.classList.toggle('active', isFs);
        resize();
      });
    }

    const resize = () => {
      const w = host.clientWidth || 640;
      const h = host.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (loadingEl) loadingEl.classList.add('hidden');
    };

    new ResizeObserver(resize).observe(host);
    window.addEventListener('resize', resize);
    window.addEventListener('spacialstay:3d-resize', resize);
    window.addEventListener('spacialstay:room-open', (e) => {
      const roomObj = e && e.detail && e.detail.room;
      const roomId = typeof roomObj === 'string' ? roomObj : (roomObj && roomObj.id) || 'urban';
      buildRoom(roomId);
      setMode('room');
      setLight(currentLight);
      resize();
    });

    const projVec = new THREE.Vector3();
    function updateProjectedOverlays() {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;

      document.querySelectorAll('.room-hotspot').forEach(btn => {
        const anchor = anchors[btn.dataset.spot];
        if (!anchor) return;
        projVec.copy(anchor).project(camera);
        if (projVec.z > 1) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
        } else {
          const x = (projVec.x * 0.5 + 0.5) * w;
          const y = (-projVec.y * 0.5 + 0.5) * h;
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          btn.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        }
      });

      if (showDimensions) {
        document.querySelectorAll('.room3d-dim-tag').forEach(tag => {
          const anchor = dimAnchors[tag.dataset.dim];
          if (!anchor) return;
          projVec.copy(anchor).project(camera);
          if (projVec.z > 1) {
            tag.style.opacity = '0';
          } else {
            const x = (projVec.x * 0.5 + 0.5) * w;
            const y = (-projVec.y * 0.5 + 0.5) * h;
            tag.style.opacity = '1';
            tag.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
        });
      }
    }

    buildRoom('urban');
    setLight('day');
    resize();
    window.__spacialstay3DReady = true;

    function render() {
      requestAnimationFrame(render);
      if (anim) {
        anim.t = Math.min(1, anim.t + 0.048);
        const k = 1 - Math.pow(1 - anim.t, 3);
        camera.position.lerpVectors(anim.from, anim.to, k);
        controls.target.lerpVectors(anim.targetFrom, anim.targetTo, k);
        if (anim.t >= 1) anim = null;
      }
      controls.update();
      updateProjectedOverlays();
      renderer.render(scene, camera);
    }
    render();
  } catch (err) {
    console.error('SpacialStay 3D viewer initialization failed:', err);
    if (loadingEl) {
      loadingEl.textContent = '3D viewer unavailable in this browser session. Please check WebGL or internet connection.';
    }
  }
}
