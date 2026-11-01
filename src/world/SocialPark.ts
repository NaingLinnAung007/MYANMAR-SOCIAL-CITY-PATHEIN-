import * as THREE from 'three';
import { createBurmeseSignboardTexture, createStonePavingTexture } from '../textures/proceduralTextures';
import { ColliderBox } from '../types';

/**
 * Procedural 3D model of Social Cafe and Park (သီရိဧရာ လက်ဖက်ရည်ဝိုင်းနှင့် အပန်းဖြေဥယျာဉ်)
 * Features iconic Myanmar outdoor tea shop, low tables & stools, thermos flasks, tea cups, palm trees, and gazebos.
 */
export function buildSocialPark(colliders: ColliderBox[]): THREE.Group {
  const parkGroup = new THREE.Group();
  parkGroup.name = 'SocialCafeAndPark';

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32, // Lush Ayeyarwady delta tropical green
    roughness: 0.85,
  });

  const pathTex = createStonePavingTexture(false);
  pathTex.repeat.set(4, 12);
  const pathMat = new THREE.MeshStandardMaterial({
    map: pathTex,
    roughness: 0.7,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.8,
  });

  const teakRoofMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.6,
  });

  // 1. Park Lawn Ground (Green grass plateau)
  const lawnGeo = new THREE.BoxGeometry(60, 0.4, 50);
  const lawn = new THREE.Mesh(lawnGeo, grassMat);
  lawn.position.set(40, 0.2, 40);
  lawn.receiveShadow = true;
  parkGroup.add(lawn);

  // 2. Stone Footpaths criss-crossing the park
  const pathEW = new THREE.Mesh(new THREE.BoxGeometry(58, 0.45, 4), pathMat);
  pathEW.position.set(40, 0.22, 40);
  pathEW.receiveShadow = true;
  parkGroup.add(pathEW);

  const pathNS = new THREE.Mesh(new THREE.BoxGeometry(4, 0.45, 48), pathMat);
  pathNS.position.set(40, 0.22, 40);
  pathNS.receiveShadow = true;
  parkGroup.add(pathNS);

  // 3. Myanmar Traditional Tea Shop Open-air Pavilion (လက်ဖက်ရည်ဆိုင်)
  // Location: X: 52, Z: 50
  const teaShopSignTex = createBurmeseSignboardTexture(
    'သီရိဧရာ လက်ဖက်ရည်ဝိုင်း',
    'Thiri Ayeyar Myanmar Tea Cafe & Social Lounge',
    '#047857',
    '#fef08a',
    '#34d399'
  );

  const teaSign = new THREE.Mesh(
    new THREE.BoxGeometry(7.0, 1.6, 0.2),
    new THREE.MeshStandardMaterial({ map: teaShopSignTex, roughness: 0.4 })
  );
  teaSign.position.set(52, 4.2, 38);
  parkGroup.add(teaSign);

  // Tea pavilion floor deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 16), woodMat);
  deck.position.set(52, 0.25, 48);
  deck.receiveShadow = true;
  parkGroup.add(deck);

  // Shaded awning / pavilion roof
  const awning = new THREE.Mesh(new THREE.BoxGeometry(19, 0.2, 17), teakRoofMat);
  awning.position.set(52, 3.8, 48);
  awning.castShadow = true;
  parkGroup.add(awning);

  // Awning posts
  const postCoords = [
    { x: 44, z: 41 },
    { x: 60, z: 41 },
    { x: 44, z: 55 },
    { x: 60, z: 55 },
  ];
  postCoords.forEach(c => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.6, 8), woodMat);
    post.position.set(c.x, 1.8, c.z);
    parkGroup.add(post);
  });

  // Tea pavilion colliders
  colliders.push({ minX: 43, maxX: 61, minZ: 40, maxZ: 41.5 });
  colliders.push({ minX: 43, maxX: 61, minZ: 54.5, maxZ: 56 });

  // 4. Traditional Tea Tables (လက်ဖက်ရည်ဝိုင်းများ) with Thermos flasks, cups, and low stools
  const tablePositions = [
    { x: 47, z: 45 },
    { x: 57, z: 45 },
    { x: 47, z: 51 },
    { x: 57, z: 51 },
  ];

  tablePositions.forEach((pos, idx) => {
    const tableSet = createTeaTableSet(idx % 2 === 0 ? '#dc2626' : '#2563eb');
    tableSet.position.set(pos.x, 0.5, pos.z);
    parkGroup.add(tableSet);

    colliders.push({
      minX: pos.x - 1.2, maxX: pos.x + 1.2,
      minZ: pos.z - 1.2, maxZ: pos.z + 1.2,
    });
  });

  // 5. Traditional Teak Gazebo / Rest Pavilion (နားနေဇရပ်) in Park Corner
  const gazebo = createMyanmarZayat();
  gazebo.position.set(22, 0.4, 48);
  parkGroup.add(gazebo);

  colliders.push({
    minX: 18.5, maxX: 25.5,
    minZ: 44.5, maxZ: 51.5,
  });

  // 6. Lotus Flower Pond (ကြာကန်) with Lily pads & Water lilies
  const pond = createLotusPond();
  pond.position.set(24, 0.2, 28);
  parkGroup.add(pond);

  colliders.push({
    minX: 18, maxX: 30,
    minZ: 22, maxZ: 34,
  });

  // 7. Tropical Coconut Palms & Frangipani Trees
  const treeCoords = [
    { x: 18, z: 58, type: 'palm' },
    { x: 34, z: 58, type: 'palm' },
    { x: 62, z: 30, type: 'palm' },
    { x: 16, z: 38, type: 'frangipani' },
    { x: 38, z: 24, type: 'frangipani' },
    { x: 50, z: 22, type: 'palm' },
  ];

  treeCoords.forEach(t => {
    if (t.type === 'palm') {
      const palm = createCoconutPalm();
      palm.position.set(t.x, 0.4, t.z);
      parkGroup.add(palm);
    } else {
      const frangi = createFrangipaniTree();
      frangi.position.set(t.x, 0.4, t.z);
      parkGroup.add(frangi);
    }

    colliders.push({
      minX: t.x - 0.6, maxX: t.x + 0.6,
      minZ: t.z - 0.6, maxZ: t.z + 0.6,
    });
  });

  // 8. 3D Outdoor Cinema (ပုသိမ် ပန်းခြံ ရုပ်ရှင်ရုံကြီး)
  const cinema = createOutdoorCinema();
  cinema.position.set(58, 0.25, 26);
  cinema.rotation.y = -Math.PI / 4;
  parkGroup.add(cinema);

  colliders.push({
    minX: 54, maxX: 62,
    minZ: 22, maxZ: 30,
  });

  // 9. 3D Delta Roller Coaster Track & Cart (ပုသိမ် အပျော်စီး ရိုလာကိုစတာ)
  const coaster = createRollerCoaster();
  coaster.position.set(20, 0.2, 20);
  parkGroup.add(coaster);

  // 10. Myanmar Traditional Radio Player (မြန်မာ့အသံ ရေဒီယို) on tea shop counter
  const radio = createRadioPlayer();
  radio.position.set(51, 1.45, 39);
  parkGroup.add(radio);

  return parkGroup;
}

