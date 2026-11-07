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
let cameraAngleY = 0;

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

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
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
  // --- BAUTI (Estilo 3D estilizado / No bloques rígidos) ---
  bauti = new THREE.Group();
  
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.6 });
  const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.7 }); // Buzo marrón
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.7 });  // Pantalón negro
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Líneas blancas
  const backpackMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }); // Mochila

  // Torso (Buzo marrón con volumen suave)
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.0, 12), hoodieMat);
  torso.position.y = 1.1;
  torso.castShadow = true;
  bauti.add(torso);

  // Mochila en la espalda
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), backpackMat);
  backpack.position.set(0, 1.15, -0.28);
  bauti.add(backpack);

  // Cabeza redondeada estilizada
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), skinMat);
  head.position.y = 1.85;
  head.castShadow = true;
  bauti.add(head);

  // Pelo con rulos castaños medianos con volumen (esferas y cúpulas suaves)
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
  for (let i = 0; i < 20; i++) {
    const curl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09), hairMat);
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 0.45;
    curl.position.set(
      0.28 * Math.sin(v) * Math.cos(u),
      1.92 + 0.16 * Math.cos(v),
      0.28 * Math.sin(v) * Math.sin(u)
    );
    bauti.add(curl);
  }

  // Piernas estilizadas con líneas blancas
  const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.75, 8), pantsMat);
  leg1.position.set(-0.16, 0.38, 0);
  const leg2 = leg1.clone();
  leg2.position.set(0.16, 0.38, 0);
  
  // Líneas blancas laterales en los pantalones
  const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.75, 0.13), stripeMat);
  stripe1.position.set(-0.22, 0.38, 0);
  const stripe2 = stripe1.clone();
  stripe2.position.set(0.22, 0.38, 0);

  bauti.add(leg1, leg2, stripe1, stripe2);
  bauti.position.set(0, 0, 5);
  scene.add(bauti);

  // --- PAPÁ ---
  dad = new THREE.Group();
  const dadShirt = new THREE.MeshStandardMaterial({ color: 0x85714d });
  const dadBody = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.3, 12), dadShirt);
  dadBody.position.y = 1.3;
  dad.add(dadBody);

  const dadHead = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), skinMat);
  dadHead.position.y = 2.15;
  dad.add(dadHead);

  dad.position.set(5, 0, 3);
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
        carriedObject.position.set(0, 1.6, 0.7);
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
    bauti.rotation.y = Math.atan2(inputVec.x, inputVec.z);
  }

  camera.position.set(bauti.position.x, bauti.position.y + 4.5, bauti.position.z + 7);
  camera.lookAt(bauti.position.x, bauti.position.y + 1.2, bauti.position.z);
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
