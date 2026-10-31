import * as THREE from 'three';
import { createLongyiTexture, createPatheinUmbrellaTexture } from '../textures/proceduralTextures';
import { CharacterAction, ColliderBox } from '../types';
import { sound } from '../audio/soundSystem';

/**
 * 3D Procedural Myanmar Avatar with authentic Longyi attire, Pathein umbrella prop, and smooth kinematics.
 */
export class CharacterController {
  public group: THREE.Group;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public rotation: number = 0; // Y axis rotation angle
  public currentAction: CharacterAction = 'idle';
  public isGrounded: boolean = true;
  public isHoldingUmbrella: boolean = false;

  // Avatar body parts for procedural animation
  private head: THREE.Mesh;
  private torso: THREE.Mesh;
  private longyi: THREE.Mesh;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private umbrellaProp: THREE.Group;

  // Kinematic parameters
  private walkSpeed: number = 7.5;
  private runSpeed: number = 14.0;
  private jumpForce: number = 11.0;
  private gravity: number = 28.0;

  // Animation cycle accumulator
  private animTime: number = 0;
  private footstepTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PlayerCharacter';
    this.position = this.group.position;
    this.velocity = new THREE.Vector3();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdfab7b, // Warm golden-tan complexion
      roughness: 0.65,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.8,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean crisp white traditional Taikpon / shirt
      roughness: 0.5,
    });

    const longyiTex = createLongyiTexture('#1e3a8a');
    const longyiMat = new THREE.MeshStandardMaterial({
      map: longyiTex,
      roughness: 0.7,
    });

    const thanakaMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a, // Thanaka sandalwood cheek paste
      roughness: 0.8,
    });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    this.torso = new THREE.Mesh(torsoGeo, shirtMat);
    this.torso.position.y = 1.65;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Traditional Myanmar sash / shawl over shoulder
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 0.2, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xd97706 })
    );
    sash.position.y = 0.2;
    this.torso.add(sash);

    // 2. Head & Hair
    const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 2.4;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Traditional hair bun / Gaung Baung headband
    const hairGeo = new THREE.CylinderGeometry(0.29, 0.3, 0.16, 12);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.16;
    this.head.add(hair);

    const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), hairMat);
    hairBun.position.set(0, 0.24, -0.15);
    this.head.add(hairBun);

    // Thanaka circular patch on cheeks (မြန်မာ့ရိုးရာ ပါးပြင် သနပ်ခါး)
    const cheekPatchL = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), thanakaMat);
    cheekPatchL.position.set(-0.16, -0.04, 0.25);
    this.head.add(cheekPatchL);

    const cheekPatchR = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), thanakaMat);
    cheekPatchR.position.set(0.16, -0.04, 0.25);
    this.head.add(cheekPatchR);

    // 3. Myanmar Longyi (လုံချည် - cylindrical wrapped tubular sarong)
    const longyiGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.95, 16);
    this.longyi = new THREE.Mesh(longyiGeo, longyiMat);
    this.longyi.position.y = 0.95;
    this.longyi.castShadow = true;
    this.group.add(this.longyi);

    // Knot at waist (လုံချည် ခါးတောင်းကျိုက် အထုံး)
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), longyiMat);
    knot.position.set(0, 0.4, 0.4);
    this.longyi.add(knot);

    // 4. Arms
    this.leftArm = this.createLimb(skinMat, shirtMat, true);
    this.leftArm.position.set(-0.48, 1.95, 0);
    this.group.add(this.leftArm);

    this.rightArm = this.createLimb(skinMat, shirtMat, true);
    this.rightArm.position.set(0.48, 1.95, 0);
    this.group.add(this.rightArm);

    // 5. Legs & Traditional Velvet Slippers (ကတ္တီပါဖိနပ်)
    const slipperMat = new THREE.MeshStandardMaterial({ color: 0x991b1b });

    this.leftLeg = this.createLeg(skinMat, slipperMat);
    this.leftLeg.position.set(-0.2, 0.55, 0);
    this.group.add(this.leftLeg);

    this.rightLeg = this.createLeg(skinMat, slipperMat);
    this.rightLeg.position.set(0.2, 0.55, 0);
    this.group.add(this.rightLeg);

    // 6. Pathein Umbrella Prop held in hand
    this.umbrellaProp = this.createHandheldUmbrella();
    this.umbrellaProp.position.set(0, -0.65, 0.35);
    this.umbrellaProp.rotation.x = Math.PI / 6;
    this.umbrellaProp.visible = false;
    this.rightArm.add(this.umbrellaProp);

    // Initial position on Shwemokhtaw avenue
    this.position.set(0, 0, 18);
  }

  private createLimb(skinMat: THREE.Material, clothMat: THREE.Material, isArm: boolean): THREE.Group {
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
    // Lower leg
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8), skinMat);
    shin.position.y = -0.25;
    leg.add(shin);

    // Foot / slipper
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

  public toggleUmbrella(force?: boolean) {
    this.isHoldingUmbrella = force !== undefined ? force : !this.isHoldingUmbrella;
    this.umbrellaProp.visible = this.isHoldingUmbrella;
    if (this.isHoldingUmbrella) {
      sound.playInteraction();
    }
  }

  public setAction(action: CharacterAction) {
    if (this.currentAction === action) return;
    this.currentAction = action;

    if (action === 'jump') {
      sound.playJump();
    } else if (action === 'bow' || action === 'pray') {
      sound.playInteraction();
    }
  }

  /**
   * Updates player movement, gravity, collisions, and procedural body animations
   */
  public update(
    dt: number,
    inputMove: { x: number; z: number },
    isSprinting: boolean,
    isJumping: boolean,
    cameraAngle: number,
    colliders: ColliderBox[]
  ) {
    // If sitting or bowing/praying, lock movement until input occurs
    const isSpecialEmote = this.currentAction === 'sit' || this.currentAction === 'pray' || this.currentAction === 'bow';
    const hasMoveInput = Math.abs(inputMove.x) > 0.05 || Math.abs(inputMove.z) > 0.05;

    if (isSpecialEmote && hasMoveInput) {
      this.currentAction = 'idle';
    }

    // Determine target speed
    let currentSpeed = 0;
    if (hasMoveInput && !isSpecialEmote) {
      const speed = isSprinting ? this.runSpeed : this.walkSpeed;
      currentSpeed = speed;

      // Transform input vector relative to camera orientation
      const moveAngle = Math.atan2(inputMove.x, inputMove.z);
      const totalAngle = moveAngle + cameraAngle;

      this.rotation = totalAngle;
      this.group.rotation.y = this.rotation;

      const moveX = Math.sin(totalAngle) * speed;
      const moveZ = Math.cos(totalAngle) * speed;

      this.velocity.x = moveX;
      this.velocity.z = moveZ;

      this.currentAction = isSprinting ? 'run' : 'walk';

      // Footstep sound interval
      this.footstepTimer += dt * (isSprinting ? 2.5 : 1.6);
      if (this.footstepTimer > 1.0 && this.isGrounded) {
        sound.playFootstep();
        this.footstepTimer = 0;
      }
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
      if (!isSpecialEmote) {
        this.currentAction = 'idle';
      }
    }

    // Jump logic
    if (isJumping && this.isGrounded && !isSpecialEmote) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.currentAction = 'jump';
      sound.playJump();
    }

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * dt;
    }

    // Calculate next proposed position
    const nextX = this.position.x + this.velocity.x * dt;
    const nextY = this.position.y + this.velocity.y * dt;
    const nextZ = this.position.z + this.velocity.z * dt;

    // Collision check against world colliders
    let canMoveX = true;
    let canMoveZ = true;
    const playerRadius = 0.55;

    // Boundary constraints: Keep player within Pathein game world
    if (nextX < -115 || nextX > 115) canMoveX = false;
    if (nextZ < -72 || nextZ > 68) canMoveZ = false;

    for (const c of colliders) {
      // Check X motion
      if (
        nextX + playerRadius > c.minX &&
        nextX - playerRadius < c.maxX &&
        this.position.z + playerRadius > c.minZ &&
        this.position.z - playerRadius < c.maxZ
      ) {
        canMoveX = false;
      }
      // Check Z motion
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

    // Ground check
    const groundLevel = 0;
    if (nextY <= groundLevel) {
      this.position.y = groundLevel;
      this.velocity.y = 0;
      this.isGrounded = true;
      if (this.currentAction === 'jump') {
        this.currentAction = hasMoveInput ? (isSprinting ? 'run' : 'walk') : 'idle';
      }
    } else {
      this.position.y = nextY;
      this.isGrounded = false;
    }

    // Procedural Animation Solver
    this.animateAvatar(dt, currentSpeed);
  }

  private animateAvatar(dt: number, speed: number) {
    this.animTime += dt;

    if (this.currentAction === 'walk' || this.currentAction === 'run') {
      const freq = this.currentAction === 'run' ? 14 : 9;
      const legSwing = Math.sin(this.animTime * freq) * (this.currentAction === 'run' ? 0.75 : 0.45);

      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      // Arm counter-swing
      if (!this.isHoldingUmbrella) {
        this.leftArm.rotation.x = -legSwing * 0.9;
        this.rightArm.rotation.x = legSwing * 0.9;
      } else {
        this.leftArm.rotation.x = -legSwing * 0.8;
        this.rightArm.rotation.x = -0.5; // Hold umbrella high
      }

      // Torso bob
      this.torso.position.y = 1.65 + Math.abs(Math.sin(this.animTime * freq)) * 0.08;
      this.head.position.y = 2.4 + Math.abs(Math.sin(this.animTime * freq)) * 0.08;
    } else if (this.currentAction === 'jump') {
      this.leftLeg.rotation.x = 0.5;
      this.rightLeg.rotation.x = 0.4;
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = this.isHoldingUmbrella ? -1.0 : -1.2;
    } else if (this.currentAction === 'sit') {
      // Sitting pose
      this.position.y = -0.2;
      this.leftLeg.rotation.x = Math.PI / 2.2;
      this.rightLeg.rotation.x = Math.PI / 2.2;
      this.leftArm.rotation.x = -0.3;
      this.rightArm.rotation.x = -0.3;
      this.torso.position.y = 1.45;
      this.head.position.y = 2.2;
    } else if (this.currentAction === 'pray') {
      // Reverent Buddhist homage pose (လက်အုပ်ချီ ရှိခိုး)
      this.leftArm.rotation.set(-1.1, 0.4, -0.4);
      this.rightArm.rotation.set(-1.1, -0.4, 0.4);
      this.head.rotation.x = 0.25; // Gentle bow of head
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
    } else if (this.currentAction === 'bow') {
      // Mingalaba greeting bow (မင်္ဂလာပါ)
      const bowAngle = 0.35 + Math.sin(this.animTime * 3) * 0.15;
      this.torso.rotation.x = bowAngle;
      this.head.rotation.x = bowAngle * 1.2;
      this.leftArm.rotation.x = -0.6;
      this.rightArm.rotation.x = -0.6;
    } else if (this.currentAction === 'umbrella_dance') {
      // Holding umbrella spinning gently
      this.rightArm.rotation.x = -1.1;
      this.umbrellaProp.rotation.y = this.animTime * 3;
      this.torso.rotation.y = Math.sin(this.animTime * 4) * 0.2;
    } else {
      // Idle breathing
      const breath = Math.sin(this.animTime * 2.5) * 0.02;
      this.torso.position.y = 1.65 + breath;
      this.head.position.y = 2.4 + breath * 1.2;

      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.torso.rotation.x = 0;
      this.torso.rotation.y = 0;
      this.head.rotation.x = 0;

      if (!this.isHoldingUmbrella) {
        this.leftArm.rotation.x = Math.sin(this.animTime * 2.5) * 0.05;
        this.rightArm.rotation.x = -Math.sin(this.animTime * 2.5) * 0.05;
      } else {
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.x = -0.6;
      }
    }
  }

  public teleport(x: number, z: number) {
    this.position.set(x, 0, z);
    this.velocity.set(0, 0, 0);
    this.currentAction = 'idle';
  }
}
