import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterController } from './Character';
import { buildShwemokhtawPagoda } from './Pagoda';
import { buildPatheinRiverfront } from './Riverfront';
import { buildUmbrellaMarket } from './UmbrellaMarket';
import { buildPatheinDowntown } from './Downtown';
import { buildSocialPark } from './SocialPark';
import { createStonePavingTexture } from '../textures/proceduralTextures';
import { CameraMode, ColliderBox, InteractiveSpot, LocationInfo, TimeOfDay, WeatherType } from '../types';
import { sound } from '../audio/soundSystem';
import { WeatherSystem } from './WeatherSystem';

// District locations for GPS/Minimap & discovery alerts
export const PATHEIN_LOCATIONS: LocationInfo[] = [
  {
    id: 'shwemokhtaw',
    burmeseName: 'ရွှေမုဋ္ဌော စေတီတော်မြတ်ကြီး',
    englishName: 'Shwemokhtaw Pagoda',
    description: 'The ancient spiritual heart of Pathein, originally founded in 305 BC by King Asoka.',
    highlight: 'Golden Stupa, Hti finial, and Chinthe guardian lions',
    position: { x: 0, z: 0 },
  },
  {
    id: 'riverfront',
    burmeseName: 'ပုသိမ်မြစ်ကမ်းနား ဆိပ်ကမ်း',
    englishName: 'Pathein Riverfront Strand',
    description: 'Iconic delta river promenade with evening river breezes, sampans, and passenger ferries.',
    highlight: 'Ayeyarwady delta water vistas, sunsets & wooden sampans',
    position: { x: -20, z: -70 },
  },
  {
    id: 'umbrella_market',
    burmeseName: 'ပုသိမ်ထီး ရိုးရာဈေးတန်း',
    englishName: 'Pathein Umbrella Market',
    description: 'World-famous craft center of Myanmar hand-painted cotton & silk umbrellas.',
    highlight: 'Vibrant umbrella canopy, bamboo crafting workshops',
    position: { x: -52, z: 0 },
  },
  {
    id: 'downtown',
    burmeseName: 'ပုသိမ်မြို့လယ် ကုန်သည်လမ်း',
    englishName: 'Pathein Downtown & Clock Tower',
    description: 'Vibrant city center with heritage shophouses, Clock Tower, and Pathein Halawa stores.',
    highlight: 'Pathein Halawa shops, Clock Tower, and traditional trishaws',
    position: { x: 45, z: -15 },
  },
  {
    id: 'social_park',
    burmeseName: 'သီရိဧရာ လက်ဖက်ရည်ဝိုင်းနှင့် ပန်းခြံ',
    englishName: 'Thiri Ayeyar Tea Cafe & Park',
    description: 'Outdoor Myanmar tea shop culture with low stools, hot tea thermos, and green park lawns.',
    highlight: 'Myanmar tea circles, lotus pond, and tropical palms',
    position: { x: 45, z: 45 },
  },
];

