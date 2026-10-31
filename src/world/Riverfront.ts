import * as THREE from 'three';
import { createBurmeseSignboardTexture, createStonePavingTexture } from '../textures/proceduralTextures';
import { ColliderBox } from '../types';

/**
 * Procedural 3D model of Pathein Riverfront (ပုသိမ်မြစ်ကမ်းနား)
 * Features wide river, delta sampan boats, passenger ferry, riverside walkway, railings, benches, and lamps.
 */
export function buildPatheinRiverfront(colliders: ColliderBox[]): { group: THREE.Group; updateWater: (time: number) => void } {
  const riverGroup = new THREE.Group();
  riverGroup.name = 'PatheinRiverfront';

  const stoneTexture = createStonePavingTexture(false);
  stoneTexture.repeat.set(20, 4);

  // Materials
  const promenadeMat = new THREE.MeshStandardMaterial({
    map: stoneTexture,
    roughness: 0.65,
    metalness: 0.1,
  });

  const railingMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Colonial dark iron
    metalness: 0.7,
    roughness: 0.35,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.75,
  });

  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.3,
  });

  // 1. Water Surface (Pathein River / Ayeyarwady Delta)
  // River extends from Z: -80 to Z: -180, width 300
  const waterGeo = new THREE.PlaneGeometry(320, 100, 32, 16);
  waterGeo.rotateX(-Math.PI / 2);

  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x1d4e6b, // Rich delta tropical river blue-green
    roughness: 0.15,
    metalness: 0.1,
    transmission: 0.4,
    transparent: true,
    opacity: 0.85,
    reflectivity: 0.9,
  });

  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.set(0, -1.2, -125);
  riverGroup.add(waterMesh);

  // Far river bank terrain to avoid floating void
  const farBankGeo = new THREE.BoxGeometry(340, 6, 40);
  const farBankMat = new THREE.MeshStandardMaterial({
    color: 0x14532d, // Tropical lush green delta mangroves
    roughness: 0.9,
  });
  const farBank = new THREE.Mesh(farBankGeo, farBankMat);
  farBank.position.set(0, 0.5, -185);
  riverGroup.add(farBank);

  // Mangrove trees on far bank
  for (let i = -140; i <= 140; i += 20) {
    const treeTrunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.5, 5, 6),
      woodMat
    );
    treeTrunk.position.set(i + (Math.random() - 0.5) * 8, 4, -180 + (Math.random() - 0.5) * 10);
    riverGroup.add(treeTrunk);

    const treeFoliage = new THREE.Mesh(
      new THREE.SphereGeometry(2.8 + Math.random(), 8, 8),
      farBankMat
    );
    treeFoliage.position.set(treeTrunk.position.x, 7.5, treeTrunk.position.z);
    riverGroup.add(treeFoliage);
  }

  // 2. Promenade Walkway (ကမ်းနား လမ်းလျှောက်စင်္ကြံ)
  const promGeo = new THREE.BoxGeometry(240, 1.2, 18);
  const promMesh = new THREE.Mesh(promGeo, promenadeMat);
  promMesh.position.set(0, 0.6, -66);
  promMesh.receiveShadow = true;
  riverGroup.add(promMesh);

  // River pier extending into the water
  const pierGeo = new THREE.BoxGeometry(16, 1.2, 28);
  const pierMesh = new THREE.Mesh(pierGeo, promenadeMat);
  pierMesh.position.set(-20, 0.6, -82);
  pierMesh.receiveShadow = true;
  riverGroup.add(pierMesh);

  // 3. Iron Safety Railing along the river bank
  // Prevent player from falling off edge
  const railingSegments = [
    { startX: -120, endX: -28, z: -75 },
    { startX: -12, endX: 120, z: -75 },
    // Pier railing
    { startX: -28, endX: -28, z: -82, length: 28, isZ: true },
    { startX: -12, endX: -12, z: -82, length: 28, isZ: true },
    { startX: -28, endX: -12, z: -96, length: 16, isZ: false }, // Pier end
  ];

  // Colliders for river bank
  colliders.push({ minX: -120, maxX: -28, minZ: -76, maxZ: -74 });
  colliders.push({ minX: -12, maxX: 120, minZ: -76, maxZ: -74 });
  colliders.push({ minX: -29, maxX: -27, minZ: -96, maxZ: -74 });
  colliders.push({ minX: -13, maxX: -11, minZ: -96, maxZ: -74 });
  colliders.push({ minX: -28, maxX: -12, minZ: -97, maxZ: -95 });

  railingSegments.forEach(seg => {
    if (seg.isZ) {
      const railBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, seg.length), railingMat);
      railBar.position.set(seg.startX, 1.8, seg.z);
      riverGroup.add(railBar);
    } else {
      const w = seg.length || (seg.endX - seg.startX);
      const cx = (seg.startX + (seg.endX || (seg.startX + seg.length!))) / 2;
      const railBar = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, 0.2), railingMat);
      railBar.position.set(cx, 1.8, seg.z);
      riverGroup.add(railBar);
    }
  });

  // Railing posts
  for (let x = -118; x <= 118; x += 6) {
    if (x > -28 && x < -12) continue; // Pier opening
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.3, 8), railingMat);
    post.position.set(x, 1.8, -75);
    riverGroup.add(post);

    // Decorative top ball
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), goldTrimMat);
    ball.position.set(x, 2.5, -75);
    riverGroup.add(ball);
  }

  // 4. Riverfront Street Lanterns (colonial vintage + Myanmar motifs)
  for (let x = -105; x <= 105; x += 25) {
    const lamp = createRiverfrontLamp(railingMat, goldTrimMat);
    lamp.position.set(x, 1.2, -73.5);
    riverGroup.add(lamp);
  }

  // 5. Promenade Benches (ခုံတန်းလျားများ)
  for (let x = -90; x <= 90; x += 30) {
    if (x > -30 && x < 0) continue;
    const bench = createParkBench(woodMat, railingMat);
    bench.position.set(x, 1.2, -62);
    bench.rotation.y = Math.PI; // Face the river sunset
    riverGroup.add(bench);

    // Bench colliders
    colliders.push({ minX: x - 1.4, maxX: x + 1.4, minZ: -63, maxZ: -61 });
  }

  // 6. River Boats (မြစ်တွင်းသွား သင်္ဘောနှင့် သမ္ဗာန်လှေများ)
  // A. Passenger River Ferry (ပုသိမ်-ရန်ကုန် ပြေးဆွဲသော ရေယာဉ်)
  const ferry = createAyeyarwadyFerry();
  ferry.position.set(-60, -0.6, -110);
  ferry.rotation.y = 0.15;
  riverGroup.add(ferry);

  // B. Traditional Myanmar Wooden Sampans (ပုသိမ် သမ္ဗာန်လှေများ)
  const sampan1 = createMyanmarSampan();
  sampan1.position.set(-20, -0.9, -102);
  sampan1.rotation.y = 0.4;
  riverGroup.add(sampan1);

  const sampan2 = createMyanmarSampan();
  sampan2.position.set(35, -0.9, -118);
  sampan2.rotation.y = -0.3;
  riverGroup.add(sampan2);

  const sampan3 = createMyanmarSampan();
  sampan3.position.set(70, -0.9, -130);
  sampan3.rotation.y = 0.2;
  riverGroup.add(sampan3);

  // 7. Riverfront Welcome Signboard
  const riverSignTex = createBurmeseSignboardTexture(
    'ပုသိမ်မြစ်ကမ်းနား ဆိပ်ခံတံတား',
    'Pathein Riverfront Promenade',
    '#0e7490',
    '#fef08a',
    '#38bdf8'
  );
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 1.8, 0.2),
    new THREE.MeshStandardMaterial({ map: riverSignTex, roughness: 0.4 })
  );
  signMesh.position.set(-20, 3.2, -73.5);
  riverGroup.add(signMesh);

  // Sign posts
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), railingMat);
  postL.position.set(-23.4, 1.6, -73.5);
  riverGroup.add(postL);
  const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), railingMat);
  postR.position.set(-16.6, 1.6, -73.5);
  riverGroup.add(postR);

  // Animation update for water wave ripples and gentle boat bobbing
  const updateWater = (time: number) => {
    // Subtle rocking of sampans
    sampan1.rotation.z = Math.sin(time * 1.8) * 0.04;
    sampan1.position.y = -0.9 + Math.sin(time * 2.2) * 0.05;

    sampan2.rotation.z = Math.cos(time * 1.5) * 0.04;
    sampan2.position.y = -0.9 + Math.cos(time * 1.9) * 0.05;

    ferry.position.y = -0.6 + Math.sin(time * 1.2) * 0.03;
    ferry.rotation.z = Math.sin(time * 1.0) * 0.015;
  };

  return { group: riverGroup, updateWater };
}

