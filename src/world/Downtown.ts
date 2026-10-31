import * as THREE from 'three';
import { createBurmeseSignboardTexture } from '../textures/proceduralTextures';
import { ColliderBox } from '../types';

/**
 * Procedural 3D model of Pathein Downtown (ပုသိမ်မြို့လယ်)
 * Features traditional shophouses, iconic Pathein Halawa store, Clock Tower, Trishaws (ဆိုက်ကား), and street infrastructure.
 */
export function buildPatheinDowntown(colliders: ColliderBox[]): THREE.Group {
  const downtownGroup = new THREE.Group();
  downtownGroup.name = 'PatheinDowntown';

  // Materials
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.85,
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0xa1a1aa,
    roughness: 0.7,
  });

  const curbMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f5,
    roughness: 0.6,
  });

  const yellowLineMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.5,
  });

  const whiteLineMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
  });

  const woodTrimMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.75,
  });

  // 1. Downtown Main Street (မဟာဗန္ဓုလ လမ်းမကြီး - Maha Bandula Road)
  // Crossroad layout: East-West street & North-South intersection
  // East-West road: X from -20 to 120, Z from -28 to -14
  const roadEW = new THREE.Mesh(new THREE.BoxGeometry(140, 0.15, 14), asphaltMat);
  roadEW.position.set(50, 0.08, -21);
  roadEW.receiveShadow = true;
  downtownGroup.add(roadEW);

  // Center double yellow road markings
  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(138, 0.16, 0.3), yellowLineMat);
  centerLine.position.set(50, 0.09, -21);
  downtownGroup.add(centerLine);

  // Pedestrian Zebra Crosswalks (လူကူးမျဉ်းကျား)
  for (let i = -5; i <= 5; i += 1.4) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.16, 11), whiteLineMat);
    stripe.position.set(24 + i, 0.09, -21);
    downtownGroup.add(stripe);
  }

  // Sidewalks (North & South of road)
  const sidewalkN = new THREE.Mesh(new THREE.BoxGeometry(140, 0.35, 6), sidewalkMat);
  sidewalkN.position.set(50, 0.18, -11);
  sidewalkN.receiveShadow = true;
  downtownGroup.add(sidewalkN);

  const sidewalkS = new THREE.Mesh(new THREE.BoxGeometry(140, 0.35, 6), sidewalkMat);
  sidewalkS.position.set(50, 0.18, -31);
  sidewalkS.receiveShadow = true;
  downtownGroup.add(sidewalkS);

  // 2. Pathein Downtown Clock Tower (ပုသိမ် နာရီစင်)
  // Located at central traffic junction
  const clockTower = createPatheinClockTower();
  clockTower.position.set(24, 0.35, -4);
  downtownGroup.add(clockTower);

  colliders.push({
    minX: 20.5, maxX: 27.5,
    minZ: -7.5, maxZ: -0.5,
  });

  // 3. Shophouses along North Sidewalk
  // Store 1: Famous Pathein Halawa Shop (ပုသိမ်ဟာလဝါ မင်းမင်း)
  const halawaSignTex = createBurmeseSignboardTexture(
    'ပုသိမ်ဟာလဝါ မင်းမင်း',
    'Min Min - Authentic Pathein Halawa Confectionery',
    '#b45309',
    '#fef08a',
    '#fbbf24'
  );
  const halawaShop = createShophouse(
    '#fef3c7',
    '#92400e',
    halawaSignTex,
    true // Halawa display trays in window
  );
  halawaShop.position.set(45, 0.35, -3);
  downtownGroup.add(halawaShop);

  colliders.push({
    minX: 38, maxX: 52,
    minZ: -7, maxZ: 1,
  });

  // Store 2: Ayeyarwady Gold & Gems (ဧရာဝတီ ရွှေပန်းထိမ်)
  const goldSignTex = createBurmeseSignboardTexture(
    'ဧရာဝတီ ရွှေပန်းထိမ်နှင့် ရတနာ',
    'Ayeyarwady Gold Smith & Gems',
    '#7f1d1d',
    '#fbbf24',
    '#fef08a'
  );
  const goldShop = createShophouse('#fef2f2', '#991b1b', goldSignTex);
  goldShop.position.set(62, 0.35, -3);
  downtownGroup.add(goldShop);

  colliders.push({
    minX: 55, maxX: 69,
    minZ: -7, maxZ: 1,
  });

  // Store 3: Rice & Delta Produce Merchant (ဆန်စပါးနှင့် ကုန်မာဆိုင်)
  const riceSignTex = createBurmeseSignboardTexture(
    'ရွှေဧရာ ဆန်စပါး ကုန်မာဆိုင်',
    'Shwe Ayeyar Rice & Delta Provisions',
    '#065f46',
    '#d1fae5',
    '#34d399'
  );
  const riceShop = createShophouse('#ecfdf5', '#047857', riceSignTex);
  riceShop.position.set(79, 0.35, -3);
  downtownGroup.add(riceShop);

  colliders.push({
    minX: 72, maxX: 86,
    minZ: -7, maxZ: 1,
  });

  // Store 4: Shwe Thanaka & Local Herbal Cosmetics (သနပ်ခါးဆိုင်)
  const thanakaSignTex = createBurmeseSignboardTexture(
    'ရွှေဘို သနပ်ခါးနှင့် မြန်မာ့ဆေး',
    'Pure Thanaka & Myanmar Traditional Cosmetics',
    '#854d0e',
    '#fef9c3',
    '#facc15'
  );
  const thanakaShop = createShophouse('#fefce8', '#a16207', thanakaSignTex);
  thanakaShop.position.set(96, 0.35, -3);
  downtownGroup.add(thanakaShop);

  colliders.push({
    minX: 89, maxX: 103,
    minZ: -7, maxZ: 1,
  });

  // 4. Traditional Myanmar Trishaws (ဆိုက်ကား - Myanmar Sidecar Bicycles)
  const trishaw1 = createMyanmarTrishaw('#ef4444');
  trishaw1.position.set(34, 0.35, -8.5);
  trishaw1.rotation.y = 0.3;
  downtownGroup.add(trishaw1);

  const trishaw2 = createMyanmarTrishaw('#3b82f6');
  trishaw2.position.set(38, 0.35, -8.5);
  trishaw2.rotation.y = -0.2;
  downtownGroup.add(trishaw2);

  // 5. Street utility wooden poles with cross arms
  for (let x = 30; x <= 110; x += 26) {
    const pole = createUtilityPole();
    pole.position.set(x, 0.35, -8.2);
    downtownGroup.add(pole);
  }

  // Street Name Signpost (မဟာဗန္ဓုလ လမ်း - Maha Bandula Road)
  const roadSignTex = createBurmeseSignboardTexture(
    'မဟာဗန္ဓုလ လမ်းမကြီး',
    'Maha Bandula Road (Pathein)',
    '#1e293b',
    '#38bdf8',
    '#60a5fa'
  );
  const roadSign = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.9, 0.1),
    new THREE.MeshStandardMaterial({ map: roadSignTex, roughness: 0.3 })
  );
  roadSign.position.set(16, 2.8, -8.5);
  downtownGroup.add(roadSign);

  const roadPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x475569 })
  );
  roadPost.position.set(16, 1.4, -8.5);
  downtownGroup.add(roadPost);

  return downtownGroup;
}