// Interactive triggers
export const PATHEIN_INTERACTIVES: InteractiveSpot[] = [
  {
    id: 'bell_1',
    title: 'Ring Sacred Pagoda Bell',
    burmeseTitle: 'ကြေးခေါင်းလောင်း ထိုးမည်',
    actionText: 'Ring Bell',
    burmeseActionText: 'ခေါင်းလောင်းထိုးမည်',
    position: { x: 20, y: 0.8, z: 12 },
    radius: 4.5,
    type: 'bell',
    description: 'Ring the sacred temple bell three times to share merit (သာဓု) across the city.',
  },
  {
    id: 'pray_shrine',
    title: 'Pay Homage at Pagoda Shrine',
    burmeseTitle: 'ဘုရားရှိခိုး ပူဇော်မည်',
    actionText: 'Pay Homage',
    burmeseActionText: 'ရှိခိုးမည်',
    position: { x: 0, y: 0.8, z: 20 },
    radius: 4.5,
    type: 'pray',
    description: 'Offer prayers at the Shwemokhtaw south prayer hall in peaceful reverence.',
  },
  {
    id: 'halawa_taste',
    title: 'Taste Pathein Halawa',
    burmeseTitle: 'ပုသိမ်ဟာလဝါ မြည်းစမ်းမည်',
    actionText: 'Taste Sweet',
    burmeseActionText: 'ဟာလဝါစားမည်',
    position: { x: 45, y: 0.5, z: -5.5 },
    radius: 4.0,
    type: 'halawa',
    description: 'Delicious sticky rice confection enriched with coconut milk and toasted poppy seeds.',
  },
  {
    id: 'umbrella_hold',
    title: 'Equip Pathein Umbrella',
    burmeseTitle: 'ပုသိမ်ထီး ကိုင်ဆောင်မည်',
    actionText: 'Equip Umbrella',
    burmeseActionText: 'ထီးကိုင်မည်',
    position: { x: -52, y: 0.5, z: 0 },
    radius: 5.0,
    type: 'umbrella',
    description: 'Hold a colorful traditional hand-painted Pathein umbrella while exploring the city.',
  },
  {
    id: 'tea_sit',
    title: 'Sit for Myanmar Tea',
    burmeseTitle: 'လက်ဖက်ရည် သောက်ထိုင်မည်',
    actionText: 'Sit at Table',
    burmeseActionText: 'ထိုင်မည် (Sit/Stand)',
    position: { x: 47, y: 0.5, z: 45 },
    radius: 4.0,
    type: 'tea',
    description: 'Enjoy sweet Myanmar tea and endless hot plain tea (ရေနွေးကြမ်း) with friends.',
  },
  {
    id: 'park_cinema',
    title: 'Watch Outdoor Cinema',
    burmeseTitle: 'ပန်းခြံ ရုပ်ရှင် ကြည့်မည်',
    actionText: 'Watch Movie',
    burmeseActionText: 'ရုပ်ရှင်ကြည့်မည်',
    position: { x: 55, y: 0.5, z: 28 },
    radius: 5.5,
    type: 'cinema',
    description: 'Enjoy open-air cinema screen broadcasting scenic Pathein river vistas and cultural shows.',
  },
  {
    id: 'park_coaster',
    title: 'Ride Delta Roller Coaster',
    burmeseTitle: 'ဒယ်လ်တာ ရိုလာကိုစတာ စီးမည်',
    actionText: 'Ride Coaster',
    burmeseActionText: 'ရိုလာကိုစတာစီးမည်',
    position: { x: 20, y: 0.5, z: 20 },
    radius: 5.0,
    type: 'coaster',
    description: 'Experience an exhilarating high-speed aerial rollercoaster tour of Pathein delta landscape.',
  },
  {
    id: 'park_radio',
    title: 'Tune Myanmar Radio',
    burmeseTitle: 'မြန်မာ့အသံ ရေဒီယို ဖွင့်မည်',
    actionText: 'Play Radio',
    burmeseActionText: 'ရေဒီယိုဖွင့်မည်',
    position: { x: 51, y: 0.8, z: 40 },
    radius: 4.0,
    type: 'tea',
    description: 'Listen to classical Myanmar Mahagita harp melodies and relaxing tea shop tunes.',
  },
  {
    id: 'water_gun_stand',
    title: 'Equip Water Gun Toy',
    burmeseTitle: 'သကြန် ရေပြွတ်သေနတ် ကိုင်မည်',
    actionText: 'Equip Water Gun',
    burmeseActionText: 'ရေပြွတ်ကိုင်မည်',
    position: { x: -20, y: 0.5, z: -68 },
    radius: 4.5,
    type: 'water_gun',
    description: 'Cool off with a fun water gun toy by the Pathein riverfront promenade.',
  },
  {
    id: 'river_sunset',
    title: 'Pathein River Viewpoint',
    burmeseTitle: 'မြစ်ပြင်ဆည်းဆာ ကြည့်မည်',
    actionText: 'Admire View',
    burmeseActionText: 'ရှုခင်းကြည့်မည်',
    position: { x: -20, y: 0.8, z: -88 },
    radius: 5.5,
    type: 'scenic',
    description: 'Gaze over the Ayeyarwady Delta waterway as cargo boats and sampans drift by.',
  },
];

// Lighting preset definition for smooth transitions
export interface LightingPreset {
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunPos: THREE.Vector3;
  hemiSkyColor: THREE.Color;
  hemiGroundColor: THREE.Color;
  hemiIntensity: number;
  ambientColor: THREE.Color;
  ambientIntensity: number;
  pagodaGlowColor: THREE.Color;
  pagodaGlowIntensity: number;
  streetLightsIntensity: number;
}