/**
 * Creates decorative vintage street lamp
 */
function createRiverfrontLamp(ironMat: THREE.Material, goldMat: THREE.Material): THREE.Group {
  const lamp = new THREE.Group();

  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 4.2, 8), ironMat);
  pole.position.y = 2.1;
  lamp.add(pole);

  // Cross arm with Myanmar floral curve
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.15), ironMat);
  arm.position.y = 4.0;
  lamp.add(arm);

  // Lantern bulb housing (warm glowing)
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const housingGeo = new THREE.OctahedronGeometry(0.35);
  const housing = new THREE.Mesh(housingGeo, bulbMat);
  housing.position.set(0.65, 3.6, 0);
  lamp.add(housing);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 6), goldMat);
  cap.position.set(0.65, 3.9, 0);
  lamp.add(cap);

  return lamp;
}

/**
 * Creates park/promenade bench
 */
export function createParkBench(woodMat: THREE.Material, metalMat: THREE.Material): THREE.Group {
  const bench = new THREE.Group();

  // Wooden slats (seat)
  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.7), woodMat);
  seat.position.y = 0.55;
  bench.add(seat);

  // Wooden backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.1), woodMat);
  back.position.set(0, 1.0, -0.32);
  bench.add(back);

  // Metal legs
  const legGeo = new THREE.BoxGeometry(0.1, 0.55, 0.65);
  const legL = new THREE.Mesh(legGeo, metalMat);
  legL.position.set(-1.0, 0.28, 0);
  bench.add(legL);

  const legR = new THREE.Mesh(legGeo, metalMat);
  legR.position.set(1.0, 0.28, 0);
  bench.add(legR);

  return bench;
}

