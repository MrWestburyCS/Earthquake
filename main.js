import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js";

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background
scene.fog = new THREE.FogExp2(0x87ceeb, 0.002);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 200;
controls.maxPolarAngle = Math.PI / 2;

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// Ground
const groundGeometry = new THRPlaneGeometry(500, 500, 100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
  roughness: 0.8,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// City generation
const city = new THREE.Group();
scene.add(city);

// Building materials
const buildingMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x8c8c8c, roughness: 0.7 }),
  new THREE.MeshStandardMaterial({ color: 0x6c6c6c, roughness: 0.7 }),
  new THREE.MeshStandardMaterial({ color: 0x9c9c9c, roughness: 0.7 }),
  new THREE.MeshStandardMaterial({ color: 0x7c7c7c, roughness: 0.7 }),
];

// Window material
const windowMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0x555555,
  roughness: 0.2,
  metalness: 0.8,
});

// Generate buildings
function generateCity() {
  const gridSize = 10;
  const spacing = 8;
  
  for (let x = -gridSize / 2; x < gridSize / 2; x++) {
    for (let z = -gridSize / 2; z < gridSize / 2; z++) {
      // Skip some positions to create roads
      if (x === 0 || z === 0) continue;
      
      const height = Math.random() * 15 + 5;
      const width = Math.random() * 3 + 3;
      const depth = Math.random() * 3 + 3;
      
      // Building
      const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
      const buildingMaterial = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      
      building.position.x = x * spacing;
      building.position.y = height / 2;
      building.position.z = z * spacing;
      
      building.castShadow = true;
      building.receiveShadow = true;
      
      // Add windows
      addWindowsToBuilding(building, width, height, depth);
      
      // Store original position for earthquake effect
      building.userData.originalY = height / 2;
      building.userData.originalRotation = { x: 0, y: 0, z: 0 };
      
      city.add(building);
    }
  }
}

function addWindowsToBuilding(building, width, height, depth) {
  const windowSize = 0.5;
  const windowSpacing = 1;
  
  // Windows on front and back
  for (let y = 1; y < height - 1; y += windowSpacing) {
    for (let x = -width / 2 + 1; x < width / 2; x += windowSpacing) {
      if (Math.random() > 0.3) { // Some windows are dark
        addWindow(x, y - height / 2, depth / 2 + 0.01, building);
        addWindow(x, y - height / 2, -depth / 2 - 0.01, building);
      }
    }
  }
  
  // Windows on sides
  for (let y = 1; y < height - 1; y += windowSpacing) {
    for (let z = -depth / 2 + 1; z < depth / 2; z += windowSpacing) {
      if (Math.random() > 0.3) { // Some windows are dark
        addWindow(width / 2 + 0.01, y - height / 2, z, building);
        addWindow(-width / 2 - 0.01, y - height / 2, z, building);
      }
    }
  }
}

function addWindow(x, y, z, building) {
  const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
  const window = new THREE.Mesh(windowGeometry, windowMaterial);
  window.position.set(x, y, z);
  
  // Rotate window to face outward
  if (Math.abs(z) > Math.abs(x)) {
    window.rotation.y = z > 0 ? 0 : Math.PI;
  } else {
    window.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
  }
  
  building.add(window); Particle system for dust and debris
const particles = new THREE.Group();
scene.add(particles);

function createParticleSystem(position) {
  const particleCount = 100;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = position.x + (Math.random() - 0.5) * 5;
    particlePositions[i3 + 1] = position.y + Math.random() * 2;
    particlePositions[i3 + 2] = position.z + (Math.random() - 0.5) * 5;
  }
  
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.2,
    transparent: true,
    opacity: 0.8,
  });
  
  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  particleSystem.userData.velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    particleSystem.userData.velocities.push({
      x: (Math.random() - 0.5) * 0.2,
      y: Math.random() * 0.5,
      z: (Math.random() - 0.5) * 0.2,
    });
  }
  
  particleSystem.userData.lifetime = 0;
  particleSystem.userData.maxLifetime = 100;
  
  particles.add(particleSystem);
}