export const LIGHTING_PRESETS: Record<TimeOfDay, LightingPreset> = {
  day: {
    fogColor: new THREE.Color(0x7dd3fc), // Tropical light sky blue
    fogNear: 90,
    fogFar: 240,
    sunColor: new THREE.Color(0xfff3c4), // Warm sunlight
    sunIntensity: 1.85,
    sunPos: new THREE.Vector3(60, 90, 50),
    hemiSkyColor: new THREE.Color(0xffffff),
    hemiGroundColor: new THREE.Color(0x334155),
    hemiIntensity: 0.8,
    ambientColor: new THREE.Color(0xfffbeb),
    ambientIntensity: 0.45,
    pagodaGlowColor: new THREE.Color(0xf59e0b),
    pagodaGlowIntensity: 0.6,
    streetLightsIntensity: 0.0,
  },
  sunset: {
    fogColor: new THREE.Color(0xfdba74), // Vibrant sunset amber/peach
    fogNear: 80,
    fogFar: 220,
    sunColor: new THREE.Color(0xf97316), // Deep orange sun over river
    sunIntensity: 2.2,
    sunPos: new THREE.Vector3(-80, 32, -90),
    hemiSkyColor: new THREE.Color(0xfeb272),
    hemiGroundColor: new THREE.Color(0x451a03),
    hemiIntensity: 0.85,
    ambientColor: new THREE.Color(0xffedd5),
    ambientIntensity: 0.55,
    pagodaGlowColor: new THREE.Color(0xf59e0b),
    pagodaGlowIntensity: 2.8,
    streetLightsIntensity: 0.65,
  },
  night: {
    fogColor: new THREE.Color(0x090d16), // Deep delta night indigo
    fogNear: 70,
    fogFar: 200,
    sunColor: new THREE.Color(0x60a5fa), // Moonlight silver-blue
    sunIntensity: 0.45,
    sunPos: new THREE.Vector3(-40, 70, 40),
    hemiSkyColor: new THREE.Color(0x1e293b),
    hemiGroundColor: new THREE.Color(0x0f172a),
    hemiIntensity: 0.35,
    ambientColor: new THREE.Color(0x1e1b4b),
    ambientIntensity: 0.35,
    pagodaGlowColor: new THREE.Color(0xfbbf24), // Radiant golden stupa
    pagodaGlowIntensity: 5.0,
    streetLightsIntensity: 1.6,
  },
};

// Reusable math objects for zero GC per frame
const _tempColor = new THREE.Color();

