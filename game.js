let scene, camera, renderer;
let gameState = 'START';
let loadedCount = 0;
const totalObjects = 5;

let bauti, dad, truck;
let interactiveItems = [];
let carriedObject = null;

let keys = {};
let truckSpeed = 0;
let truckSteering = 0;

window.onload = () => {
  initEngine();
  createEnvironment();
  createTruck();
  createCharacters();
  createFurniture();
  setupEvents();
  animate();
};

function initEngine() {
  const container = document.getElementById('canvas-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.FogExp2(0x87ceeb, 0.012);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.0);
  sunLight.position.set(40, 70, 40);
  sunLight.castShadow = true;
  scene.add(sunLight);
}

function createEnvironment() {
  const floorGeo = new THREE.PlaneGeometry(300, 300);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x557a2b, roughness: 0.8 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}

function createTruck() {
  truck = new THREE.Group();

  const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e5799, roughness: 0.4 });
  const cabGeo = new THREE.BoxGeometry(3.2, 2.4, 2.5);
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 1.4, 2.2);
  cab.castShadow = true;
  truck.add(cab);

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x154275, roughness: 0.5 });
  const bodyGeo = new THREE.BoxGeometry(3.4, 2.7, 5);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 1.5, -1);
  body.castShadow = true;
  truck.add(body);

  const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
  
  [[-1.6, 0.6, 2], [1.6, 0.6, 2], [-1.6, 0.6, -1], [1.6, 0.6, -1], [-1.6, 0.6, -2.5], [1.6, 0.6, -2.5]].forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(...pos);
    truck.add(wheel);
  });

  truck.position.set(8, 0, 0);
  scene.add(truck);
}

function createCharacters() {
  // --- BAUTI (Sprite Ilustrado 2D en mundo 3D - Idéntico al dibujo de la foto) ---
  const textureLoader = new THREE.TextureLoader();
  
  // Usamos una textura de personaje ilustrado estilizado
  const bautiTexture = textureLoader.load('https://i.imgur.com/Wb1Q9Z4.png'); 
  const bautiMat = new THREE.SpriteMaterial({ map: bautiTexture });
  
  bauti = new THREE.Sprite(bautiMat);
  bauti.scale.set(1.8, 2.4, 1); // Proporción humana real de Bauti
  bauti.position.set(0, 1.2, 5);
  scene.add(bauti);

  // --- PAPÁ ---
  const dadTexture = textureLoader.load('https://i.imgur.com/3Z6K8qJ.png');
  const dadMat = new THREE.SpriteMaterial({ map: dadTexture });
  dad = new THREE.Sprite(dadMat);
  dad.scale.set(2.0, 2.7, 1);
  dad.position.set(5, 1.35, 3);
  scene.add(dad);
}

function createFurniture() {
  const materials = {
    wood: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6 }),
    fridge: new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.4, roughness: 0.3 }),
    box: new THREE.MeshStandardMaterial({ color: 0xc29b61, roughness: 0.8 }),
    sofa: new THREE.MeshStandardMaterial({ color: 0x2b4c7e, roughness: 0.7 })
  };

  const createItem = (geo, mat, name, pos) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    scene.add(mesh);
    interactiveItems.push(mesh);
  };

  createItem(new THREE.BoxGeometry(1.1, 2.2, 1.1), materials.fridge, 'Heladera', [-6, 1.1, -2]);
  createItem(new THREE.BoxGeometry(1.5, 0.9, 1.2), materials.wood, 'Mesa de Madera', [-8, 0.45, 3]);
  createItem(new THREE.BoxGeometry(1, 1, 1), materials.box, 'Caja de Cartón', [-4, 0.5, 2]);
  createItem(new THREE.BoxGeometry(2, 0.85, 1.1), materials.sofa, 'Sofá', [-10, 0.42, -1]);
  createItem(new THREE.BoxGeometry(0.8, 0.8, 0.8), materials.box, 'Caja Chica', [-3, 0.4, 5]);
}

function setupEvents() {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyE' && gameState === 'PHASE1_LOAD') {
      handlePickupOrDrop();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  document.getElementById('btn-action').addEventListener('click', () => {
    if (gameState === 'START') {
      document.getElementById('message-screen').style.display = 'none';
      gameState = 'PHASE1_LOAD';
    } else if (gameState === 'WIN') {
      location.reload();
    }
  });
}

