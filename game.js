let scene, camera, renderer;
let gameState = 'START'; // START, PHASE1_LOAD, PHASE2_DRIVE, WIN
let loadedCount = 0;
const totalObjects = 5;

let bauti, dad, truck;
let interactiveItems = [];
let carriedObject = null;

let keys = {};
let truckSpeed = 0;
let truckSteering = 0;
let cameraAngleY = 0;
let cameraAngleX = 0.4;

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
  
  renderer = new THREE.WebGLRenderer({ antialias: false }); // Estilo Roblox sin tanto suavizado de curvas
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  container.appendChild(renderer.domElement);

  // Iluminación estilo Roblox (Colores planos y limpios)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.6);
  sunLight.position.set(30, 50, 30);
  sunLight.castShadow = true;
  scene.add(sunLight);
}

function createEnvironment() {
  // Suelo de ciudad / asfalto estilo Roblox
  const floorGeo = new THREE.PlaneGeometry(300, 300);
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Galpón / Depósito de fondo (estilo la imagen de Roblox)
  const depotMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const depotGeo = new THREE.BoxGeometry(20, 10, 25);
  const depot = new THREE.Mesh(depotGeo, depotMat);
  depot.position.set(-15, 5, -15);
  scene.add(depot);
}

function createTruck() {
  truck = new THREE.Group();

  // Camión azul estilo Roblox con caja de flete
  const cabMat = new THREE.MeshLambertMaterial({ color: 0x1b4965 });
  const cabGeo = new THREE.BoxGeometry(3, 2.4, 2.5);
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 1.4, 2);
  cab.castShadow = true;
  truck.add(cab);

  // Caja trasera azul grande
  const boxMat = new THREE.MeshLambertMaterial({ color: 0x277da1 });
  const boxGeo = new THREE.BoxGeometry(3.2, 2.7, 4.5);
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.set(0, 1.6, -1.2);
  box.castShadow = true;
  truck.add(box);

  // Ruedas estilo bloque
  const wheelGeo = new THREE.BoxGeometry(0.6, 0.8, 0.8);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const wheelPositions = [
    [-1.6, 0.4, 2], [1.6, 0.4, 2],
    [-1.6, 0.4, -1], [1.6, 0.4, -1],
    [-1.6, 0.4, -2.5], [1.6, 0.4, -2.5]
  ];
  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(...pos);
    truck.add(wheel);
  });

  truck.position.set(6, 0, 0);
  scene.add(truck);
}

function createCharacters() {
  // --- BAUTI (Estilo Roblox, buzo marrón, rulos castaños, mochila) ---
  bauti = new THREE.Group();
  
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac });
  const hoodieMat = new THREE.MeshLambertMaterial({ color: 0x6e4726 }); // Buzo marrón como en la foto
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0x111111 });  // Pantalón negro
  const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Líneas blancas del pantalón
  const backpackMat = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Mochila negra

  // Torso (Buzo marrón)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.4), hoodieMat);
  torso.position.y = 1.1;
  torso.castShadow = true;
  bauti.add(torso);

  // Mochila en la espalda
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.3), backpackMat);
  backpack.position.set(0, 1.1, -0.3);
  bauti.add(backpack);

  // Cabeza Bloque Roblox
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
  head.position.y = 1.65;
  bauti.add(head);

  // Pelo con rulos castaños medianos (bloques escalonados estilo voxel)
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x3d2314 });
  for (let x = -0.27; x <= 0.27; x += 0.13) {
    for (let z = -0.27; z <= 0.27; z += 0.13) {
      const curl = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), hairMat);
      curl.position.set(x, 1.9, z);
      bauti.add(curl);
    }
  }

  // Piernas con líneas blancas laterales
  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.35), pantsMat);
  leg1.position.set(-0.18, 0.5, 0);
  const leg2 = leg1.clone();
  leg2.position.set(0.18, 0.5, 0);
  bauti.add(leg1, leg2);

  bauti.position.set(0, 0, 4);
  scene.add(bauti);

  // --- PAPÁ ---
  dad = new THREE.Group();
  const dadShirt = new THREE.MeshLambertMaterial({ color: 0x85714d });
  const dadBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.45), dadShirt);
  dadBody.position.y = 1.2;
  dad.add(dadBody);

  const dadHead = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
  dadHead.position.y = 1.8;
  dad.add(dadHead);

  dad.position.set(4, 0, 2);
  scene.add(dad);
}