/**
 * Creates Pathein Clock Tower (နာရီစင်)
 */
function createPatheinClockTower(): THREE.Group {
  const tower = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.5,
  });
  const brickMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.7,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Base octagonal podium
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 1.2, 8), brickMat);
  base.position.y = 0.6;
  tower.add(base);

  // Tower shaft
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(3.6, 9.0, 3.6), whiteMat);
  shaft.position.y = 5.7;
  shaft.castShadow = true;
  tower.add(shaft);

  // Corner brick pilasters
  for (let cx = -1; cx <= 1; cx += 2) {
    for (let cz = -1; cz <= 1; cz += 2) {
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.4, 9.0, 0.4), brickMat);
      pilaster.position.set(cx * 1.8, 5.7, cz * 1.8);
      tower.add(pilaster);
    }
  }

  // Clock head cube
  const head = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 4.2), whiteMat);
  head.position.y = 11.4;
  tower.add(head);

  // 4 Clock Dials (Roman numerals procedural texture)
  const dialTex = createClockDialTexture();
  const dialMat = new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.3 });
  const dialGeo = new THREE.CircleGeometry(0.9, 24);

  const dialN = new THREE.Mesh(dialGeo, dialMat);
  dialN.position.set(0, 11.4, 2.12);
  tower.add(dialN);

  const dialS = new THREE.Mesh(dialGeo, dialMat);
  dialS.position.set(0, 11.4, -2.12);
  dialS.rotation.y = Math.PI;
  tower.add(dialS);

  const dialE = new THREE.Mesh(dialGeo, dialMat);
  dialE.position.set(2.12, 11.4, 0);
  dialE.rotation.y = Math.PI / 2;
  tower.add(dialE);

  const dialW = new THREE.Mesh(dialGeo, dialMat);
  dialW.position.set(-2.12, 11.4, 0);
  dialW.rotation.y = -Math.PI / 2;
  tower.add(dialW);

  // Pyatthat conical gold spire top
  const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 0.8, 8), goldMat);
  spireBase.position.y = 13.0;
  tower.add(spireBase);

  const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.5, 8), goldMat);
  spire.position.y = 15.1;
  tower.add(spire);

  return tower;
}