function handlePickupOrDrop() {
  if (carriedObject) {
    const distToTruck = bauti.position.distanceTo(truck.position.clone().add(new THREE.Vector3(0,0,-1)));
    if (distToTruck < 4) {
      carriedObject.userData.isLoaded = true;
      scene.attach(carriedObject);
      carriedObject.position.set(truck.position.x, 1.2 + (loadedCount * 0.5), truck.position.z - 1);
      carriedObject = null;
      loadedCount++;
      
      document.getElementById('hud-status').innerText = `Objetos cargados: ${loadedCount} / ${totalObjects}`;

      if (loadedCount >= totalObjects) {
        document.getElementById('hud-title').innerText = "¡Todo cargado! Sube a la cabina";
        document.getElementById('hud-controls').innerText = "Acércate al camión y presiona E para manejar";
      }
    } else {
      scene.attach(carriedObject);
      carriedObject.position.y = 0.5;
      carriedObject = null;
    }
  } else {
    if (loadedCount >= totalObjects) {
      const distToCab = bauti.position.distanceTo(truck.position.clone().add(new THREE.Vector3(0,0,2.2)));
      if (distToCab < 3) {
        startDrivingPhase();
        return;
      }
    }

    interactiveItems.forEach(item => {
      if (!item.userData.isLoaded && bauti.position.distanceTo(item.position) < 2.2) {
        carriedObject = item;
        bauti.add(carriedObject);
        carriedObject.position.set(0, 0.5, 0.2);
      }
    });
  }
}

function startDrivingPhase() {
  gameState = 'PHASE2_DRIVE';
  bauti.visible = false;
  dad.visible = false;
  document.getElementById('hud-title').innerText = "Fase 2: Conduce el Camión al Destino";
  document.getElementById('hud-status').innerText = "Ruta de flete en curso";
  document.getElementById('hud-controls').innerText = "W/S: Acelerar/Frenar | A/D: Girar el volante";
}

function updatePhase1() {
  let moveX = 0, moveZ = 0;
  if (keys['KeyW'] || keys['ArrowUp']) moveZ -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) moveZ += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

  if (moveX !== 0 || moveZ !== 0) {
    const inputVec = new THREE.Vector3(moveX, 0, moveZ).normalize();
    bauti.position.addScaledVector(inputVec, 0.12);
  }

  camera.position.set(bauti.position.x, bauti.position.y + 2, bauti.position.z + 7);
  camera.lookAt(bauti.position.x, bauti.position.y, bauti.position.z);
}

function updatePhase2() {
  if (keys['KeyW'] || keys['ArrowUp']) truckSpeed = Math.min(truckSpeed + 0.01, 0.35);
  else if (keys['KeyS'] || keys['ArrowDown']) truckSpeed = Math.max(truckSpeed - 0.01, -0.1);
  else truckSpeed *= 0.94;

  if (keys['KeyA'] || keys['ArrowLeft']) truckSteering = 0.035;
  else if (keys['KeyD'] || keys['ArrowRight']) truckSteering = -0.035;
  else truckSteering = 0;

  truck.rotation.y += truckSteering * (truckSpeed / 0.35);
  truck.translateZ(truckSpeed);

  camera.position.set(truck.position.x, truck.position.y + 5, truck.position.z - 11);
  camera.lookAt(truck.position.clone().add(new THREE.Vector3(0, 1.5, 2)));

  if (truck.position.z > 100) {
    gameState = 'WIN';
    const screen = document.getElementById('message-screen');
    document.getElementById('msg-title').innerText = "¡Mudanza Exitosa!";
    document.getElementById('msg-text').innerText = "¡Excelente trabajo Bauti y Papá! Todos los muebles llegaron perfectamente a destino.";
    document.getElementById('btn-action').innerText = "JUGAR DE NUEVO";
    screen.style.display = 'flex';
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (gameState === 'PHASE1_LOAD') updatePhase1();
  else if (gameState === 'PHASE2_DRIVE') updatePhase2();
  renderer.render(scene, camera);
}