/**
 * Creates authentic Myanmar Tea Table Set:
 * Round table, stainless steel thermos (ဓာတ်ဘူး), transparent condensed milk tea glasses, green tea pot, and 4 low stools.
 */
function createTeaTableSet(stoolColor: string): THREE.Group {
  const set = new THREE.Group();

  const tableWoodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.6,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.9,
    roughness: 0.15,
  });

  const teaCupMat = new THREE.MeshPhysicalMaterial({
    color: 0xd97706, // Sweet milky tea color
    roughness: 0.1,
    transmission: 0.6,
    transparent: true,
    opacity: 0.85,
  });

  const stoolMat = new THREE.MeshStandardMaterial({
    color: stoolColor,
    roughness: 0.4,
  });

  // Low round tea table
  const tabletop = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.08, 20), tableWoodMat);
  tabletop.position.y = 0.65;
  tabletop.castShadow = true;
  set.add(tabletop);

  const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.65, 8), tableWoodMat);
  tableLeg.position.y = 0.325;
  set.add(tableLeg);

  // Stainless Steel Vacuum Thermos Flask (ဓာတ်ဘူး) - Myanmar tea shop trademark
  const thermos = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12), steelMat);
  thermos.position.set(0, 0.88, 0);
  set.add(thermos);

  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.08, 8), stoolMat);
  cap.position.set(0, 1.14, 0);
  set.add(cap);

  // Small tea glasses
  const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.12, 8), teaCupMat);
  cup1.position.set(0.35, 0.74, 0.2);
  set.add(cup1);

  const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.12, 8), teaCupMat);
  cup2.position.set(-0.3, 0.74, -0.25);
  set.add(cup2);

  // 4 Low Stools (ခုံပုလေးများ)
  const stoolAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  stoolAngles.forEach(ang => {
    const stool = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 12), stoolMat);
    seat.position.y = 0.35;
    stool.add(seat);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.35, 6), tableWoodMat);
    leg.position.y = 0.175;
    stool.add(leg);

    stool.position.set(Math.cos(ang) * 0.95, 0, Math.sin(ang) * 0.95);
    set.add(stool);
  });

  return set;
}