function createFurniture() {
  const materials = {
    wood: new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
    fridge: new THREE.MeshLambertMaterial({ color: 0xe0e0e0 }),
    box: new THREE.MeshLambertMaterial({ color: 0xc29b61 }),
    sofa: new THREE.MeshLambertMaterial({ color: 0x2b4c7e })
  };

  const createItem = (geo, mat, name, pos) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.castShadow = true;
    scene.add(mesh);
    interactiveItems.push(mesh);
  };

  // Muebles variados para el flete
  createItem(new THREE.BoxGeometry(1, 2.2, 1), materials.fridge, 'Heladera', [-6, 1.1, -2]);
  createItem(new THREE.BoxGeometry(1.5, 0.9, 1.2), materials.wood, 'Mesa', [-8, 0.45, 3]);
  createItem(new THREE.BoxGeometry(1, 1, 1), materials.box, 'Caja de Cartón', [-4, 0.5, 2]);
  createItem(new THREE.BoxGeometry(1.8, 0.8, 1), materials.sofa, 'Sofá', [-10, 0.4, -1]);
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
    const distToTruck = bauti.position.distanceTo(truck.position.clone().add(new THREE.Vector3(0,0,-1.2)));
    if (distToTruck < 4) {
      carriedObject.userData.isLoaded = true;
      scene.attach(carriedObject);
      carriedObject.position.set(truck.position.x, 1.2 + (loadedCount * 0.5), truck.position.z - 1.2);
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
      const distToCab = bauti.position.distanceTo(truck.position.clone().add(new THREE.Vector3(0,0,2)));
      if (distToCab < 3) {
        startDrivingPhase();
        return;
      }
    }

    interactiveItems.forEach(item => {
      if (!item.userData.isLoaded && bauti.position.distanceTo(item.position) < 2.2) {
        carriedObject = item;
        bauti.add(carriedObject);
        carriedObject.position.set(0, 1.5, 0.7);
      }
    });
  }
}

function startDrivingPhase() {
  gameState = 'PHASE2_DRIVE';
  bauti.visible = false;
  dad.visible = false;
  document.getElementById('hud-title').innerText = "Fase 2: Conduce el Camión Azul";
  document.getElementById('hud-status').innerText = "Ruta de mudanza en curso";
  document.getElementById('hud-controls').innerText = "W/S: Acelerar/Frenar | A/D: Girar volante";
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
    bauti.rotation.y = Math.atan2(inputVec.x, inputVec.z);
  }

  // Cámara en tercera persona fija siguiendo a Bauti
  camera.position.set(bauti.position.x, bauti.position.y + 4, bauti.position.z + 6);
  camera.lookAt(bauti.position.x, bauti.position.y + 1, bauti.position.z);
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

  camera.position.set(truck.position.x, truck.position.y + 4.5, truck.position.z - 10);
  camera.lookAt(truck.position.clone().add(new THREE.Vector3(0, 1.5, 2)));

  if (truck.position.z > 100) {
    gameState = 'WIN';
    const screen = document.getElementById('message-screen');
    document.getElementById('msg-title').innerText = "¡Mudanza Exitosa!";
    document.getElementById('msg-text').innerText = "¡Excelente trabajo Bauti y Papá! Entregaron todos los muebles y electrodomésticos sanos y salvos.";
    document.getElementById('btn-action').innerText = "JUGAR OTRA VEZ";
    screen.style.display = 'flex';
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (gameState === 'PHASE1_LOAD') updatePhase1();
  else if (gameState === 'PHASE2_DRIVE') updatePhase2();
  renderer.render(scene, camera);
}