// Earthquake effect
let isEarthquakeActive = false;
let earthquakeIntensity = 0;
let earthquakeDuration = 0;
const maxEarthquakeDuration = 300;

function startEarthquake() {
  if (!isEarthquakeActive) {
    isEarthquakeActive = true;
    earthquakeIntensity = 0;
    earthquakeDuration = 0;
    
    // Create ground cracks
    createGroundCracks();
  }
}

function createGroundCracks() {
  // Deform the ground to create cracks
  const positions = ground.geometry.attributes.position;
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    
    // Create a crack pattern
    if (Math.abs(x) < 20 && Math.abs(z) < 20) {
      const distance = Math.sqrt(x * x + z * z);
      if (distance < 20) {
        const y = -Math.sin(distance * 0.5) * 2;
        positions.setY(i, y);
      }
    }
  }
  
  positions.needsUpdate = true;
  ground.geometry.computeVertexNormals();
}

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update controls
  controls.update();
  
  // Update earthquake effect
  if (isEarthquakeActive) {
    earthquakeDuration++;
    
    // Ramp up and down the intensity
    if (earthquakeDuration < maxEarthquakeDuration * 0.2) {
      earthquakeIntensity = Math.min(1, earthquakeIntensity + 0.02);
    } else if (earthquakeDuration > maxEarthquakeDuration * 0.8) {
      earthquakeIntensity = Math.max(0, earthquakeIntensity - 0.02);
    }
    
    // Apply earthquake effect to buildings
    city.children.forEach((building) => {
      // Shake buildings
      building.position.y =
        building.userData.originalY +
        Math.sin(Date.now() * 0.01 + building.position.x) *
          earthquakeIntensity *
          0.5;
      
      // Tilt buildings
      building.rotation.z =
        building.userData.originalRotation.z +
        Math.sin(Date.now() * 0.005 + building.position.x) *
          earthquakeIntensity *
          0.05;
      
      // Collapse some buildings
      if (
        earthquakeDuration > 50 &&\n        M< 0.001 * earthquakeIntensity &&
        building.position.y > 0
      ) {
        building.position.y -= 0.2;
        building.rotation.z += 0.01;
        
        // Create dust particles
        if (Math.random() < 0.3) {
          createParticleSystem(building.position);
        }
      }
    });
    
    // Shake ground
    const positions = ground.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Don't shake the edges
      if (Math.abs(x) < 100 && Math.abs(z) < 100) {
        const originalY = positions.getY(i);
        const shakeAmount =
          Math.sin(Date.now() * 0.01 + x * 0.1 + z * 0.1) *
          earthquakeIntensity *
          0.2;
        positions.setY(i, originalY + shakeAmount);
      }
    }
    positions.needsUpdate = true;
    
    // End earthquake
    if (earthquakeDuration >= maxEarthquakeDuration) {
      isEarthquakeActive = false;
    }
  }
  
  // Update particles
  particles.children.forEach((particleSystem, index) => {
    const positions = particleSystem.geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      const velocity = particleSystem.userData.velocities[i];
      
      // Update position based on velocity
      positions.array[i3] += velocity.x;
      positions.array[i3 + 1] += velocity.y;
      positions.array[i3 + 2] += velocity.z;
      
      // Apply gravity
      velocity.y -= 0.01;
    }
    
    positions.needsUpdate = true;
    
    // Fade out particles
    particleSystem.userData.lifetime++;
    particleSystem.material.opacity =
      1 - particleSystem.userData.lifetime / particleSystem.userData.maxLifetime;
    
    // Remove old particle systems
    if (
      particleSystem.userData.lifetime >= particleSystem.userData.maxLifetime
    ) {
      particles.remove(particleSystem);
    }
  });
  
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard controls
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    startEarthquake();
  }
});

animate();