/**
 * Creates traditional Myanmar Teak Gazebo / Rest Pavilion (ဇရပ်)
 */
function createMyanmarZayat(): THREE.Group {
  const zayat = new THREE.Group();

  const teakMat = new THREE.MeshStandardMaterial({
    color: 0x5c2c16,
    roughness: 0.75,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.3,
  });

  // Elevated teak floor platform
  const platform = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.4, 6.4), teakMat);
  platform.position.y = 0.2;
  zayat.add(platform);

  // 4 Pillars
  const pillars = [
    { x: -2.6, z: -2.6 },
    { x: 2.6, z: -2.6 },
    { x: -2.6, z: 2.6 },
    { x: 2.6, z: 2.6 },
  ];
  pillars.forEach(p => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 3.8, 8), teakMat);
    post.position.set(p.x, 2.1, p.z);
    zayat.add(post);
  });

  // Myanmar 2-tier Pyatthat roof
  const roof1 = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.4, 4), teakMat);
  roof1.rotation.y = Math.PI / 4;
  roof1.position.y = 4.4;
  zayat.add(roof1);

  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.2, 4), teakMat);
  roof2.rotation.y = Math.PI / 4;
  roof2.position.y = 5.4;
  zayat.add(roof2);

  // Golden pinnacle
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 8), goldMat);
  finial.position.y = 6.6;
  zayat.add(finial);

  return zayat;
}

/**
 * Creates Lotus Pond with water surface and lily pads
 */
function createLotusPond(): THREE.Group {
  const pond = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.7,
  });

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x064e3b,
    roughness: 0.1,
    transmission: 0.5,
    transparent: true,
    opacity: 0.85,
  });

  const lilyMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.6,
  });

  const flowerMat = new THREE.MeshStandardMaterial({
    color: 0xf472b6, // Lotus pink
    roughness: 0.4,
  });

  // Stone rim wall
  const rim = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.4, 8, 24), stoneMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.25;
  pond.add(rim);

  // Water surface
  const water = new THREE.Mesh(new THREE.CircleGeometry(4.8, 24), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.18;
  pond.add(water);

  // Floating lily pads & pink lotus blossoms
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI * 2) / 8 + Math.random() * 0.4;
    const dist = 1.2 + Math.random() * 2.8;

    const pad = new THREE.Mesh(new THREE.CircleGeometry(0.45, 12), lilyMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(Math.cos(ang) * dist, 0.2, Math.sin(ang) * dist);
    pond.add(pad);

    if (i % 2 === 0) {
      const flower = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.25, 8), flowerMat);
      flower.position.set(pad.position.x, 0.32, pad.position.z);
      pond.add(flower);
    }
  }

  return pond;
}

/**
 * Creates tropical Coconut Palm tree (အုန်းပင်)
 */
function createCoconutPalm(): THREE.Group {
  const palm = new THREE.Group();

  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.85,
  });

  const frondMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });

  // Tall curved trunk
  const trunkSegments = 7;
  let currentY = 0;
  for (let s = 0; s < trunkSegments; s++) {
    const h = 1.2;
    const r = 0.32 - s * 0.02;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.02, r, h, 8), trunkMat);
    seg.position.set(Math.sin(s * 0.2) * 0.3, currentY + h / 2, 0);
    seg.rotation.z = -0.05 * s;
    seg.castShadow = true;
    palm.add(seg);
    currentY += h * 0.95;
  }

  // Radiating Palm Fronds
  const numFronds = 10;
  for (let f = 0; f < numFronds; f++) {
    const angle = (f * Math.PI * 2) / numFronds;
    const frondGeo = new THREE.BoxGeometry(0.4, 0.05, 3.8);
    const frond = new THREE.Mesh(frondGeo, frondMat);

    frond.position.set(
      Math.sin(trunkSegments * 0.2) * 0.3 + Math.cos(angle) * 1.6,
      currentY + 0.2 - 0.3,
      Math.sin(angle) * 1.6
    );
    frond.rotation.y = angle;
    frond.rotation.x = 0.35;
    palm.add(frond);
  }

  return palm;
}

/**
 * Creates Plumeria / Frangipani Tree (တရုတ်စကားပန်းပင်)
 */