/**
 * Creates traditional Myanmar Sampan boat (သမ္ဗာန်)
 */
function createMyanmarSampan(): THREE.Group {
  const sampan = new THREE.Group();

  const boatWoodMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.85,
  });

  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.6,
  });

  // Long wooden hull
  const hullGeo = new THREE.BoxGeometry(2.2, 0.7, 7.5);
  const hull = new THREE.Mesh(hullGeo, boatWoodMat);
  hull.castShadow = true;
  sampan.add(hull);

  // Tapered prow / bow (ဦးခေါင်း)
  const prowGeo = new THREE.ConeGeometry(1.2, 2.5, 4);
  prowGeo.rotateX(Math.PI / 2);
  const prow = new THREE.Mesh(prowGeo, boatWoodMat);
  prow.position.set(0, 0.25, 4.2);
  sampan.add(prow);

  // Stern (ပဲ့)
  const stern = new THREE.Mesh(prowGeo, boatWoodMat);
  stern.position.set(0, 0.25, -4.2);
  stern.rotation.y = Math.PI;
  sampan.add(stern);

  // Curved bamboo arched canopy / cabin (ဓနိမိုး သမ္ဗာန်ခေါင်)
  const canopyGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 16, 1, true, 0, Math.PI);
  canopyGeo.rotateZ(Math.PI / 2);
  canopyGeo.rotateY(Math.PI / 2);
  const canopy = new THREE.Mesh(canopyGeo, bambooMat);
  canopy.position.set(0, 0.6, 0);
  sampan.add(canopy);

  // Traditional long oar (တက်မ)
  const oarGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.0, 6);
  const oar = new THREE.Mesh(oarGeo, boatWoodMat);
  oar.rotation.z = Math.PI / 3;
  oar.position.set(1.4, 0.5, -2.5);
  sampan.add(oar);

  return sampan;
}

/**
 * Creates double-decker Ayeyarwady river ferry boat
 */
function createAyeyarwadyFerry(): THREE.Group {
  const ferry = new THREE.Group();

  const whiteHullMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });
  const navyBaseMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // Myanmar Inland Water Transport (IWT) blue
    roughness: 0.5,
  });
  const orangeRoofMat = new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    roughness: 0.6,
  });

  // Main hull
  const hull = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 22), navyBaseMat);
  ferry.add(hull);

  // Passenger deck 1
  const deck1 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 2.0, 18), whiteHullMat);
  deck1.position.set(0, 2.1, -1);
  ferry.add(deck1);

  // Upper deck & Wheelhouse
  const deck2 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.8, 12), whiteHullMat);
  deck2.position.set(0, 4.0, -2);
  ferry.add(deck2);

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.3, 13), orangeRoofMat);
  roof.position.set(0, 5.0, -2);
  ferry.add(roof);

  // Chimney / Exhaust funnel
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.2, 8), orangeRoofMat);
  funnel.position.set(0, 5.8, -4);
  ferry.add(funnel);

  return ferry;
}
