import * as THREE from 'three';
import { WeatherType } from '../types';

/**
 * Procedural Dynamic Weather System for Pathein, Myanmar
 * Features light tropical rain streaks, animated water surface ripples along the Pathein Riverfront,
 * and atmospheric delta rain mist.
 */
export class WeatherSystem {
  public currentWeather: WeatherType = 'clear';
  public group: THREE.Group;

  // Rain particles
  private rainStreaks: THREE.LineSegments | null = null;
  private rainGeo: THREE.BufferGeometry | null = null;
  private positions: Float32Array | null = null;
  private velocities: Float32Array | null = null;
  private dropCount: number = 2400; // Optimal particle count for mobile performance

  // Surface water ripple rings along riverfront
  private rippleMesh: THREE.InstancedMesh | null = null;
  private rippleData: Array<{ x: number; y: number; z: number; scale: number; opacity: number; speed: number }> = [];
  private rippleCount: number = 36;
  private dummyObj: THREE.Object3D;

  // Rain intensity smooth transition
  private targetIntensity: number = 0; // 0 for clear, 1 for full light rain
  public currentIntensity: number = 0;

  // Area bounds for riverfront rain focus
  // Centered along Pathein Riverfront (Z: -95 to -45, X: -110 to 110)
  private areaMinX: number = -110;
  private areaMaxX: number = 110;
  private areaMinZ: number = -115;
  private areaMaxZ: number = -40;
  private minHeight: number = -0.8;
  private maxHeight: number = 42.0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'WeatherSystem';
    this.dummyObj = new THREE.Object3D();