function createFrangipaniTree(): THREE.Group {
  const tree = new THREE.Group();

  const barkMat = new THREE.MeshStandardMaterial({
    color: 0xa1a1aa,
    roughness: 0.9,
  });

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.7,
  });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.2, 7), barkMat);
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  tree.add(trunk);

  // Leaf clumps
  const clumpGeo = new THREE.SphereGeometry(1.8, 8, 8);
  const clump1 = new THREE.Mesh(clumpGeo, leafMat);
  clump1.position.set(0, 3.8, 0);
  tree.add(clump1);

  const clump2 = new THREE.Mesh(clumpGeo, leafMat);
  clump2.scale.set(0.7, 0.7, 0.7);
  clump2.position.set(1.2, 4.2, 0.8);
  tree.add(clump2);

  return tree;
}

/**
 * Creates 3D Outdoor Cinema (ပုသိမ် ပန်းခြံ ရုပ်ရှင်ရုံကြီး)
 */
function createOutdoorCinema(): THREE.Group {
  const cinema = new THREE.Group();

  // Steel Truss Frame
  const trussMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.3,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.4, 2.5), trussMat);
  base.position.y = 0.2;
  cinema.add(base);

  const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6.0, 8), trussMat);
  leftPillar.position.set(-3.8, 3.0, 0);
  cinema.add(leftPillar);

  const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6.0, 8), trussMat);
  rightPillar.position.set(3.8, 3.0, 0);
  cinema.add(rightPillar);

  // Big Screen Border
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 4.4, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
  );
  frame.position.set(0, 3.5, 0);
  cinema.add(frame);

  // Glowing Projection Screen with Canvas Texture
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 288);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#b45309');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 288);

    // River silhouette
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 220, 512, 68);

    // Golden pagoda spire silhouette
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(256, 80);
    ctx.lineTo(240, 220);
    ctx.lineTo(272, 220);
    ctx.closePath();
    ctx.fill();

    // Cinema title banner
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(40, 30, 432, 50);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 22px Myanmar, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 ပုသိမ် ရုပ်ရှင်ရုံကြီး (Pathein Cinema)', 256, 62);
  }

  const screenTex = new THREE.CanvasTexture(canvas);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    emissive: 0xffedd5,
    emissiveIntensity: 0.35,
    roughness: 0.2,
  });

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 4.0), screenMat);
  screen.position.set(0, 3.5, 0.12);
  cinema.add(screen);

  return cinema;
}

/**
 * Creates 3D Delta Roller Coaster (ပုသိမ် အပျော်စီး ရိုလာကိုစတာ)
 */
function createRollerCoaster(): THREE.Group {
  const coaster = new THREE.Group();

  const railMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.2,
  });

  const supportMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.6,
    roughness: 0.4,
  });

  // Track points along delta park
  const curvePoints = [
    new THREE.Vector3(0, 1.5, 0),
    new THREE.Vector3(12, 4.5, -6),
    new THREE.Vector3(18, 8.0, 8),
    new THREE.Vector3(10, 10.5, 18),
    new THREE.Vector3(-4, 6.0, 15),
    new THREE.Vector3(-10, 3.5, 4),
    new THREE.Vector3(0, 1.5, 0),
  ];

  const curve = new THREE.CatmullRomCurve3(curvePoints, true);
  const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.14, 8, true);
  const track = new THREE.Mesh(tubeGeo, railMat);
  coaster.add(track);

  // Vertical support pylons
  curvePoints.slice(0, 6).forEach(pt => {
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, pt.y, 6), supportMat);
    pylon.position.set(pt.x, pt.y / 2, pt.z);
    coaster.add(pylon);
  });

  // Coaster Cart at station
  const cart = new THREE.Group();
  const cartBody = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 1.0),
    new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 })
  );
  cartBody.position.y = 0.4;
  cart.add(cartBody);

  // Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
  for (let wx = -0.6; wx <= 0.6; wx += 1.2) {
    for (let wz = -0.55; wz <= 0.55; wz += 1.1) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 8), wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.1, wz);
      cart.add(w);
    }
  }

  cart.position.set(0, 1.6, 0);
  coaster.add(cart);

  return coaster;
}

/**
 * Creates Myanmar Radio Player (မြန်မာ့အသံ ရေဒီယို)
 */
function createRadioPlayer(): THREE.Group {
  const radio = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.6,
  });

  const grillMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.4,
  });

  // Radio wooden body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.4), woodMat);
  radio.add(body);

  // Speaker grill
  const grill = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), grillMat);
  grill.position.set(-0.2, 0.05, 0.21);
  radio.add(grill);

  // Dial knob
  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 })
  );
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.22, 0.08, 0.22);
  radio.add(knob);

  // Antenna
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.015, 0.7, 4),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
  );
  antenna.position.set(0.3, 0.55, -0.1);
  antenna.rotation.z = -0.25;
  radio.add(antenna);

  return radio;
}

