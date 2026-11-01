import * as THREE from 'three';
import { createLongyiTexture, createPatheinUmbrellaTexture } from '../textures/proceduralTextures';
import { CharacterAction, CharacterAppearance, CharacterGender, ColliderBox, SurfaceMaterialType } from '../types';
import { sound } from '../audio/soundSystem';

/**
 * 3D Procedural Myanmar Avatar inspired by Myanmar culture and the Tea Shop virtual game.
 * Features realistic jump physics, sprinting kinematics, click-to-move pathing,
 * sit/stand mechanics on tea stools, customizable gender/outfits, thanaka, umbrella, and water gun toy.
 */
export class CharacterController {
  public group: THREE.Group;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public rotation: number = 0; // Y axis rotation angle
  public currentAction: CharacterAction = 'idle';
  public isGrounded: boolean = true;
  public isHoldingUmbrella: boolean = false;
  public isHoldingWaterGun: boolean = false;
  public isSitting: boolean = false;

  // Context-aware surface resolver callback
  public surfaceResolver?: (x: number, z: number) => SurfaceMaterialType;
  public currentSurface: SurfaceMaterialType = 'concrete';

  // Click-to-move navigation target
  public targetDestination: THREE.Vector3 | null = null;

  // Avatar body parts for procedural animation
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private longyi: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private umbrellaProp: THREE.Group;
  private waterGunProp: THREE.Group;
  private teaCupProp: THREE.Group;
  private maleHair: THREE.Group;
  private femaleHair: THREE.Group;
  private cheekPatchL: THREE.Mesh;
  private cheekPatchR: THREE.Mesh;

  // Materials for live styling & customization
  private skinMat: THREE.MeshStandardMaterial;
  private shirtMat: THREE.MeshStandardMaterial;
  private longyiMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;

  // Kinematic parameters
  private walkSpeed: number = 7.0;
  private runSpeed: number = 14.5;
  private jumpForce: number = 12.0;
  private gravity: number = 29.0;

  // Animation cycle accumulator
  private animTime: number = 0;
  private footstepTimer: number = 0;
  private landingSquash: number = 1.0;

  // Current appearance state
  public appearance: CharacterAppearance = {
    gender: 'male',
    shirtColor: '#f8fafc',
    longyiColor: '#1e3a8a',
    longyiPattern: 'traditional',
    hairColor: '#111827',
    hasThanaka: true,
    hasUmbrella: false,
    hasWaterGun: false,
    accountCode: 'PTS-7749-AYEYAR',
    playerName: 'ပုသိမ်သား (Pathein Traveler)',
  };

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PlayerCharacter';
    this.position = this.group.position;
    this.velocity = new THREE.Vector3();

    // 1. Base Materials
    this.skinMat = new THREE.MeshStandardMaterial({
      color: 0xdfab7b, // Warm golden-tan complexion
      roughness: 0.65,
    });

