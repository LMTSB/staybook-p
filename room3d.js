import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const host = document.getElementById('room3d');
const loadingEl = document.getElementById('viewer-loading');

if (host) {
  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfe6f2);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
    camera.position.set(7.6, 5.4, 8.8);

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
    controls.minDistance = 3.2;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.target.set(0, 1.0, -0.2);

    const mats = {};
    const makeMat = (name, color, roughness = 0.8, metalness = 0.02, extra = {}) => {
      mats[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
      return mats[name];
    };

    makeMat('floor', 0xc9b498, 0.72);
    makeMat('wall', 0xede9e0, 0.9);
    makeMat('wood', 0x966742, 0.65);
    makeMat('darkwood', 0x4b3527, 0.6);
    makeMat('linen', 0xf6f3ec, 0.85);
    makeMat('accent', 0x527966, 0.82);
    makeMat('glass', 0x8cc8de, 0.1, 0.15, { transparent: true, opacity: 0.22, depthWrite: false });
    makeMat('black', 0x1e2624, 0.45, 0.3);
    makeMat('white', 0xffffff, 0.7);
    makeMat('plant', 0x4b7d58, 0.75);
    makeMat('rug', 0xd7dfd7, 0.92);
    makeMat('lampShade', 0xfff5e0, 0.5, 0, { emissive: new THREE.Color(0xffb86b), emissiveIntensity: 0.15 });
    makeMat('screen', 0x11181c, 0.2, 0.4, { emissive: new THREE.Color(0x1f3a44), emissiveIntensity: 0.35 });

    const roomGroup = new THREE.Group();
    const exteriorGroup = new THREE.Group();
    scene.add(roomGroup);
    scene.add(exteriorGroup);

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

    function addPlant(x, z, parent = roomGroup) {
      const g = new THREE.Group();
      const pot = new THREE.Mesh(trackGeom(new THREE.CylinderGeometry(0.22, 0.16, 0.36, 14)), mats.darkwood);
      pot.position.y = 0.18;
      pot.castShadow = true;
      g.add(pot);

      const trunk = new THREE.Mesh(trackGeom(new THREE.CylinderGeometry(0.035, 0.055, 0.65, 8)), mats.wood);
      trunk.position.y = 0.52;
      g.add(trunk);

      for (let i = 0; i < 8; i++) {
        const leaf = new THREE.Mesh(trackGeom(new THREE.SphereGeometry(0.22, 10, 8)), mats.plant);
        leaf.scale.set(0.42, 0.18, 1.05);
        leaf.position.set(Math.cos(i * 0.8) * 0.28, 0.72 + (i % 3) * 0.18, Math.sin(i * 0.8) * 0.28);
        leaf.rotation.y = i * 0.8;
        leaf.rotation.z = 0.35;
        leaf.castShadow = true;
        g.add(leaf);
      }
      g.position.set(x, 0, z);
      parent.add(g);
    }

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8d8578, 1.85);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1d8, 2.2);
    sun.position.set(-3, 7.5, -6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    const fillLight = new THREE.PointLight(0xfff4e4, 18, 15);
    fillLight.position.set(0, 2.75, 0.5);
    scene.add(fillLight);

    const lampLight = new THREE.PointLight(0xffb566, 0, 7);
    lampLight.position.set(-2.6, 1.25, 0.35);
    scene.add(lampLight);

    const roomConfigs = {
      urban: {
        dims: { w: 7.6, d: 5.6, dimText: '6.3 × 6.0 m (38 m²)', bedText: 'King 180 × 200 cm', winText: 'Window 5.4 m', ceilText: 'Ceiling 3.1 m' },
        accentColor: 0x4f7a68,
        bedLabel: 'King bed',
        viewLabel: 'City view',
        floorLabel: 'Floor 14 · Sukhumvit',
        viewType: 'city',
        isQueen: false,
        hasLounge: false,
        spots: {
          bed: {
            title: 'King Bed · 180 × 200 cm',
            body: 'Orthopedic pocket-spring mattress, crisp 400-thread-count linen, dual floating nightstands with USB-C outlets, and warm reading lamps.'
          },
          window: {
            title: 'Floor 14 · East-Facing Sukhumvit Skyline',
            body: '5.4 m wide double-glazed panoramic window overlooking central Sukhumvit towers with blackout and sheer curtains.'
          },
          tv: {
            title: '55" 4K Smart TV & Media Console',
            body: 'Wall-mounted directly opposite the bed (3.4 m viewing distance) with screen casting, streaming apps, and minibar credenza below.'
          },
          desk: {
            title: 'Dedicated Workspace · 150 × 70 cm',
            body: 'Natural daylight desk positioned beside the window with ergonomic seating, task lamp, and international power sockets.'
          }
        }
      },
      calm: {
        dims: { w: 6.8, d: 5.2, dimText: '6.1 × 5.2 m (32 m²)', bedText: 'Queen 160 × 200 cm', winText: 'Window 4.6 m', ceilText: 'Ceiling 3.0 m' },
        accentColor: 0x7c8f7a,
        bedLabel: 'Queen bed',
        viewLabel: 'Garden view',
        floorLabel: 'Floor 4 · Ari Courtyard',
        viewType: 'garden',
        isQueen: true,
        hasLounge: false,
        spots: {
          bed: {
            title: 'Queen Bed · 160 × 200 cm',
            body: 'Minimalist low-profile oak bed frame with breathable natural cotton bedding and soft ambient bedside lighting.'
          },
          window: {
            title: 'Floor 4 · Ari Leafy Neighbourhood View',
            body: '4.6 m wide window facing a quiet green courtyard and low-rise Ari rooftops for calm morning light.'
          },
          tv: {
            title: '50" Smart TV & Tea Station',
            body: 'Mounted opposite the Queen bed with an artisanal ceramic tea tray and silent mini-fridge beneath.'
          },
          desk: {
            title: 'Window-Side Writing Desk · 140 × 65 cm',
            body: 'Compact timber work surface with direct garden views, warm task lighting, and high-speed Wi-Fi access.'
          }
        }
      },
      atelier: {
        dims: { w: 8.6, d: 6.2, dimText: '8.8 × 6.2 m (55 m²)', bedText: 'King 180 × 200 cm', winText: 'Window 6.4 m', ceilText: 'Ceiling 3.2 m' },
        accentColor: 0x9c6b4e,
        bedLabel: 'King bed',
        viewLabel: 'River view',
        floorLabel: 'Floor 22 · Riverside',
        viewType: 'river',
        isQueen: false,
        hasLounge: true,
        spots: {
          bed: {
            title: 'King Suite Bed · 180 × 200 cm',
            body: 'Generous suite sleeping zone with upholstered headboard, plush pillows, and panoramic river sightlines from the mattress.'
          },
          window: {
            title: 'Floor 22 · West-Facing Chao Phraya River View',
            body: '6.4 m floor-to-ceiling glass wall with unobstructed river bend views—ideal for golden-hour sunsets.'
          },
          tv: {
            title: '65" 4K Smart TV & Lounge Console',
            body: 'Large-format screen positioned cleanly across from both the King bed and the suite lounge seating area.'
          },
          desk: {
            title: 'Executive Corner Desk · 165 × 75 cm',
            body: 'Spacious riverside workspace paired with an adjacent lounge sofa and coffee table for extended stays.'
          }
        }
      }
    };

    let currentRoomKey = 'urban';
    let viewMode = 'room';
    let currentLight = 'day';
    let showDimensions = false;

    const anchors = {
      bed: new THREE.Vector3(-2.0, 1.0, 0.35),
      window: new THREE.Vector3(0, 1.75, -2.7),
      tv: new THREE.Vector3(3.5, 1.75, 0.35),
      desk: new THREE.Vector3(2.3, 1.15, -1.75)
    };

    const dimAnchors = {
      room: new THREE.Vector3(0, 0.15, 2.5),
      bed: new THREE.Vector3(-2.1, 1.35, 0.35),
      window: new THREE.Vector3(0, 2.85, -2.75),
      ceiling: new THREE.Vector3(-3.6, 2.8, -2.6)
    };

    const cameraPresets = {
      overview: { pos: [7.6, 5.4, 8.8], target: [0, 1.0, -0.2] },
      dollhouse: { pos: [0.1, 10.6, 7.6], target: [0, 0.4, -0.1] },
      bed: { pos: [2.2, 2.35, 3.1], target: [-2.1, 0.75, 0.35] },
      window: { pos: [0, 1.85, 2.4], target: [0, 1.65, -6.5] },
      desk: { pos: [-0.4, 2.35, 1.3], target: [2.4, 0.95, -1.75] },
      tv: { pos: [-1.4, 2.25, 3.0], target: [3.6, 1.65, 0.35] }
    };

    function clearSceneGroups() {
      while (roomGroup.children.length > 0) roomGroup.remove(roomGroup.children[0]);
      while (exteriorGroup.children.length > 0) exteriorGroup.remove(exteriorGroup.children[0]);
      while (disposableGeoms.length > 0) {
        const g = disposableGeoms.pop();
        if (g && g.dispose) g.dispose();
      }
      cutawayWalls.length = 0;
      exteriorNightMeshes.length = 0;
    }

    function buildExterior(viewType, W, D) {
      const balcZ = -D / 2 - 0.65;
      addBox(W + 0.4, 0.14, 1.2, 0, -0.07, balcZ, 'floor', exteriorGroup);
      const railGlass = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(W, 0.95)), mats.glass);
      railGlass.position.set(0, 0.52, -D / 2 - 1.18);
      exteriorGroup.add(railGlass);
      addBox(W + 0.1, 0.06, 0.08, 0, 1.02, -D / 2 - 1.18, 'black', exteriorGroup);

      if (viewType === 'city') {
        const ground = new THREE.Mesh(
          trackGeom(new THREE.PlaneGeometry(60, 40)),
          new THREE.MeshStandardMaterial({ color: 0x6f7b78, roughness: 0.95 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -14, -20);
        exteriorGroup.add(ground);

        const towers = [
          [-11, 13, -13, 3.4, 3.4, 0x7b8d96],
          [-6.5, 17, -15, 3.8, 3.6, 0x6b7f8a],
          [-2.0, 11, -12, 3.2, 3.0, 0x8798a0],
          [2.8, 19, -16, 4.2, 3.8, 0x637784],
          [7.8, 14, -13.5, 3.5, 3.4, 0x7a8b94],
          [12.2, 10, -12, 3.2, 3.0, 0x8a9aa1]
        ];

        towers.forEach(([tx, th, tz, tw, td, col]) => {
          const bMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.2 });
          const tower = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(tw, th, td)), bMat);
          tower.position.set(tx, -14 + th / 2, tz);
          exteriorGroup.add(tower);

          const winMat = new THREE.MeshStandardMaterial({
            color: 0xffe6a3,
            emissive: new THREE.Color(0xffcf70),
            emissiveIntensity: 0.05,
            roughness: 0.3
          });
          exteriorNightMeshes.push(winMat);
          for (let row = 0; row < 5; row++) {
            const band = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(tw * 0.72, 0.25)), winMat);
            band.position.set(tx, -6 + row * 1.65, tz + td / 2 + 0.02);
            exteriorGroup.add(band);
          }
        });
      } else if (viewType === 'garden') {
        const lawn = new THREE.Mesh(
          trackGeom(new THREE.PlaneGeometry(50, 35)),
          new THREE.MeshStandardMaterial({ color: 0x688c5e, roughness: 0.9 })
        );
        lawn.rotation.x = -Math.PI / 2;
        lawn.position.set(0, -4.5, -16);
        exteriorGroup.add(lawn);

        for (let i = 0; i < 14; i++) {
          const tx = -12 + i * 1.85;
          const tz = -8.5 - (i % 3) * 2.8;
          const canopy = new THREE.Mesh(
            trackGeom(new THREE.SphereGeometry(1.45 + (i % 2) * 0.4, 14, 10)),
            new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x4f7d4c : 0x629158, roughness: 0.85 })
          );
          canopy.position.set(tx, -1.8 + (i % 3) * 0.7, tz);
          exteriorGroup.add(canopy);
        }
      } else {
        const river = new THREE.Mesh(
          trackGeom(new THREE.PlaneGeometry(70, 36)),
          new THREE.MeshStandardMaterial({ color: 0x4f8a96, roughness: 0.25, metalness: 0.35 })
        );
        river.rotation.x = -Math.PI / 2;
        river.position.set(0, -16, -20);
        exteriorGroup.add(river);

        const farBank = new THREE.Mesh(
          trackGeom(new THREE.BoxGeometry(70, 2.5, 8)),
          new THREE.MeshStandardMaterial({ color: 0x657d6e, roughness: 0.85 })
        );
        farBank.position.set(0, -15, -34);
        exteriorGroup.add(farBank);

        const skylineMat = new THREE.MeshStandardMaterial({
          color: 0x73858e,
          emissive: new THREE.Color(0xffc978),
          emissiveIntensity: 0.05,
          roughness: 0.5
        });
        exteriorNightMeshes.push(skylineMat);
        for (let i = 0; i < 8; i++) {
          const h = 4 + (i % 4) * 2.4;
          const b = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(2.6, h, 2.4)), skylineMat);
          b.position.set(-14 + i * 4, -14 + h / 2, -31);
          exteriorGroup.add(b);
        }
      }
    }

    function buildRoom(key) {
      currentRoomKey = key;
      const cfg = roomConfigs[key] || roomConfigs.urban;
      const { w: W, d: D } = cfg.dims;
      const H = 3.1;

      clearSceneGroups();
      mats.accent.color.setHex(cfg.accentColor);

      // Floor
      addBox(W, 0.18, D, 0, -0.09, 0, 'floor');

      // Left Wall, Right Wall, Back Window Sill/Header/Pillars
      addBox(0.16, H, D, -W / 2, H / 2, 0, 'wall', roomGroup, 'side');
      addBox(0.16, H, D, W / 2, H / 2, 0, 'wall', roomGroup, 'side');
      addBox(W, 0.38, 0.16, 0, 0.19, -D / 2, 'wall', roomGroup, 'sill');
      addBox(W, 0.34, 0.16, 0, H - 0.17, -D / 2, 'wall', roomGroup, 'header');
      addBox(0.75, H, 0.16, -W / 2 + 0.375, H / 2, -D / 2, 'wall', roomGroup, 'pillar');
      addBox(0.75, H, 0.16, W / 2 - 0.375, H / 2, -D / 2, 'wall', roomGroup, 'pillar');

      // Panoramic Glass & Mullions
      const winW = W - 1.5;
      const glass = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(winW, H - 0.72)), mats.glass);
      glass.position.set(0, H / 2, -D / 2 + 0.02);
      roomGroup.add(glass);

      const mullionPositions = [-winW / 2, -winW / 6, winW / 6, winW / 2];
      mullionPositions.forEach(mx => {
        addBox(0.07, H - 0.7, 0.11, mx, H / 2, -D / 2 + 0.04, 'black');
      });
      addBox(winW + 0.1, 0.08, 0.12, 0, 0.38, -D / 2 + 0.04, 'black');
      addBox(winW + 0.1, 0.08, 0.12, 0, H - 0.34, -D / 2 + 0.04, 'black');

      // Baseboards
      addBox(0.05, 0.09, D, -W / 2 + 0.1, 0.045, 0, 'darkwood');
      addBox(0.05, 0.09, D, W / 2 - 0.1, 0.045, 0, 'darkwood');

      // Area Rug
      addBox(3.1, 0.025, 2.6, -0.6, 0.013, 0.35, 'rug');

      // Bed (Headboard against Left Wall, facing TV on Right Wall)
      const bedLen = 2.35;
      const bedWid = cfg.isQueen ? 1.85 : 2.15;
      const bedX = -W / 2 + 0.14 + bedLen / 2;
      const bedZ = 0.35;

      addBox(0.14, 1.32, bedWid + 0.25, -W / 2 + 0.15, 0.66, bedZ, 'wood');
      addBox(bedLen, 0.28, bedWid, bedX, 0.14, bedZ, 'darkwood');
      addBox(bedLen - 0.08, 0.28, bedWid - 0.08, bedX + 0.02, 0.42, bedZ, 'linen');
      addBox(0.95, 0.08, bedWid - 0.04, bedX + 0.58, 0.58, bedZ, 'accent');

      const pOffset = bedWid * 0.24;
      addBox(0.48, 0.16, bedWid * 0.38, -W / 2 + 0.52, 0.63, bedZ - pOffset, 'white');
      addBox(0.48, 0.16, bedWid * 0.38, -W / 2 + 0.52, 0.63, bedZ + pOffset, 'white');

      [-bedWid / 2 - 0.42, bedWid / 2 + 0.42].forEach(dz => {
        const nz = bedZ + dz;
        addBox(0.54, 0.48, 0.54, -W / 2 + 0.42, 0.24, nz, 'wood');
        addBox(0.12, 0.24, 0.12, -W / 2 + 0.42, 0.6, nz, 'darkwood');
        addBox(0.24, 0.22, 0.24, -W / 2 + 0.42, 0.8, nz, 'lampShade');
      });

      // Smart TV & Media Console on Right Wall
      const tvX = W / 2 - 0.12;
      addBox(0.46, 0.46, 1.9, W / 2 - 0.32, 0.23, bedZ, 'wood');
      addBox(0.08, 0.96, 1.68, tvX, 1.55, bedZ, 'black');
      addBox(0.02, 0.86, 1.56, tvX - 0.045, 1.55, bedZ, 'screen');

      // Work Desk & Chair
      const deskX = W / 2 - 1.25;
      const deskZ = -D / 2 + 0.88;
      addBox(1.5, 0.07, 0.68, deskX, 0.76, deskZ, 'wood');
      addBox(0.07, 0.76, 0.6, deskX - 0.66, 0.38, deskZ, 'black');
      addBox(0.07, 0.76, 0.6, deskX + 0.66, 0.38, deskZ, 'black');
      addBox(0.36, 0.02, 0.25, deskX - 0.1, 0.81, deskZ, 'black');
      addBox(0.36, 0.24, 0.02, deskX - 0.1, 0.93, deskZ - 0.12, 'screen');
      addBox(0.5, 0.07, 0.48, deskX, 0.46, deskZ + 0.56, 'accent');
      addBox(0.5, 0.42, 0.07, deskX, 0.68, deskZ + 0.77, 'accent');
      addBox(0.08, 0.46, 0.08, deskX, 0.23, deskZ + 0.56, 'black');

      // Wardrobe
      addBox(0.95, 2.35, 0.6, -W / 2 + 0.58, 1.175, D / 2 - 0.45, 'wood');

      // Suite Lounge for Grand Atelier
      if (cfg.hasLounge) {
        const sofaX = 0.75;
        const sofaZ = D / 2 - 0.85;
        addBox(1.75, 0.38, 0.78, sofaX, 0.19, sofaZ, 'accent');
        addBox(1.75, 0.45, 0.16, sofaX, 0.56, sofaZ + 0.31, 'accent');
        addBox(0.95, 0.06, 0.52, sofaX, 0.36, sofaZ - 0.85, 'wood');
        addBox(0.06, 0.34, 0.06, sofaX - 0.4, 0.17, sofaZ - 1.05, 'black');
        addBox(0.06, 0.34, 0.06, sofaX + 0.4, 0.17, sofaZ - 1.05, 'black');
      }

      addPlant(-W / 2 + 0.55, -D / 2 + 0.55);
      addPlant(W / 2 - 0.48, D / 2 - 0.48);

      anchors.bed.set(bedX, 0.95, bedZ);
      anchors.window.set(0, 1.65, -D / 2);
      anchors.tv.set(tvX - 0.1, 1.55, bedZ);
      anchors.desk.set(deskX, 1.05, deskZ);

      dimAnchors.room.set(0, 0.15, D / 2 - 0.25);
      dimAnchors.bed.set(bedX, 1.25, bedZ);
      dimAnchors.window.set(0, H - 0.45, -D / 2 + 0.1);
      dimAnchors.ceiling.set(-W / 2 + 0.35, H - 0.25, -D / 2 + 0.35);

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
      setDimText('room', cfg.dims.dimText);
      setDimText('bed', cfg.dims.bedText);
      setDimText('window', cfg.dims.winText);
      setDimText('ceiling', cfg.dims.ceilText);

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

      if (next === 'outside') {
        focus('window', true);
        if (statusEl) statusEl.textContent = `${cfg.viewLabel} · ${cfg.floorLabel}`;
      } else if (next === 'dollhouse') {
        focus('dollhouse', false);
        if (statusEl) statusEl.textContent = '3D floor plan · open architectural cutaway';
      } else {
        focus('overview', false);
        if (statusEl) statusEl.textContent = 'Interactive room model · drag to rotate';
      }

      document.querySelectorAll('[data-viewmode]').forEach(b => {
        b.classList.toggle('active', b.dataset.viewmode === next);
      });
    }

    function setLight(next) {
      currentLight = next;
      const cfgs = {
        day: { bg: 0xcfe6f2, hemi: 1.85, sun: 2.2, sunCol: 0xfff1d8, lamp: 0, shade: 0.15, nightGlow: 0.04, exp: 1.12 },
        sunset: { bg: 0xe6a67e, hemi: 1.25, sun: 1.75, sunCol: 0xff9f5a, lamp: 6, shade: 0.65, nightGlow: 0.45, exp: 1.04 },
        night: { bg: 0x132033, hemi: 0.55, sun: 0.35, sunCol: 0x8ab4e8, lamp: 14, shade: 1.15, nightGlow: 1.1, exp: 0.92 }
      };
      const c = cfgs[next] || cfgs.day;
      scene.background.setHex(c.bg);
      hemi.intensity = c.hemi;
      sun.intensity = c.sun;
      sun.color.setHex(c.sunCol);
      lampLight.intensity = c.lamp;
      mats.lampShade.emissiveIntensity = c.shade;
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
    window.addEventListener('staybook:3d-resize', resize);
    window.addEventListener('staybook:room-open', (e) => {
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
    window.__staybook3DReady = true;

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
    console.error('StayBook 3D viewer initialization failed:', err);
    if (loadingEl) {
      loadingEl.textContent = '3D viewer unavailable in this browser session. Please check WebGL or internet connection.';
    }
  }
}
