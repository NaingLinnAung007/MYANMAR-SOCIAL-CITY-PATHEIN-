import * as THREE from 'three';
import { createPatheinUmbrellaTexture, createBurmeseSignboardTexture } from '../textures/proceduralTextures';
import { ColliderBox } from '../types';

/**
 * Procedural 3D model of Pathein Umbrella Market (ပုသိမ်ထီးဈေး)
 * Celebrates Pathein's signature handmade traditional umbrellas with overhead canopies, artisan stalls, and drying racks.
 */
export function buildUmbrellaMarket(colliders: ColliderBox[]): { group: THREE.Group; updateUmbrellas: (time: number) => void } {
  const marketGroup = new THREE.Group();
  marketGroup.name = 'PatheinUmbrellaMarket';

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x5c2c16,
    roughness: 0.8,
  });

  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.6,
  });

  const clothRoofMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.9,
  });

  // Pre-generate umbrella textures
  const umbrellaThemes: Array<'ruby' | 'gold' | 'emerald' | 'sapphire' | 'violet'> = [
    'ruby', 'gold', 'emerald', 'sapphire', 'violet'
  ];
  const umbrellaMats = umbrellaThemes.map(theme => {
    const tex = createPatheinUmbrellaTexture(theme);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.45,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  });

  // 1. Market Alley Walkway Flooring
  const floorGeo = new THREE.BoxGeometry(42, 0.4, 32);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.75,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(-52, 0.2, 0);
  floor.receiveShadow = true;
  marketGroup.add(floor);

  // 2. Overhead Floating / Suspended Pathein Umbrellas
  // Create an enchanting canopy of umbrellas hanging from criss-crossed wire ropes
  const hangingUmbrellas: THREE.Mesh[] = [];

  for (let x = -68; x <= -36; x += 4.5) {
    for (let z = -12; z <= 12; z += 4.5) {
      const matIdx = Math.floor(Math.random() * umbrellaMats.length);
      const umbrellaGeo = new THREE.ConeGeometry(1.6, 0.6, 24, 1, true);
      const umbrellaMesh = new THREE.Mesh(umbrellaGeo, umbrellaMats[matIdx]);

      // Suspended at 4.2m to 5.0m height
      const y = 4.4 + (Math.sin(x) + Math.cos(z)) * 0.35;
      umbrellaMesh.position.set(x + (Math.random() - 0.5) * 0.8, y, z + (Math.random() - 0.5) * 0.8);
      // Inverted or upright hanging
      umbrellaMesh.rotation.x = Math.PI + (Math.random() - 0.5) * 0.2;
      umbrellaMesh.rotation.z = (Math.random() - 0.5) * 0.2;

      // Central stem / handle
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), bambooMat);
      stem.position.y = -0.5;
      umbrellaMesh.add(stem);

      marketGroup.add(umbrellaMesh);
      hangingUmbrellas.push(umbrellaMesh);
    }
  }

  // 3. Traditional Umbrella Workshop & Market Stalls (North & South Sides)
  // North row stalls
  for (let x = -65; x <= -38; x += 13) {
    const stall = createUmbrellaStall(x, 11, umbrellaMats, woodMat, clothRoofMat, bambooMat);
    marketGroup.add(stall);

    colliders.push({
      minX: x - 5.5, maxX: x + 5.5,
      minZ: 7.5, maxZ: 14.5,
    });
  }

  // South row stalls
  for (let x = -65; x <= -38; x += 13) {
    const stall = createUmbrellaStall(x, -11, umbrellaMats, woodMat, clothRoofMat, bambooMat, true);
    marketGroup.add(stall);

    colliders.push({
      minX: x - 5.5, maxX: x + 5.5,
      minZ: -14.5, maxZ: -7.5,
    });
  }

  // 4. Center Umbrella Crafting Demonstration Table
  const craftTable = createCraftingStation(woodMat, bambooMat, umbrellaMats[0]);
  craftTable.position.set(-52, 0.4, 0);
  marketGroup.add(craftTable);

  colliders.push({
    minX: -54.5, maxX: -49.5,
    minZ: -2.5, maxZ: 2.5,
  });

  // 5. Market Entrance Arch & Burmese Signboard
  const entranceSignTex = createBurmeseSignboardTexture(
    'ပုသိမ်ထီး ရိုးရာလက်မှု ဈေးတန်း',
    'Pathein Traditional Umbrella Market & Workshop',
    '#991b1b',
    '#fef08a',
    '#fbbf24'
  );
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 2.0, 0.25),
    new THREE.MeshStandardMaterial({ map: entranceSignTex, roughness: 0.4 })
  );
  signMesh.position.set(-32, 5.2, 0);
  marketGroup.add(signMesh);

  // Entrance Bamboo / Teak Arch Posts
  const archPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5.5, 8), woodMat);
  archPostL.position.set(-32, 2.75, -5.0);
  marketGroup.add(archPostL);

  const archPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5.5, 8), woodMat);
  archPostR.position.set(-32, 2.75, 5.0);
  marketGroup.add(archPostR);

  // Decorative Pathein umbrella on top of the arch
  const topUmbrella = createDisplayUmbrella(umbrellaMats[1], bambooMat, 1.8);
  topUmbrella.position.set(-32, 6.8, 0);
  topUmbrella.rotation.z = Math.PI / 8;
  marketGroup.add(topUmbrella);

  // Gentle swaying animation in the breeze
  const updateUmbrellas = (time: number) => {
    hangingUmbrellas.forEach((umb, idx) => {
      umb.rotation.z = Math.sin(time * 1.5 + idx * 0.4) * 0.08;
      umb.rotation.x = Math.PI + Math.cos(time * 1.2 + idx * 0.5) * 0.06;
    });
  };

  return { group: marketGroup, updateUmbrellas };
}

