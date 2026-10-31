import * as THREE from 'three';
import { createPagodaGoldTexture, createStonePavingTexture, createBurmeseSignboardTexture } from '../textures/proceduralTextures';
import { ColliderBox } from '../types';

/**
 * Procedural 3D model of Shwemokhtaw Pagoda (ရွှေမုဋ္ဌောဘုရား)
 * Built with traditional multi-tiered base, bell dome, hti finial, chinthe guardians, and bell pavilion.
 */
export function buildShwemokhtawPagoda(colliders: ColliderBox[]): THREE.Group {
  const pagodaGroup = new THREE.Group();
  pagodaGroup.name = 'ShwemokhtawPagoda';

  const goldTexture = createPagodaGoldTexture();
  const marbleTexture = createStonePavingTexture(true);
  marbleTexture.repeat.set(12, 12);

  // Materials
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    map: goldTexture,
    metalness: 0.85,
    roughness: 0.22,
  });

  const basePlinthMaterial = new THREE.MeshStandardMaterial({
    color: 0xfaebd7,
    roughness: 0.7,
    metalness: 0.1,
  });

  const redRoofMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b1c1c, // Traditional Myanmar lacquer red / teak red
    roughness: 0.5,
    metalness: 0.15,
  });

  const teakWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c2c16,
    roughness: 0.8,
    metalness: 0.05,
  });

  const whiteMarbleMaterial = new THREE.MeshStandardMaterial({
    map: marbleTexture,
    roughness: 0.35,
    metalness: 0.1,
  });

  // 1. Broad Square / Octagonal Terrace Platform (ကျောင်းတော်ရင်ပြင်)
  const platformGeo = new THREE.BoxGeometry(64, 0.8, 64);
  const platformMesh = new THREE.Mesh(platformGeo, whiteMarbleMaterial);
  platformMesh.position.y = 0.4;
  platformMesh.receiveShadow = true;
  pagodaGroup.add(platformMesh);

  // Pagoda outer platform collider
  colliders.push({
    minX: -32, maxX: 32,
    minZ: -32, maxZ: -31,
  });

  // 2. Multi-tier Octagonal Pedestal (ပစ္စယာ သုံးဆင့်)
  const tierHeights = [1.2, 1.0, 0.9];
  const tierRadii = [18, 14, 11];
  let curY = 0.8;

  tierRadii.forEach((r, idx) => {
    const h = tierHeights[idx];
    const tierGeo = new THREE.CylinderGeometry(r - 0.8, r, h, 8);
    const tierMesh = new THREE.Mesh(tierGeo, basePlinthMaterial);
    tierMesh.position.y = curY + h / 2;
    tierMesh.castShadow = true;
    tierMesh.receiveShadow = true;
    pagodaGroup.add(tierMesh);

    // Gold molding rim
    const rimGeo = new THREE.TorusGeometry(r - 0.4, 0.25, 6, 8);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, goldMaterial);
    rimMesh.position.y = curY + h;
    pagodaGroup.add(rimMesh);

    curY += h;
  });

  // 4 Corner Small Stupas (အရံစေတီများ)
  const cornerOffsets = [
    { x: 13, z: 13 },
    { x: -13, z: 13 },
    { x: 13, z: -13 },
    { x: -13, z: -13 },
  ];
  cornerOffsets.forEach(pos => {
    const smallStupa = createSmallStupa(goldMaterial, basePlinthMaterial);
    smallStupa.position.set(pos.x, 1.8, pos.z);
    pagodaGroup.add(smallStupa);
  });

  // Central pagoda collider
  colliders.push({
    minX: -11, maxX: 11,
    minZ: -11, maxZ: 11,
  });

  // 3. Bell-shaped Dome (ခေါင်းလောင်းပုံ)
  const bellRadius = 9.2;
  const bellHeight = 8.5;
  const bellGeo = new THREE.CylinderGeometry(5.2, bellRadius, bellHeight, 32);
  const bellMesh = new THREE.Mesh(bellGeo, goldMaterial);
  bellMesh.position.y = curY + bellHeight / 2;
  bellMesh.castShadow = true;
  pagodaGroup.add(bellMesh);
  curY += bellHeight;

  // 4. Inverted bowl & Turban rings (သပိတ်မှောက်၊ ဖောင်းရစ်)
  const ringsGeo = new THREE.CylinderGeometry(2.8, 5.0, 4.5, 24);
  const ringsMesh = new THREE.Mesh(ringsGeo, goldMaterial);
  ringsMesh.position.y = curY + 2.25;
  ringsMesh.castShadow = true;
  pagodaGroup.add(ringsMesh);
  curY += 4.5;

  // 5. Lotus petals & Conical Spire (ကြာမှောက် ကြာလန် နှင့် ငှက်ပျောဖူး)
  const spireGeo = new THREE.ConeGeometry(2.6, 6.0, 24);
  const spireMesh = new THREE.Mesh(spireGeo, goldMaterial);
  spireMesh.position.y = curY + 3.0;
  spireMesh.castShadow = true;
  pagodaGroup.add(spireMesh);
  curY += 6.0;

  // 6. Traditional Golden Hti (ထီးတော် - Umbrella finial)
  const htiGroup = new THREE.Group();
  htiGroup.position.y = curY;

  // 5-tier filigree golden umbrella discs
  for (let i = 0; i < 5; i++) {
    const discRadius = 2.4 - i * 0.38;
    const discGeo = new THREE.CylinderGeometry(discRadius * 0.9, discRadius, 0.25, 20);
    const discMesh = new THREE.Mesh(discGeo, goldMaterial);
    discMesh.position.y = i * 0.7;
    discMesh.castShadow = true;
    htiGroup.add(discMesh);

    // Hanging pendant bells (ဆည်းလည်း)
    for (let b = 0; b < 6; b++) {
      const bAngle = (b * Math.PI * 2) / 6;
      const bGeo = new THREE.ConeGeometry(0.08, 0.35, 6);
      const bMesh = new THREE.Mesh(bGeo, goldMaterial);
      bMesh.position.set(
        Math.cos(bAngle) * (discRadius - 0.1),
        i * 0.7 - 0.2,
        Math.sin(bAngle) * (discRadius - 0.1)
      );
      htiGroup.add(bMesh);
    }
  }

  // Diamond Orb & Vane at zenith (စိန်ဖူးတော်နှင့် ငှက်မြတ်နား)
  const orbGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffd700,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.1,
  });
  const orbMesh = new THREE.Mesh(orbGeo, orbMat);
  orbMesh.position.y = 4.2;
  htiGroup.add(orbMesh);

  // Vane flag
  const vaneGeo = new THREE.BoxGeometry(0.1, 0.8, 1.2);
  const vaneMesh = new THREE.Mesh(vaneGeo, goldMaterial);
  vaneMesh.position.set(0, 4.0, 0.6);
  htiGroup.add(vaneMesh);

  pagodaGroup.add(htiGroup);

  // 7. Four Cardinal Tazaung Prayer Halls (တန်ဆောင်းများ) with Tiered Pyatthat Roofs
  const directions = [
    { x: 0, z: 23, rot: 0 },
    { x: 0, z: -23, rot: Math.PI },
    { x: 23, z: 0, rot: -Math.PI / 2 },
    { x: -23, z: 0, rot: Math.PI / 2 },
  ];

  directions.forEach(dir => {
    const hall = createTazaungHall(redRoofMaterial, goldMaterial, teakWoodMaterial);
    hall.position.set(dir.x, 0.8, dir.z);
    hall.rotation.y = dir.rot;
    pagodaGroup.add(hall);

    // Colliders for halls
    colliders.push({
      minX: dir.x - 3.5, maxX: dir.x + 3.5,
      minZ: dir.z - 3.5, maxZ: dir.z + 3.5,
    });
  });

  // 8. Chinthe Guardian Lions (ခြင်္သေ့ကြီးများ) at South Entrance
  const chintheL = createChintheGuardian(goldMaterial);
  chintheL.position.set(-4.5, 0.8, 29);
  pagodaGroup.add(chintheL);

  const chintheR = createChintheGuardian(goldMaterial);
  chintheR.position.set(4.5, 0.8, 29);
  pagodaGroup.add(chintheR);

  // 9. Pagoda Bell Pavilion (ခေါင်းလောင်းတော်တိုက်) on East courtyard
  const bellPavilion = createBellPavilion(redRoofMaterial, teakWoodMaterial);
  bellPavilion.position.set(20, 0.8, 12);
  pagodaGroup.add(bellPavilion);

  // Bell pavilion collider
  colliders.push({
    minX: 18, maxX: 22,
    minZ: 10, maxZ: 14,
  });

  // 10. Grand Archway Burmese Signboard (မုခ်ဦး ဆိုင်းဘုတ်)
  const signTexture = createBurmeseSignboardTexture(
    'ရွှေမုဋ္ဌော စေတီတော်မြတ်ကြီး',
    'Shwemokhtaw Pagoda - Pathein',
    '#7f1d1d',
    '#fef08a',
    '#fbbf24'
  );
  const signGeo = new THREE.BoxGeometry(10, 2.2, 0.3);
  const signMat = new THREE.MeshStandardMaterial({
    map: signTexture,
    roughness: 0.4,
  });
  const archSign = new THREE.Mesh(signGeo, signMat);
  archSign.position.set(0, 6.2, 30.5);
  pagodaGroup.add(archSign);

  // Archway pillars
  const pillarGeo = new THREE.BoxGeometry(1.2, 6.5, 1.2);
  const pillarL = new THREE.Mesh(pillarGeo, basePlinthMaterial);
  pillarL.position.set(-5.2, 3.25, 30.5);
  pillarL.castShadow = true;
  pagodaGroup.add(pillarL);

  const pillarR = new THREE.Mesh(pillarGeo, basePlinthMaterial);
  pillarR.position.set(5.2, 3.25, 30.5);
  pillarR.castShadow = true;
  pagodaGroup.add(pillarR);

  // Arch pyatthat top
  const archRoof = createPyatthatRoof(3, 12, redRoofMaterial, goldMaterial);
  archRoof.position.set(0, 7.3, 30.5);
  pagodaGroup.add(archRoof);

  return pagodaGroup;
}