export class GameScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  public character: CharacterController;

  // Environment and lighting
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private pagodaGlowLight: THREE.PointLight;
  private streetLightsGroup: THREE.Group;
  private currentTimeOfDay: TimeOfDay = 'day';
  public weatherSystem: WeatherSystem;
  private baseFogNear: number = 80;
  private baseFogFar: number = 220;

  // Smooth lighting transition state
  public isLightingTransitionActive: boolean = false;
  private lightingTransitionTimer: number = 0;
  public readonly lightingTransitionDuration: number = 2.0; // 2.0s cinematic transition
  private targetTimeOfDay: TimeOfDay = 'day';
  private transitionStartValues = {
    fogColor: new THREE.Color(0x7dd3fc),
    fogNear: 90,
    fogFar: 240,
    sunColor: new THREE.Color(0xfff3c4),
    sunIntensity: 1.85,
    sunPos: new THREE.Vector3(60, 90, 50),
    hemiSkyColor: new THREE.Color(0xffffff),
    hemiGroundColor: new THREE.Color(0x334155),
    hemiIntensity: 0.8,
    ambientColor: new THREE.Color(0xfffbeb),
    ambientIntensity: 0.45,
    pagodaGlowColor: new THREE.Color(0xf59e0b),
    pagodaGlowIntensity: 0.6,
    streetLightsIntensity: 0,
  };
  private streetLightSources: THREE.PointLight[] = [];
  private streetLightMaterials: THREE.MeshStandardMaterial[] = [];
  private currentStreetLightsIntensity: number = 0;

  // Animation & game loop
  private animFrameId: number = 0;
  private clock: THREE.Clock;
  private isDestroyed: boolean = false;
  private updateWaterFn: ((t: number) => void) | null = null;
  private updateUmbrellasFn: ((t: number) => void) | null = null;

  // Camera settings
  public cameraMode: CameraMode = 'third_person';
  public cameraAngleYaw: number = 0;
  public cameraAnglePitch: number = 0.35;
  public cameraDistance: number = 7.5;
  private cinematicTimer: number = 0;

  // Coaster Ride mode
  public isCoasterActive: boolean = false;
  private coasterTimer: number = 0;

  // Click to move marker
  private targetMarker!: THREE.Mesh;

  // Collision system
  public colliders: ColliderBox[] = [];

  // Interaction & UI callbacks
  public onDistrictChange?: (loc: LocationInfo | null) => void;
  public onNearbyInteractive?: (spot: InteractiveSpot | null) => void;
  private currentDistrictId: string | null = null;
  private currentNearSpotId: string | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Check software GL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );

    // Studio Environment map for authentic gold leaf reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xfffbeb, 0.45);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfff3c4, 1.8);
    this.sunLight.position.set(60, 90, 50);
    this.sunLight.castShadow = !isSoftwareGl;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 250;
    const d = 70;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Special pagoda golden spotlight for evening & night splendor
    this.pagodaGlowLight = new THREE.PointLight(0xf59e0b, 2.5, 80);
    this.pagodaGlowLight.position.set(0, 16, 0);
    this.scene.add(this.pagodaGlowLight);

    this.streetLightsGroup = new THREE.Group();
    this.scene.add(this.streetLightsGroup);

    // 4. Ground Terrain & City Roads
    this.buildTerrainAndRoads();

    // 5. Build Pathein City Landmarks
    const pagoda = buildShwemokhtawPagoda(this.colliders);
    this.scene.add(pagoda);

    const river = buildPatheinRiverfront(this.colliders);
    this.scene.add(river.group);
    this.updateWaterFn = river.updateWater;

    const market = buildUmbrellaMarket(this.colliders);
    this.scene.add(market.group);
    this.updateUmbrellasFn = market.updateUmbrellas;

    const downtown = buildPatheinDowntown(this.colliders);
    this.scene.add(downtown);

    const park = buildSocialPark(this.colliders);
    this.scene.add(park);

    // 6. Character Controller
    this.character = new CharacterController();
    this.scene.add(this.character.group);

    // Click-to-move destination indicator ring
    const ringGeo = new THREE.RingGeometry(0.45, 0.65, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.targetMarker = new THREE.Mesh(ringGeo, ringMat);
    this.targetMarker.position.y = 0.08;
    this.scene.add(this.targetMarker);

    // 7. Dynamic Weather System (Tropical Rain over Pathein riverfront)
    this.weatherSystem = new WeatherSystem();
    this.scene.add(this.weatherSystem.group);

    // Initialize decorative street lamps & lanterns and set initial golden sunset lighting instantly
    this.initStreetLights();
    this.setTimeOfDay('sunset', true);

    // Window resize handler
    window.addEventListener('resize', this.handleResize);

    // Start game loop
    this.tick();
  }

  /**
   * Builds expansive terrain with tropical ground, connecting walkways, and boundary palm rows
   */
  private buildTerrainAndRoads() {
    // Large ground plane
    const groundGeo = new THREE.PlaneGeometry(320, 260);
    groundGeo.rotateX(-Math.PI / 2);

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Tropical delta greenery
      roughness: 0.9,
    });

    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Connecting stone boulevard from Shwemokhtaw Pagoda to Riverfront & Market
    const roadTex = createStonePavingTexture(false);
    roadTex.repeat.set(8, 40);

    const avenueGeo = new THREE.BoxGeometry(10, 0.1, 100);
    const avenueMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.7,
    });
    const avenue = new THREE.Mesh(avenueGeo, avenueMat);
    avenue.position.set(0, 0.05, -20);
    avenue.receiveShadow = true;
    this.scene.add(avenue);

    // Avenue between Pagoda and Umbrella Market
    const marketBoulevard = new THREE.Mesh(new THREE.BoxGeometry(32, 0.1, 10), avenueMat);
    marketBoulevard.position.set(-26, 0.05, 0);
    marketBoulevard.receiveShadow = true;
    this.scene.add(marketBoulevard);

    // Boulevard leading to Social Park & Downtown
    const eastBoulevard = new THREE.Mesh(new THREE.BoxGeometry(32, 0.1, 10), avenueMat);
    eastBoulevard.position.set(26, 0.05, 12);
    eastBoulevard.receiveShadow = true;
    this.scene.add(eastBoulevard);

    // Natural perimeter barriers: Dense tropical bamboo and palm rows to enclose the city naturally
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
    // North edge
    const northBarrier = new THREE.Mesh(new THREE.BoxGeometry(260, 7, 10), barrierMat);
    northBarrier.position.set(0, 3.5, 75);
    this.scene.add(northBarrier);
    this.colliders.push({ minX: -130, maxX: 130, minZ: 70, maxZ: 80 });

    // West edge
    const westBarrier = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 160), barrierMat);
    westBarrier.position.set(-125, 3.5, 0);
    this.scene.add(westBarrier);
    this.colliders.push({ minX: -130, maxX: -120, minZ: -80, maxZ: 80 });

    // East edge
    const eastBarrier = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 160), barrierMat);
    eastBarrier.position.set(125, 3.5, 0);
    this.scene.add(eastBarrier);
    this.colliders.push({ minX: 120, maxX: 130, minZ: -80, maxZ: 80 });
  }

  /**
   * Initializes decorative street lanterns and atmospheric promenade lighting
   */
  private initStreetLights() {
    const lampPositions = [
      { x: -38, y: 4.2, z: -73 }, // Riverfront West
      { x: -20, y: 4.2, z: -73 }, // Riverfront Center / Pier
      { x: -2, y: 4.2, z: -73 },  // Riverfront East
      { x: 0, y: 3.8, z: 24 },    // Shwemokhtaw South Entrance arch
      { x: 24, y: 5.2, z: -11 },  // Downtown Clock Tower junction
      { x: 55, y: 4.2, z: -11 },  // Downtown Halawa shophouses
      { x: 45, y: 3.5, z: 45 },   // Social Park Tea Pavilion
    ];

    lampPositions.forEach(pos => {
      // Warm golden lantern point light
      const pLight = new THREE.PointLight(0xfbbf24, 0, 26, 2);
      pLight.position.set(pos.x, pos.y, pos.z);
      this.streetLightsGroup.add(pLight);
      this.streetLightSources.push(pLight);

      // Glowing decorative lantern bulb mesh
      const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xf59e0b,
        emissiveIntensity: 0,
        roughness: 0.2,
      });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), bulbMat);
      bulb.position.set(pos.x, pos.y, pos.z);
      this.streetLightsGroup.add(bulb);
      this.streetLightMaterials.push(bulbMat);
    });
  }

  /**
   * Sets intensity for all street lamps and their glowing emissive bulbs
   */
  private setStreetLightsIntensity(intensity: number) {
    this.currentStreetLightsIntensity = intensity;
    for (let i = 0; i < this.streetLightSources.length; i++) {
      this.streetLightSources[i].intensity = intensity;
    }
    for (let i = 0; i < this.streetLightMaterials.length; i++) {
      this.streetLightMaterials[i].emissiveIntensity = intensity * 1.2;
    }
  }

  /**
   * Takes snapshot of current active lighting values before starting smooth transition
   */
  private snapshotCurrentLighting() {
    if (this.scene.background instanceof THREE.Color) {
      this.transitionStartValues.fogColor.copy(this.scene.background);
    } else if (this.scene.fog instanceof THREE.Fog) {
      this.transitionStartValues.fogColor.copy(this.scene.fog.color);
    }
    this.transitionStartValues.fogNear = this.baseFogNear;
    this.transitionStartValues.fogFar = this.baseFogFar;

    this.transitionStartValues.sunColor.copy(this.sunLight.color);
    this.transitionStartValues.sunIntensity = this.sunLight.intensity;
    this.transitionStartValues.sunPos.copy(this.sunLight.position);

    this.transitionStartValues.hemiSkyColor.copy(this.hemiLight.color);
    this.transitionStartValues.hemiGroundColor.copy(this.hemiLight.groundColor);
    this.transitionStartValues.hemiIntensity = this.hemiLight.intensity;

    this.transitionStartValues.ambientColor.copy(this.ambientLight.color);
    this.transitionStartValues.ambientIntensity = this.ambientLight.intensity;

    this.transitionStartValues.pagodaGlowColor.copy(this.pagodaGlowLight.color);
    this.transitionStartValues.pagodaGlowIntensity = this.pagodaGlowLight.intensity;

    this.transitionStartValues.streetLightsIntensity = this.currentStreetLightsIntensity;
  }

  /**
   * Sets Time of Day with cinematic smooth transition animation
   */
  public setTimeOfDay(time: TimeOfDay, instant: boolean = false) {
    this.currentTimeOfDay = time;
    this.targetTimeOfDay = time;
    const target = LIGHTING_PRESETS[time];

    if (instant) {
      this.isLightingTransitionActive = false;
      this.baseFogNear = target.fogNear;
      this.baseFogFar = target.fogFar;

      if (this.scene.background instanceof THREE.Color) {
        this.scene.background.copy(target.fogColor);
      } else {
        this.scene.background = target.fogColor.clone();
      }

      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color.copy(target.fogColor);
        this.scene.fog.near = target.fogNear;
        this.scene.fog.far = target.fogFar;
      } else {
        this.scene.fog = new THREE.Fog(target.fogColor.getHex(), target.fogNear, target.fogFar);
      }

      this.sunLight.color.copy(target.sunColor);
      this.sunLight.intensity = target.sunIntensity;
      this.sunLight.position.copy(target.sunPos);

      this.hemiLight.color.copy(target.hemiSkyColor);
      this.hemiLight.groundColor.copy(target.hemiGroundColor);
      this.hemiLight.intensity = target.hemiIntensity;

      this.ambientLight.color.copy(target.ambientColor);
      this.ambientLight.intensity = target.ambientIntensity;

      this.pagodaGlowLight.color.copy(target.pagodaGlowColor);
      this.pagodaGlowLight.intensity = target.pagodaGlowIntensity;

      this.setStreetLightsIntensity(target.streetLightsIntensity);
      return;
    }

    // Smooth transition from current active lighting state
    this.snapshotCurrentLighting();
    this.lightingTransitionTimer = 0;
    this.isLightingTransitionActive = true;
  }

  /**
   * Smoothly interpolates all lighting, sun position, fog, and street lamps per frame
   */
  private updateLightingTransition(dt: number) {
    this.lightingTransitionTimer += dt;
    const rawProgress = Math.min(this.lightingTransitionTimer / this.lightingTransitionDuration, 1.0);
    // Smoothstep cubic easing: 3t^2 - 2t^3 for organic cinematic flow
    const t = rawProgress * rawProgress * (3 - 2 * rawProgress);

    const start = this.transitionStartValues;
    const target = LIGHTING_PRESETS[this.targetTimeOfDay];

    // 1. Sky background & Fog color
    _tempColor.copy(start.fogColor).lerp(target.fogColor, t);
    if (this.scene.background instanceof THREE.Color) {
      this.scene.background.copy(_tempColor);
    } else {
      this.scene.background = _tempColor.clone();
    }
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.copy(_tempColor);
    }

    // Fog distances
    this.baseFogNear = THREE.MathUtils.lerp(start.fogNear, target.fogNear, t);
    this.baseFogFar = THREE.MathUtils.lerp(start.fogFar, target.fogFar, t);

    // 2. Sun Directional Light (Color, Intensity, and Solar Arc Position)
    this.sunLight.color.copy(start.sunColor).lerp(target.sunColor, t);
    this.sunLight.intensity = THREE.MathUtils.lerp(start.sunIntensity, target.sunIntensity, t);
    this.sunLight.position.lerpVectors(start.sunPos, target.sunPos, t);

    // 3. Hemisphere Sky / Ground Light
    this.hemiLight.color.copy(start.hemiSkyColor).lerp(target.hemiSkyColor, t);
    this.hemiLight.groundColor.copy(start.hemiGroundColor).lerp(target.hemiGroundColor, t);
    this.hemiLight.intensity = THREE.MathUtils.lerp(start.hemiIntensity, target.hemiIntensity, t);

    // 4. Ambient Light
    this.ambientLight.color.copy(start.ambientColor).lerp(target.ambientColor, t);
    this.ambientLight.intensity = THREE.MathUtils.lerp(start.ambientIntensity, target.ambientIntensity, t);

    // 5. Pagoda Golden Glow
    this.pagodaGlowLight.color.copy(start.pagodaGlowColor).lerp(target.pagodaGlowColor, t);
    this.pagodaGlowLight.intensity = THREE.MathUtils.lerp(start.pagodaGlowIntensity, target.pagodaGlowIntensity, t);

    // 6. Street lanterns & promenade lighting
    const streetInt = THREE.MathUtils.lerp(start.streetLightsIntensity, target.streetLightsIntensity, t);
    this.setStreetLightsIntensity(streetInt);

    if (rawProgress >= 1.0) {
      this.isLightingTransitionActive = false;
    }
  }

  public getTimeOfDay(): TimeOfDay {
    return this.currentTimeOfDay;
  }

  /**
   * Sets Weather state (Clear or Light Tropical Rain)
   */
  public setWeather(weather: WeatherType) {
    this.weatherSystem.setWeather(weather);
    if (weather === 'tropical_rain') {
      sound.startRainAudio();
    } else {
      sound.stopRainAudio();
    }
  }

  public getWeather(): WeatherType {
    return this.weatherSystem.currentWeather;
  }

  public toggleWeather(): WeatherType {
    const next = this.weatherSystem.toggleWeather();
    if (next === 'tropical_rain') {
      sound.startRainAudio();
    } else {
      sound.stopRainAudio();
    }
    return next;
  }

  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    if (mode === 'cinematic') {
      this.cinematicTimer = 0;
    }
  }

  /**
   * Main game animation loop
   */
  private tick = () => {
    if (this.isDestroyed) return;

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth lighting transition, dynamic water ripples, umbrellas, and tropical weather
    if (this.isLightingTransitionActive) {
      this.updateLightingTransition(dt);
    }

    if (this.updateWaterFn) {
      this.updateWaterFn(elapsedTime);
    }
    if (this.updateUmbrellasFn) {
      this.updateUmbrellasFn(elapsedTime);
    }
    this.weatherSystem.update(dt);

    // Delta atmospheric tropical rain mist modulation
    if (this.scene.fog instanceof THREE.Fog) {
      const rainInt = this.weatherSystem.currentIntensity;
      this.scene.fog.near = THREE.MathUtils.lerp(this.baseFogNear, 42, rainInt * 0.7);
      this.scene.fog.far = THREE.MathUtils.lerp(this.baseFogFar, 145, rainInt * 0.6);
    }

    // Target indicator ring animation
    if (this.targetMarker && (this.targetMarker.material as THREE.MeshBasicMaterial).opacity > 0) {
      const mat = this.targetMarker.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, mat.opacity - dt * 1.4);
      this.targetMarker.scale.multiplyScalar(1 + dt * 0.4);
    }

    // 2. Camera positioning relative to character
    this.updateCamera(dt, elapsedTime);

    // 3. Proximity detection for District Discovery & Interactive prompts
    this.checkProximityTriggers();

    // 4. Render
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Camera behavior for Third-person, First-person, and Cinematic Drone Tour
   */
  private updateCamera(dt: number, time: number) {
    if (this.isCoasterActive) {
      this.coasterTimer += dt * 0.32;
      const t = this.coasterTimer * Math.PI * 2;
      const camX = 20 + Math.cos(t) * 24;
      const camZ = 20 + Math.sin(t) * 24;
      const camY = 8.5 + Math.sin(t * 3) * 5;

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(20, 2, 20);

      if (this.coasterTimer >= 1.0) {
        this.isCoasterActive = false;
      }
      return;
    }

    const charPos = this.character.position;

    if (this.cameraMode === 'cinematic') {
      // Smooth majestic drone orbit of Pathein landmarks
      this.cinematicTimer += dt * 0.25;
      const camRadius = 45;
      const camX = Math.cos(this.cinematicTimer) * camRadius;
      const camZ = Math.sin(this.cinematicTimer) * camRadius;
      const camY = 22 + Math.sin(this.cinematicTimer * 0.7) * 8;

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(0, 8, 0); // Focused on Shwemokhtaw Pagoda spire
    } else if (this.cameraMode === 'first_person') {
      // Eye level of character
      const headHeight = 2.4;
      this.camera.position.set(charPos.x, charPos.y + headHeight, charPos.z);

      const lookTarget = new THREE.Vector3(
        charPos.x + Math.sin(this.cameraAngleYaw) * 10,
        charPos.y + headHeight - Math.sin(this.cameraAnglePitch) * 10,
        charPos.z + Math.cos(this.cameraAngleYaw) * 10
      );
      this.camera.lookAt(lookTarget);
    } else {
      // Third-person smooth follow camera with yaw and pitch control
      const targetLook = new THREE.Vector3(charPos.x, charPos.y + 1.8, charPos.z);

      const offsetDist = this.cameraDistance;
      const camX = charPos.x - Math.sin(this.cameraAngleYaw) * Math.cos(this.cameraAnglePitch) * offsetDist;
      const camY = charPos.y + 1.8 + Math.sin(this.cameraAnglePitch) * offsetDist;
      const camZ = charPos.z - Math.cos(this.cameraAngleYaw) * Math.cos(this.cameraAnglePitch) * offsetDist;

      // Exponential damping for smooth glide
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, camX, 10, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, Math.max(camY, 0.8), 10, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, camZ, 10, dt);

      this.camera.lookAt(targetLook);
    }
  }

  /**
   * Free 360-degree camera rotation
   */
  public rotateCamera(deltaYaw: number, deltaPitch: number) {
    this.cameraAngleYaw -= deltaYaw;
    this.cameraAnglePitch = Math.max(-0.25, Math.min(1.35, this.cameraAnglePitch + deltaPitch));
  }

  /**
   * Smooth zoom in and out
   */
  public zoomCamera(deltaDist: number) {
    this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance + deltaDist, 2.0, 22.0);
  }

  /**
   * Click-to-Move ground pathing
   */
  public clickToMove(clientX: number, clientY: number) {
    const rect = this.container.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    for (const hit of intersects) {
      if (hit.point.y < 1.4 && Math.abs(hit.point.x) < 118 && Math.abs(hit.point.z) < 74) {
        this.character.targetDestination = new THREE.Vector3(hit.point.x, 0, hit.point.z);
        this.targetMarker.position.set(hit.point.x, 0.08, hit.point.z);
        this.targetMarker.scale.set(1, 1, 1);
        (this.targetMarker.material as THREE.MeshBasicMaterial).opacity = 0.95;
        sound.playInteraction();
        break;
      }
    }
  }

  public startCoasterRide() {
    this.isCoasterActive = true;
    this.coasterTimer = 0;
    sound.playRiverWater();
  }

  /**
   * Evaluates player location against districts and interactives
   */
  private checkProximityTriggers() {
    const px = this.character.position.x;
    const pz = this.character.position.z;

    // 1. Detect current district
    let nearestDistrict: LocationInfo | null = null;
    let minDistrictDist = 45; // Max radius for district attribution

    for (const loc of PATHEIN_LOCATIONS) {
      const dx = px - loc.position.x;
      const dz = pz - loc.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < minDistrictDist) {
        minDistrictDist = dist;
        nearestDistrict = loc;
      }
    }

    if (nearestDistrict && nearestDistrict.id !== this.currentDistrictId) {
      this.currentDistrictId = nearestDistrict.id;
      if (this.onDistrictChange) {
        this.onDistrictChange(nearestDistrict);
      }
    }

    // 2. Detect nearest interactive prompt spot
    let nearestSpot: InteractiveSpot | null = null;
    for (const spot of PATHEIN_INTERACTIVES) {
      const dx = px - spot.position.x;
      const dz = pz - spot.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= spot.radius) {
        nearestSpot = spot;
        break;
      }
    }

    const spotId = nearestSpot ? nearestSpot.id : null;
    if (spotId !== this.currentNearSpotId) {
      this.currentNearSpotId = spotId;
      if (this.onNearbyInteractive) {
        this.onNearbyInteractive(nearestSpot);
      }
    }
  }

  /**
   * Executes interactive action on spot
   */
  public triggerInteraction(spot: InteractiveSpot) {
    if (spot.type === 'bell') {
      sound.playPagodaBell();
    } else if (spot.type === 'umbrella') {
      this.character.toggleUmbrella(true);
      this.character.setAction('umbrella_dance');
      setTimeout(() => this.character.setAction('idle'), 3000);
    } else if (spot.type === 'pray') {
      this.character.setAction('pray');
      sound.playPagodaBell();
    } else if (spot.type === 'tea' || spot.type === 'sit') {
      this.character.toggleSit();
    } else if (spot.type === 'halawa') {
      sound.playInteraction();
    } else if (spot.type === 'scenic') {
      sound.playRiverWater();
    } else if (spot.type === 'cinema') {
      sound.playRadioTune();
      this.character.setAction('wave');
    } else if (spot.type === 'coaster') {
      this.startCoasterRide();
    } else if (spot.type === 'water_gun') {
      this.character.toggleWaterGun(true);
      this.character.setAction('water_gun');
      sound.playRiverWater();
    }
  }

  /**
   * Fast teleport to landmark
   */
  public teleportToDistrict(locId: string) {
    const loc = PATHEIN_LOCATIONS.find(l => l.id === locId);
    if (loc) {
      this.character.teleport(loc.position.x, loc.position.z + 5);
      sound.playInteraction();
    }
  }

  /**
   * Capture high-res screenshot of current 3D view for Photo Mode
   */
  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public setCameraFov(fov: number) {
    this.camera.fov = THREE.MathUtils.clamp(fov, 30, 85);
    this.camera.updateProjectionMatrix();
  }

  public getCameraFov(): number {
    return this.camera.fov;
  }

  private handleResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.handleResize);
    this.weatherSystem.dispose();
    sound.stopRainAudio();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