    this.initRainParticles();
    this.initRiverRipples();
    this.setWeather('clear', true);
  }

  /**
   * Initializes high-performance line segment rain streaks
   */
  private initRainParticles() {
    this.rainGeo = new THREE.BufferGeometry();
    // Each streak is 2 vertices (top and bottom) -> dropCount * 2 * 3 floats
    this.positions = new Float32Array(this.dropCount * 2 * 3);
    this.velocities = new Float32Array(this.dropCount);

    const streakLength = 1.35;

    for (let i = 0; i < this.dropCount; i++) {
      const x = this.areaMinX + Math.random() * (this.areaMaxX - this.areaMinX);
      const y = this.minHeight + Math.random() * (this.maxHeight - this.minHeight);
      const z = this.areaMinZ + Math.random() * (this.areaMaxZ - this.areaMinZ);
      const speed = 28.0 + Math.random() * 14.0; // Fall speed in m/s

      this.velocities[i] = speed;

      const idx = i * 6;
      // Vertex 0: Top of drop
      this.positions[idx] = x;
      this.positions[idx + 1] = y + streakLength;
      this.positions[idx + 2] = z;

      // Vertex 1: Bottom of drop (slight wind angle from south-west river breeze)
      this.positions[idx + 3] = x + 0.15;
      this.positions[idx + 4] = y;
      this.positions[idx + 5] = z - 0.22;
    }

    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const rainMat = new THREE.LineBasicMaterial({
      color: 0xbae6fd, // Crisp light sky cyan-silver
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });

    this.rainStreaks = new THREE.LineSegments(this.rainGeo, rainMat);
    this.rainStreaks.frustumCulled = false;
    this.group.add(this.rainStreaks);
  }

  /**
   * Initializes expanding water ripples along Pathein riverfront
   */
  private initRiverRipples() {
    // Thin circular ring geometry
    const ringGeo = new THREE.RingGeometry(0.35, 0.45, 16);
    ringGeo.rotateX(-Math.PI / 2);

    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.rippleMesh = new THREE.InstancedMesh(ringGeo, rippleMat, this.rippleCount);
    this.rippleMesh.frustumCulled = false;

    for (let i = 0; i < this.rippleCount; i++) {
      const rx = this.areaMinX + Math.random() * (this.areaMaxX - this.areaMinX);
      const rz = -75 - Math.random() * 40; // Over the water surface
      this.rippleData.push({
        x: rx,
        y: -1.05,
        z: rz,
        scale: Math.random() * 1.5,
        opacity: Math.random(),
        speed: 1.2 + Math.random() * 1.5,
      });

      this.dummyObj.position.set(rx, -1.05, rz);
      this.dummyObj.scale.set(0.1, 0.1, 0.1);
      this.dummyObj.updateMatrix();
      this.rippleMesh.setMatrixAt(i, this.dummyObj.matrix);
    }
    this.rippleMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.rippleMesh);
  }

  /**
   * Toggles or sets weather
   */
  public setWeather(weather: WeatherType, immediate: boolean = false) {
    this.currentWeather = weather;
    this.targetIntensity = weather === 'tropical_rain' ? 1.0 : 0.0;
    if (immediate) {
      this.currentIntensity = this.targetIntensity;
      this.updateMaterialOpacity();
    }
  }

  public toggleWeather(): WeatherType {
    const list: WeatherType[] = ['clear', 'sunset_flares', 'falling_leaves', 'tropical_rain'];
    const curIdx = list.indexOf(this.currentWeather);
    const next = list[(curIdx + 1) % list.length];
    this.setWeather(next);
    return next;
  }

  private updateMaterialOpacity() {
    if (this.rainStreaks) {
      (this.rainStreaks.material as THREE.LineBasicMaterial).opacity = this.currentIntensity * 0.65;
    }
    if (this.rippleMesh) {
      (this.rippleMesh.material as THREE.MeshBasicMaterial).opacity = this.currentIntensity * 0.45;
    }
  }

  /**
   * Updates rain streak animations, ripples, and intensity transitions
   */
  public update(dt: number) {
    // Smooth transition of rain intensity
    if (Math.abs(this.currentIntensity - this.targetIntensity) > 0.005) {
      this.currentIntensity = THREE.MathUtils.damp(
        this.currentIntensity,
        this.targetIntensity,
        4.0,
        dt
      );
      this.updateMaterialOpacity();
    }

    if (this.currentIntensity < 0.01) {
      if (this.rainStreaks) this.rainStreaks.visible = false;
      if (this.rippleMesh) this.rippleMesh.visible = false;
      return;
    }

    if (this.rainStreaks) this.rainStreaks.visible = true;
    if (this.rippleMesh) this.rippleMesh.visible = true;

    // 1. Update rain streaks
    if (this.positions && this.velocities && this.rainGeo) {
      const streakLength = 1.35;
      const windX = 3.2 * dt;
      const windZ = -4.5 * dt;

      for (let i = 0; i < this.dropCount; i++) {
        const speed = this.velocities[i];
        const fall = speed * dt;
        const idx = i * 6;

        let yBottom = this.positions[idx + 4] - fall;
        let xBottom = this.positions[idx + 3] + windX;
        let zBottom = this.positions[idx + 5] + windZ;

        // Reset if raindrop has hit the river surface or ground
        if (yBottom < this.minHeight) {
          yBottom = this.maxHeight + Math.random() * 4.0;
          xBottom = this.areaMinX + Math.random() * (this.areaMaxX - this.areaMinX);
          zBottom = this.areaMinZ + Math.random() * (this.areaMaxZ - this.areaMinZ);
        }

        // Top vertex
        this.positions[idx] = xBottom - 0.15;
        this.positions[idx + 1] = yBottom + streakLength;
        this.positions[idx + 2] = zBottom + 0.22;

        // Bottom vertex
        this.positions[idx + 3] = xBottom;
        this.positions[idx + 4] = yBottom;
        this.positions[idx + 5] = zBottom;
      }

      this.rainGeo.attributes.position.needsUpdate = true;
    }

    // 2. Update water surface ripples
    if (this.rippleMesh) {
      for (let i = 0; i < this.rippleCount; i++) {
        const rip = this.rippleData[i];
        rip.scale += rip.speed * dt * 0.9;
        rip.opacity -= dt * 0.8;

        if (rip.opacity <= 0 || rip.scale > 2.2) {
          // Respawn ripple at new river location
          rip.x = this.areaMinX + Math.random() * (this.areaMaxX - this.areaMinX);
          rip.z = -75 - Math.random() * 42;
          rip.scale = 0.15;
          rip.opacity = 0.8;
          rip.speed = 1.2 + Math.random() * 1.5;
        }

        this.dummyObj.position.set(rip.x, rip.y, rip.z);
        this.dummyObj.scale.set(rip.scale, rip.scale, rip.scale);
        this.dummyObj.updateMatrix();
        this.rippleMesh.setMatrixAt(i, this.dummyObj.matrix);
      }
      this.rippleMesh.instanceMatrix.needsUpdate = true;
    }
  }

  public dispose() {
    if (this.rainGeo) this.rainGeo.dispose();
    if (this.rainStreaks) {
      (this.rainStreaks.material as THREE.Material).dispose();
    }
    if (this.rippleMesh) {
      this.rippleMesh.geometry.dispose();
      (this.rippleMesh.material as THREE.Material).dispose();
    }
  }
}