/**
 * Creates smaller surrounding stupa
 */
function createSmallStupa(goldMat: THREE.Material, plinthMat: THREE.Material): THREE.Group {
  const grp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 0.8, 8), plinthMat);
  base.position.y = 0.4;
  grp.add(base);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.2, 2.0, 16), goldMat);
  body.position.y = 1.8;
  body.castShadow = true;
  grp.add(body);

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 16), goldMat);
  spire.position.y = 3.9;
  spire.castShadow = true;
  grp.add(spire);

  return grp;
}

/**
 * Creates a traditional Myanmar Tazaung prayer pavilion with tiered pyatthat roof
 */
function createTazaungHall(
  roofMat: THREE.Material,
  goldMat: THREE.Material,
  woodMat: THREE.Material
): THREE.Group {
  const hall = new THREE.Group();

  // Teak pillars
  const pillarCoords = [
    { x: -3, z: -3 },
    { x: 3, z: -3 },
    { x: -3, z: 3 },
    { x: 3, z: 3 },
  ];

  pillarCoords.forEach(c => {
    const postGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8);
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(c.x, 2.1, c.z);
    post.castShadow = true;
    hall.add(post);
  });

  // Tiered Pyatthat roof
  const roof = createPyatthatRoof(4, 7.5, roofMat, goldMat);
  roof.position.y = 4.2;
  hall.add(roof);

  // Altar with Buddha statue representation
  const altarGeo = new THREE.BoxGeometry(2.4, 1.2, 1.4);
  const altar = new THREE.Mesh(altarGeo, woodMat);
  altar.position.set(0, 0.6, -1.8);
  hall.add(altar);

  // Golden sitting Buddha silhouette
  const bBody = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 8), goldMat);
  bBody.position.set(0, 1.8, -1.8);
  bBody.castShadow = true;
  hall.add(bBody);

  const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), goldMat);
  bHead.position.set(0, 2.7, -1.8);
  hall.add(bHead);

  // Small lotus flower bowl
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 0.2, 8), goldMat);
  bowl.position.set(0, 1.3, -1.0);
  hall.add(bowl);

  return hall;
}