/**
 * Creates an artisan umbrella market shop stall
 */
function createUmbrellaStall(
  x: number,
  z: number,
  umbrellaMats: THREE.MeshStandardMaterial[],
  woodMat: THREE.Material,
  roofMat: THREE.Material,
  bambooMat: THREE.Material,
  facingNorth: boolean = false
): THREE.Group {
  const stall = new THREE.Group();
  stall.position.set(x, 0.4, z);
  if (facingNorth) {
    stall.rotation.y = Math.PI;
  }

  // Wooden counter stall structure
  const counter = new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.0, 2.2), woodMat);
  counter.position.set(0, 0.5, 1.8);
  stall.add(counter);

  // Posts
  const postCoords = [
    { x: -4.3, z: -2.0 },
    { x: 4.3, z: -2.0 },
    { x: -4.3, z: 2.5 },
    { x: 4.3, z: 2.5 },
  ];
  postCoords.forEach(c => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.6, 6), woodMat);
    post.position.set(c.x, 1.8, c.z);
    stall.add(post);
  });

  // Awning / Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.15, 5.2), roofMat);
  roof.position.set(0, 3.6, 0.2);
  roof.rotation.x = -0.15;
  stall.add(roof);

  // Stepped umbrella display shelves
  for (let s = 0; s < 3; s++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 0.6), woodMat);
    shelf.position.set(0, 1.2 + s * 0.4, -0.5 - s * 0.4);
    stall.add(shelf);

    // 4 displayed open umbrellas on each shelf
    for (let u = 0; u < 4; u++) {
      const mat = umbrellaMats[(u + s) % umbrellaMats.length];
      const umb = createDisplayUmbrella(mat, bambooMat, 0.9);
      umb.position.set(-3.0 + u * 2.0, 1.5 + s * 0.4, -0.5 - s * 0.4);
      umb.rotation.x = -0.4;
      stall.add(umb);
    }
  }

  return stall;
}

/**
 * Creates a traditional Pathein umbrella display model
 */
export function createDisplayUmbrella(
  canopyMat: THREE.Material,
  bambooMat: THREE.Material,
  radius: number = 1.0
): THREE.Group {
  const grp = new THREE.Group();

  // Canopy
  const geo = new THREE.ConeGeometry(radius, radius * 0.4, 20, 1, true);
  const mesh = new THREE.Mesh(geo, canopyMat);
  mesh.castShadow = true;
  grp.add(mesh);

  // Central wooden bamboo shaft (လက်ကိုင်ရိုး)
  const shaftGeo = new THREE.CylinderGeometry(radius * 0.03, radius * 0.03, radius * 1.6, 6);
  const shaft = new THREE.Mesh(shaftGeo, bambooMat);
  shaft.position.y = -radius * 0.5;
  grp.add(shaft);

  // Top finial tip (ထီးထွတ်)
  const tipGeo = new THREE.ConeGeometry(radius * 0.08, radius * 0.25, 6);
  const tip = new THREE.Mesh(tipGeo, bambooMat);
  tip.position.y = radius * 0.3;
  grp.add(tip);

  return grp;
}

/**
 * Creates demonstration table for bamboo umbrella frame making
 */
function createCraftingStation(
  woodMat: THREE.Material,
  bambooMat: THREE.Material,
  canopyMat: THREE.Material
): THREE.Group {
  const grp = new THREE.Group();

  // Low bamboo work table
  const table = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 2.0), woodMat);
  table.position.y = 0.3;
  grp.add(table);

  // Unfinished bamboo ribs skeleton
  const skeleton = new THREE.Group();
  for (let r = 0; r < 16; r++) {
    const angle = (r * Math.PI * 2) / 16;
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.2, 4), bambooMat);
    rib.rotation.z = Math.PI / 3;
    rib.rotation.y = angle;
    rib.position.set(Math.cos(angle) * 0.4, 0.2, Math.sin(angle) * 0.4);
    skeleton.add(rib);
  }
  skeleton.position.set(-0.8, 0.7, 0);
  grp.add(skeleton);

  // Finished umbrella resting on table
  const finUmb = createDisplayUmbrella(canopyMat, bambooMat, 0.7);
  finUmb.position.set(0.9, 0.8, 0);
  finUmb.rotation.z = Math.PI / 4;
  grp.add(finUmb);

  return grp;
}