/**
 * Creates clock dial face texture
 */
function createClockDialTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Hour tick marks
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(angle) * 95, 128 + Math.sin(angle) * 95);
    ctx.lineTo(128 + Math.cos(angle) * 115, 128 + Math.sin(angle) * 115);
    ctx.stroke();
  }

  // Hands (set to 3:45 pm sunset tea time!)
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(175, 140);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(85, 85);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Creates Myanmar 2-storey vernacular shophouse
 */
function createShophouse(
  wallColor: string,
  trimColor: string,
  signTexture: THREE.CanvasTexture,
  isHalawaShop: boolean = false
): THREE.Group {
  const shop = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({
    color: wallColor,
    roughness: 0.75,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: trimColor,
    roughness: 0.6,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Red terracotta corrugated roof
    roughness: 0.7,
  });

  // Main structure
  const body = new THREE.Mesh(new THREE.BoxGeometry(13.0, 7.5, 7.5), wallMat);
  body.position.y = 3.75;
  body.castShadow = true;
  shop.add(body);

  // Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(10.5, 2.2, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 8.5;
  shop.add(roof);

  // Balcony on 2nd floor
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.25, 1.2), trimMat);
  balcony.position.set(0, 4.0, -4.0);
  shop.add(balcony);

  // Signboard over entrance
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 1.6, 0.2),
    new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.4 })
  );
  sign.position.set(0, 3.2, -3.9);
  shop.add(sign);

  // Storefront awning
  const awningMat = new THREE.MeshStandardMaterial({
    color: isHalawaShop ? 0xd97706 : 0x0284c7,
    roughness: 0.6,
  });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.15, 2.0), awningMat);
  awning.rotation.x = 0.2;
  awning.position.set(0, 2.4, -4.5);
  shop.add(awning);

  // Entrance door & glass window
  const entranceMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.2 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 0.1), entranceMat);
  door.position.set(0, 1.1, -3.8);
  shop.add(door);

  // If Halawa store, add traditional round gold-painted sweet tins (ဟာလဝါ ဗူးများ)
  if (isHalawaShop) {
    const tinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
    });
    for (let t = -1.2; t <= 1.2; t += 0.8) {
      const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12), tinMat);
      tin.position.set(t, 1.2, -4.6);
      shop.add(tin);
    }
  }

  return shop;
}

/**
 * Creates authentic Myanmar Trishaw (ဆိုက်ကား)
 * Distinctive sidecar bicycle where passenger sits beside the rider back-to-back
 */
function createMyanmarTrishaw(canopyColor: string): THREE.Group {
  const trishaw = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.3,
  });

  const seatLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.7,
  });

  const canopyMat = new THREE.MeshStandardMaterial({
    color: canopyColor,
    roughness: 0.5,
  });

  // Bicycle frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 1.8), metalMat);
  frame.position.set(0, 0.6, 0);
  trishaw.add(frame);

  // Wheels (front, rear, and sidecar wheel)
  const wheelGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 16);
  const wheel1 = new THREE.Mesh(wheelGeo, metalMat);
  wheel1.position.set(0, 0.35, 0.8);
  trishaw.add(wheel1);

  const wheel2 = new THREE.Mesh(wheelGeo, metalMat);
  wheel2.position.set(0, 0.35, -0.8);
  trishaw.add(wheel2);

  // Sidecar wheel on right
  const wheel3 = new THREE.Mesh(wheelGeo, metalMat);
  wheel3.position.set(0.9, 0.35, -0.1);
  trishaw.add(wheel3);

  // Sidecar passenger seat chassis
  const sidecarBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 1.2), seatLeatherMat);
  sidecarBase.position.set(0.7, 0.45, -0.1);
  trishaw.add(sidecarBase);

  // Back-to-back passenger backrests
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.5, 0.1), seatLeatherMat);
  backrest.position.set(0.7, 0.8, -0.1);
  trishaw.add(backrest);

  // Passenger rain/sun canopy hood (folding canvas)
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.7, 12, 1, true, 0, Math.PI), canopyMat);
  hood.rotation.z = Math.PI / 2;
  hood.position.set(0.7, 1.15, -0.1);
  trishaw.add(hood);

  return trishaw;
}

/**
 * Creates utility pole with crossbeams
 */
function createUtilityPole(): THREE.Group {
  const grp = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x3f3f46,
    roughness: 0.9,
  });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8), woodMat);
  pole.position.y = 3.75;
  grp.add(pole);

  // Cross arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.1), woodMat);
  arm.position.y = 6.8;
  grp.add(arm);

  return grp;
}