/**
 * Creates multi-tier Myanmar Pyatthat roof (ပြာသာဒ် အဆင့်ဆင့်)
 */
function createPyatthatRoof(
  tiers: number,
  baseSpan: number,
  roofMat: THREE.Material,
  goldMat: THREE.Material
): THREE.Group {
  const roofGrp = new THREE.Group();
  let currentY = 0;
  let span = baseSpan;

  for (let i = 0; i < tiers; i++) {
    const tierH = 0.6;
    const roofGeo = new THREE.ConeGeometry(span / 1.3, tierH * 1.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = currentY + tierH;
    roofMesh.castShadow = true;
    roofGrp.add(roofMesh);

    // Gold eaves ridge
    const ridgeGeo = new THREE.BoxGeometry(span, 0.1, span);
    const ridgeMesh = new THREE.Mesh(ridgeGeo, goldMat);
    ridgeMesh.position.y = currentY + 0.1;
    roofGrp.add(ridgeMesh);

    currentY += tierH * 1.1;
    span *= 0.68;
  }

  // Top finial spire
  const spireGeo = new THREE.ConeGeometry(0.3, 1.8, 8);
  const spire = new THREE.Mesh(spireGeo, goldMat);
  spire.position.y = currentY + 0.9;
  roofGrp.add(spire);

  return roofGrp;
}

/**
 * Creates authentic Myanmar Chinthe guardian lion
 */
function createChintheGuardian(goldMat: THREE.Material): THREE.Group {
  const chinthe = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.5,
  });

  // Base plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), whiteMat);
  plinth.position.y = 0.3;
  chinthe.add(plinth);

  // Sitting body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.4), whiteMat);
  body.position.set(0, 1.2, 0);
  chinthe.add(body);

  // Chest & mane (ornate gold trim)
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 1.2, 8), goldMat);
  chest.position.set(0, 1.5, 0.4);
  chinthe.add(chest);

  // Head with gaping noble jaws
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), whiteMat);
  head.position.set(0, 2.4, 0.3);
  chinthe.add(head);

  // Golden crest
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), goldMat);
  crest.position.set(0, 3.1, 0.3);
  chinthe.add(crest);

  return chinthe;
}