    this.hairMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8,
    });

    this.shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp white traditional Taikpon / shirt
      roughness: 0.5,
    });

    const longyiTex = createLongyiTexture(this.appearance.longyiColor);
    this.longyiMat = new THREE.MeshStandardMaterial({
      map: longyiTex,
      roughness: 0.7,
    });

    const thanakaMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Thanaka sandalwood cheek paste
      roughness: 0.85,
    });

    // 2. Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    this.torso = new THREE.Mesh(torsoGeo, this.shirtMat);
    this.torso.position.y = 1.65;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Traditional Myanmar sash / shawl over shoulder
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 0.2, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
    );
    sash.position.y = 0.2;
    this.torso.add(sash);

    // 3. Head & Cheek Thanaka
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    this.head = new THREE.Mesh(headGeo, this.skinMat);
    this.head.position.y = 2.4;
    this.head.castShadow = true;
    this.group.add(this.head);

    this.cheekPatchL = new THREE.Mesh(new THREE.CircleGeometry(0.065, 8), thanakaMat);
    this.cheekPatchL.position.set(-0.16, -0.04, 0.25);
    this.head.add(this.cheekPatchL);

    this.cheekPatchR = new THREE.Mesh(new THREE.CircleGeometry(0.065, 8), thanakaMat);
    this.cheekPatchR.position.set(0.16, -0.04, 0.25);
    this.head.add(this.cheekPatchR);

    // Male Hair & Gaung Baung
    this.maleHair = new THREE.Group();
    const hairGeo = new THREE.CylinderGeometry(0.29, 0.3, 0.16, 12);
    const hair = new THREE.Mesh(hairGeo, this.hairMat);
    hair.position.y = 0.16;
    this.maleHair.add(hair);

    const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), this.hairMat);
    hairBun.position.set(0, 0.24, -0.15);
    this.maleHair.add(hairBun);

    // Traditional Gaung Baung corner wing (ခေါင်းပေါင်း အစ)
    const gaungBaungWing = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.22, 6),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
    );
    gaungBaungWing.position.set(0.28, 0.26, 0.05);
    gaungBaungWing.rotation.z = -Math.PI / 3.8;
    this.maleHair.add(gaungBaungWing);
    this.head.add(this.maleHair);

    // Female Hair with Jasmine/Frangipani Flower Garland (ပန်းကုံး)
    this.femaleHair = new THREE.Group();
    const fHairGeo = new THREE.SphereGeometry(0.31, 14, 14);
    const fHair = new THREE.Mesh(fHairGeo, this.hairMat);
    fHair.position.set(0, 0.08, -0.08);
    this.femaleHair.add(fHair);

    const sideBun = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), this.hairMat);
    sideBun.position.set(0.24, 0.12, -0.15);
    this.femaleHair.add(sideBun);

    const jasmineFlower = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    jasmineFlower.position.set(0.26, 0.22, -0.05);
    this.femaleHair.add(jasmineFlower);
    this.femaleHair.visible = false;
    this.head.add(this.femaleHair);

    // 4. Myanmar Longyi / Htamein (လုံချည် / ထဘီ)
    const longyiGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.95, 16);
    this.longyi = new THREE.Mesh(longyiGeo, this.longyiMat);
    this.longyi.position.y = 0.95;
    this.longyi.castShadow = true;
    this.group.add(this.longyi);

    // Waist knot (ခါးတောင်းကျိုက် အထုံး)
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), this.longyiMat);
    knot.position.set(0, 0.4, 0.4);
    this.longyi.add(knot);

    // 5. Arms
    this.leftArm = this.createLimb(this.skinMat, this.shirtMat);
    this.leftArm.position.set(-0.48, 1.95, 0);
    this.group.add(this.leftArm);

    this.rightArm = this.createLimb(this.skinMat, this.shirtMat);
    this.rightArm.position.set(0.48, 1.95, 0);
    this.group.add(this.rightArm);

    // 6. Legs & Velvet Slippers
    const slipperMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
    this.leftLeg = this.createLeg(this.skinMat, slipperMat);
    this.leftLeg.position.set(-0.2, 0.55, 0);
    this.group.add(this.leftLeg);

    this.rightLeg = this.createLeg(this.skinMat, slipperMat);
    this.rightLeg.position.set(0.2, 0.55, 0);
    this.group.add(this.rightLeg);

    // 7. Handheld Props
    // Umbrella Prop
    this.umbrellaProp = this.createHandheldUmbrella();
    this.umbrellaProp.position.set(0, -0.65, 0.35);
    this.umbrellaProp.rotation.x = Math.PI / 6;
    this.umbrellaProp.visible = false;
    this.rightArm.add(this.umbrellaProp);

    // Water Gun Prop (သကြန် ရေပြွတ်သေနတ်)
    this.waterGunProp = this.createWaterGunProp();
    this.waterGunProp.position.set(0, -0.62, 0.3);
    this.waterGunProp.rotation.x = Math.PI / 2;
    this.waterGunProp.visible = false;
    this.leftArm.add(this.waterGunProp);

    // Tea Cup Prop (လက်ဖက်ရည်ခွက်)
    this.teaCupProp = this.createTeaCupProp();
    this.teaCupProp.position.set(0, -0.62, 0.25);
    this.teaCupProp.visible = false;
    this.rightArm.add(this.teaCupProp);

    // Initial position on Shwemokhtaw avenue
    this.position.set(0, 0, 18);
  }

  private createLimb(skinMat: THREE.Material, clothMat: THREE.Material): THREE.Group {
    const limb = new THREE.Group();
    // Sleeve
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.45, 8), clothMat);
    sleeve.position.y = -0.22;
    limb.add(sleeve);

    // Forearm / hand
    const hand = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8), skinMat);
    hand.position.y = -0.62;
    limb.add(hand);

    return limb;
  }

  private createLeg(skinMat: THREE.Material, slipperMat: THREE.Material): THREE.Group {
    const leg = new THREE.Group();
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8), skinMat);
    shin.position.y = -0.25;
    leg.add(shin);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.35), slipperMat);
    foot.position.set(0, -0.5, 0.08);
    leg.add(foot);

    return leg;
  }

  private createHandheldUmbrella(): THREE.Group {
    const umb = new THREE.Group();
    const tex = createPatheinUmbrellaTexture('ruby');
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.45,
      side: THREE.DoubleSide,
    });

    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.35, 18, 1, true), mat);
    canopy.position.y = 0.8;
    umb.add(canopy);

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xd97706 })
    );
    shaft.position.y = 0.2;
    umb.add(shaft);

    return umb;
  }

  private createWaterGunProp(): THREE.Group {
    const gun = new THREE.Group();
    // Bright neon barrel
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 })
    );
    barrel.rotation.x = Math.PI / 2;
    gun.add(barrel);

    // Water reservoir tank
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 })
    );
    tank.position.set(0, 0.1, -0.05);
    gun.add(tank);

    // Handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.18, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b })
    );
    handle.position.set(0, -0.12, -0.1);
    gun.add(handle);

    return gun;
  }

  private createTeaCupProp(): THREE.Group {
    const cup = new THREE.Group();
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      roughness: 0.1,
      transmission: 0.5,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.14, 8), glassMat);
    cup.add(mesh);

    // Steam wisps
    const steam = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    );
    steam.position.y = 0.12;
    cup.add(steam);

    return cup;
  }

  public setAppearance(custom: Partial<CharacterAppearance>) {
    this.appearance = { ...this.appearance, ...custom };

    if (custom.gender) {
      this.maleHair.visible = custom.gender === 'male';
      this.femaleHair.visible = custom.gender === 'female';
    }

    if (custom.shirtColor) {
      this.shirtMat.color.set(custom.shirtColor);
    }

    if (custom.hairColor) {
      this.hairMat.color.set(custom.hairColor);
    }

    if (custom.longyiColor) {
      const tex = createLongyiTexture(custom.longyiColor);
      this.longyiMat.map = tex;
      this.longyiMat.needsUpdate = true;
    }

    if (custom.hasThanaka !== undefined) {
      this.cheekPatchL.visible = custom.hasThanaka;
      this.cheekPatchR.visible = custom.hasThanaka;
    }

    if (custom.hasUmbrella !== undefined) {
      this.toggleUmbrella(custom.hasUmbrella);
    }

    if (custom.hasWaterGun !== undefined) {
      this.toggleWaterGun(custom.hasWaterGun);
    }
  }

  public toggleUmbrella(force?: boolean) {
    this.isHoldingUmbrella = force !== undefined ? force : !this.isHoldingUmbrella;
    this.umbrellaProp.visible = this.isHoldingUmbrella;
    if (this.isHoldingUmbrella) {
      sound.playInteraction();
    }
  }

  public toggleWaterGun(force?: boolean) {
    this.isHoldingWaterGun = force !== undefined ? force : !this.isHoldingWaterGun;
    this.waterGunProp.visible = this.isHoldingWaterGun;
    if (this.isHoldingWaterGun) {
      sound.playInteraction();
    }
  }

  public toggleSit() {
    if (this.isSitting) {
      this.isSitting = false;
      this.currentAction = 'idle';
      this.teaCupProp.visible = false;
      this.position.y = 0;
    } else {
      this.isSitting = true;
      this.currentAction = 'sit';
      this.teaCupProp.visible = true;
      this.position.y = -0.22;
      sound.playInteraction();
    }
  }

  public setAction(action: CharacterAction) {
    if (this.currentAction === action) return;
    this.currentAction = action;

    if (action === 'sit') {
      this.isSitting = true;
      this.teaCupProp.visible = true;
      this.position.y = -0.22;
    } else {
      this.isSitting = false;
      this.teaCupProp.visible = false;
    }

    if (action === 'jump') {
      sound.playJump();
    } else if (action === 'tea_cheers') {
      this.teaCupProp.visible = true;
      sound.playInteraction();
      setTimeout(() => {
        if (!this.isSitting) this.teaCupProp.visible = false;
      }, 3000);
    } else if (action === 'water_gun') {
      this.waterGunProp.visible = true;
      sound.playRiverWater();
    } else if (action === 'bow' || action === 'pray' || action === 'wave' || action === 'clap') {
      sound.playInteraction();
    }
  }

  /**
   * Main Character Kinematics Update Loop
   * Computes keyboard/joystick input + click-to-move pathing + jump impulse + gravity + colliders
   */
  public update(
    dt: number,
    inputMove: { x: number; z: number },
    isSprinting: boolean,
    isJumping: boolean,
    cameraAngle: number,
    colliders: ColliderBox[]
  ) {
    // If sitting and player inputs movement, automatically stand up!
    let moveX = 0;
    let moveZ = 0;
    let hasMoveInput = false;

    // Check Click-to-Move Target
    if (this.targetDestination) {
      const dx = this.targetDestination.x - this.position.x;
      const dz = this.targetDestination.z - this.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.4) {
        hasMoveInput = true;
        const moveAngle = Math.atan2(dx, dz);
        this.rotation = moveAngle;
        let angleDiff = moveAngle - this.group.rotation.y;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.group.rotation.y += angleDiff * Math.min(1, 14 * dt);

        const speed = isSprinting ? this.runSpeed : this.walkSpeed;
        moveX = Math.sin(moveAngle) * speed;
        moveZ = Math.cos(moveAngle) * speed;

        if (this.isSitting) {
          this.toggleSit();
        }
      } else {
        // Target reached!
        this.targetDestination = null;
      }
    }

    // Direct WASD / Joystick input overrides click-to-move
    const hasManualInput = Math.abs(inputMove.x) > 0.05 || Math.abs(inputMove.z) > 0.05;
    if (hasManualInput) {
      this.targetDestination = null; // Clear click-to-move
      hasMoveInput = true;

      if (this.isSitting) {
        this.toggleSit();
      }

      const speed = isSprinting ? this.runSpeed : this.walkSpeed;
      const moveAngle = Math.atan2(inputMove.x, inputMove.z);
      const totalAngle = moveAngle + cameraAngle;

      this.rotation = totalAngle;
      let angleDiff = totalAngle - this.group.rotation.y;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      this.group.rotation.y += angleDiff * Math.min(1, 14 * dt);

      moveX = Math.sin(totalAngle) * speed;
      moveZ = Math.cos(totalAngle) * speed;
    }

    if (hasMoveInput) {
      // Smooth acceleration toward target movement velocity
      const accelFactor = Math.min(1, 14 * dt);
      this.velocity.x += (moveX - this.velocity.x) * accelFactor;
      this.velocity.z += (moveZ - this.velocity.z) * accelFactor;

      if (this.isGrounded && this.currentAction !== 'jump') {
        this.currentAction = isSprinting ? 'run' : 'walk';
      }

      // Footstep audio cadence (comfortable relaxed pacing)
      this.footstepTimer += dt * (isSprinting ? 2.4 : 1.6);
      if (this.footstepTimer > 1.0 && this.isGrounded) {
        const surface = this.surfaceResolver
          ? this.surfaceResolver(this.position.x, this.position.z)
          : this.currentSurface;
        this.currentSurface = surface;
        sound.playFootstep(surface, isSprinting);
        this.footstepTimer = 0;
      }
    } else {
      // Smooth natural deceleration (gentle braking, no sudden jerk)
      const brakeFactor = Math.min(1, 16 * dt);
      this.velocity.x += (0 - this.velocity.x) * brakeFactor;
      this.velocity.z += (0 - this.velocity.z) * brakeFactor;
      if (Math.abs(this.velocity.x) < 0.04) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.04) this.velocity.z = 0;

      if (this.isGrounded && this.currentAction !== 'jump' && !this.isSitting) {
        const isEmote = ['pray', 'bow', 'umbrella_dance', 'tea_cheers', 'wave', 'clap', 'laugh', 'water_gun'].includes(this.currentAction);
        if (!isEmote) {
          this.currentAction = 'idle';
        }
      }
    }

    // Realistic Jump Kinematics
    if (isJumping && this.isGrounded) {
      if (this.isSitting) {
        this.toggleSit();
      }
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.currentAction = 'jump';
      sound.playJump();
    }

    // Gravity Acceleration
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * dt;
    }

    // Proposed Position
    const nextX = this.position.x + this.velocity.x * dt;
    const nextY = this.position.y + this.velocity.y * dt;
    const nextZ = this.position.z + this.velocity.z * dt;

    // World Boundary and Obstacle Collisions
    let canMoveX = true;
    let canMoveZ = true;
    const playerRadius = 0.55;

    // Boundaries of Pathein City Map
    if (nextX < -118 || nextX > 118) canMoveX = false;
    if (nextZ < -75 || nextZ > 72) canMoveZ = false;

    for (const c of colliders) {
      if (
        nextX + playerRadius > c.minX &&
        nextX - playerRadius < c.maxX &&
        this.position.z + playerRadius > c.minZ &&
        this.position.z - playerRadius < c.maxZ
      ) {
        canMoveX = false;
      }
      if (
        this.position.x + playerRadius > c.minX &&
        this.position.x - playerRadius < c.maxX &&
        nextZ + playerRadius > c.minZ &&
        nextZ - playerRadius < c.maxZ
      ) {
        canMoveZ = false;
      }
    }

    if (canMoveX) this.position.x = nextX;
    if (canMoveZ) this.position.z = nextZ;

    // Ground check & landing response
    const groundLevel = this.isSitting ? -0.22 : 0;
    if (nextY <= groundLevel) {
      if (!this.isGrounded && this.velocity.y < -3.0) {
        // Just landed! Trigger landing squash
        this.landingSquash = 0.88;
        sound.playFootstep();
      }
      this.position.y = groundLevel;
      this.velocity.y = 0;
      this.isGrounded = true;

      if (this.currentAction === 'jump') {
        this.currentAction = hasMoveInput ? (isSprinting ? 'run' : 'walk') : (this.isSitting ? 'sit' : 'idle');
      }
    } else {
      this.position.y = nextY;
      this.isGrounded = false;
    }

    // Smooth landing squash recovery
    if (this.landingSquash < 1.0) {
      this.landingSquash = THREE.MathUtils.lerp(this.landingSquash, 1.0, dt * 14);
    }

    // Procedural Animation Solver
    this.animateAvatar(dt, isSprinting);
  }

  private animateAvatar(dt: number, isSprinting: boolean) {
    this.animTime += dt;

    // Apply landing squash
    this.group.scale.set(
      2.0 - this.landingSquash,
      this.landingSquash,
      2.0 - this.landingSquash
    );

    if (this.currentAction === 'jump' || !this.isGrounded) {
      // Jump Pose: Legs flexed, arms raised for balance
      this.leftLeg.rotation.x = 0.55;
      this.rightLeg.rotation.x = 0.45;
      this.leftArm.rotation.x = -1.35;
      this.rightArm.rotation.x = this.isHoldingUmbrella ? -0.9 : -1.35;
      this.torso.rotation.x = 0.1;
      return;
    }

    if (this.currentAction === 'sit') {
      // Authentic Myanmar tea stool sitting pose
      this.leftLeg.rotation.x = Math.PI / 2.1;
      this.rightLeg.rotation.x = Math.PI / 2.1;
      this.leftArm.rotation.x = -0.3;
      this.rightArm.rotation.x = -0.6;
      this.torso.position.y = 1.4;
      this.head.position.y = 2.15;
      this.torso.rotation.x = 0;
      return;
    }

    if (this.currentAction === 'walk' || this.currentAction === 'run') {
      const isRun = this.currentAction === 'run';
      const freq = isRun ? 15.0 : 9.5;
      const legAmplitude = isRun ? 0.85 : 0.48;
      const legSwing = Math.sin(this.animTime * freq) * legAmplitude;

      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      // Arm counter-swing
      if (!this.isHoldingUmbrella && !this.isHoldingWaterGun) {
        this.leftArm.rotation.x = -legSwing * 1.1;
        this.rightArm.rotation.x = legSwing * 1.1;
      } else {
        this.leftArm.rotation.x = this.isHoldingWaterGun ? -0.8 : -legSwing * 0.8;
        this.rightArm.rotation.x = this.isHoldingUmbrella ? -0.6 : legSwing * 0.8;
      }

      // Torso forward lean when running
      this.torso.rotation.x = isRun ? 0.22 : 0.08;
      this.head.rotation.x = isRun ? -0.1 : 0;

      // Bobbing
      const bob = Math.abs(Math.sin(this.animTime * freq)) * (isRun ? 0.12 : 0.06);
      this.torso.position.y = 1.65 + bob;
      this.head.position.y = 2.4 + bob;
      return;
    }

    // Emotes & Social Actions
    if (this.currentAction === 'pray') {
      // Reverent Buddhist homage pose (လက်အုပ်ချီ ရှိခိုး)
      this.leftArm.rotation.set(-1.15, 0.4, -0.4);
      this.rightArm.rotation.set(-1.15, -0.4, 0.4);
      this.head.rotation.x = 0.3;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.torso.rotation.x = 0.1;
    } else if (this.currentAction === 'bow') {
      // Mingalaba greeting bow
      const bow = 0.35 + Math.sin(this.animTime * 3) * 0.12;
      this.torso.rotation.x = bow;
      this.head.rotation.x = bow * 1.2;
      this.leftArm.rotation.x = -0.5;
      this.rightArm.rotation.x = -0.5;
    } else if (this.currentAction === 'umbrella_dance') {
      // Pathein umbrella spinning dance
      this.rightArm.rotation.x = -1.1;
      this.umbrellaProp.rotation.y = this.animTime * 3.5;
      this.torso.rotation.y = Math.sin(this.animTime * 4) * 0.25;
    } else if (this.currentAction === 'tea_cheers') {
      // Toast tea cup
      this.rightArm.rotation.x = -1.2 + Math.sin(this.animTime * 4) * 0.15;
      this.head.rotation.x = -0.1;
      this.torso.rotation.y = 0.1;
    } else if (this.currentAction === 'wave') {
      // Friendly wave
      this.rightArm.rotation.x = -1.6;
      this.rightArm.rotation.z = Math.sin(this.animTime * 8) * 0.3;
    } else if (this.currentAction === 'clap') {
      // Clapping hands
      this.leftArm.rotation.set(-0.9, 0.5 + Math.sin(this.animTime * 10) * 0.2, 0);
      this.rightArm.rotation.set(-0.9, -0.5 - Math.sin(this.animTime * 10) * 0.2, 0);
    } else if (this.currentAction === 'laugh') {
      // Laughing
      this.head.rotation.x = -0.2 + Math.sin(this.animTime * 12) * 0.12;
      this.torso.position.y = 1.65 + Math.sin(this.animTime * 12) * 0.04;
    } else if (this.currentAction === 'water_gun') {
      // Shooting water gun
      this.leftArm.rotation.x = -1.3;
      this.rightArm.rotation.x = -0.8;
    } else {
      // Idle Breathing
      const breath = Math.sin(this.animTime * 2.5) * 0.02;
      this.torso.position.y = 1.65 + breath;
      this.head.position.y = 2.4 + breath * 1.2;

      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.torso.rotation.x = 0;
      this.torso.rotation.y = 0;
      this.head.rotation.x = 0;

      if (!this.isHoldingUmbrella && !this.isHoldingWaterGun) {
        this.leftArm.rotation.x = Math.sin(this.animTime * 2.5) * 0.05;
        this.rightArm.rotation.x = -Math.sin(this.animTime * 2.5) * 0.05;
      } else {
        if (this.isHoldingWaterGun) this.leftArm.rotation.x = -0.5;
        if (this.isHoldingUmbrella) this.rightArm.rotation.x = -0.6;
      }
    }
  }

  public teleport(x: number, z: number) {
    this.targetDestination = null;
    this.position.set(x, 0, z);
    this.velocity.set(0, 0, 0);
    this.currentAction = 'idle';
  }
}