/**
 * Creates Pagoda Bell Pavilion (ခေါင်းလောင်းတိုက်)
 */
function createBellPavilion(roofMat: THREE.Material, woodMat: THREE.Material): THREE.Group {
  const grp = new THREE.Group();

  // 4 corner posts
  const posts = [
    { x: -1.8, z: -1.8 },
    { x: 1.8, z: -1.8 },
    { x: -1.8, z: 1.8 },
    { x: 1.8, z: 1.8 },
  ];
  posts.forEach(p => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.6, 8), woodMat);
    post.position.set(p.x, 1.8, p.z);
    grp.add(post);
  });

  // Beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 0.3), woodMat);
  beam.position.set(0, 3.4, 0);
  grp.add(beam);

  // Traditional Bronze Bell
  const bellMat = new THREE.MeshStandardMaterial({
    color: 0xcd7f32,
    metalness: 0.85,
    roughness: 0.25,
  });
  const bellGeo = new THREE.CylinderGeometry(0.4, 0.8, 1.2, 16);
  const bell = new THREE.Mesh(bellGeo, bellMat);
  bell.position.set(0, 2.2, 0);
  bell.castShadow = true;
  grp.add(bell);

  // Wooden striking beam / mallet
  const mallet = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), woodMat);
  mallet.rotation.z = Math.PI / 3;
  mallet.position.set(0.6, 2.0, 0.4);
  grp.add(mallet);

  // Roof
  const roof = createPyatthatRoof(2, 4.2, roofMat, bellMat);
  roof.position.y = 3.6;
  grp.add(roof);

  return grp;
}
