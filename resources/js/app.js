import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const host = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.1, 13.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 6.8;
controls.maxDistance = 18;
controls.target.set(0, 0, 0);

const curlPoints = [];
for (let index = 0; index <= 48; index += 1) {
    const t = index / 48;
    const angle = THREE.MathUtils.lerp(-2.45, 2.45, t);
    const radius = 3.25 - 0.6 * Math.cos(t * Math.PI * 2);
    curlPoints.push(new THREE.Vector3(
        Math.sin(angle) * radius,
        Math.cos(angle) * radius * 0.86,
        Math.sin(t * Math.PI * 3) * 0.58 + Math.cos(angle * 2) * 0.2,
    ));
}

const curlPath = new THREE.CatmullRomCurve3(curlPoints, false, 'centripetal');
const curlGeometry = new THREE.TubeGeometry(curlPath, 240, 0.74, 16, false);
const position = curlGeometry.attributes.position;
const normals = curlGeometry.attributes.normal;
const normal = new THREE.Vector3();
const vertex = new THREE.Vector3();

// Small, deterministic distortions break the perfectly manufactured tube silhouette.
for (let index = 0; index < position.count; index += 1) {
    vertex.fromBufferAttribute(position, index);
    normal.fromBufferAttribute(normals, index);
    const grain =
        Math.sin(vertex.x * 7.3 + vertex.y * 4.1) * 0.055 +
        Math.cos(vertex.y * 9.7 - vertex.z * 5.4) * 0.035 +
        Math.sin(vertex.z * 12.2 + vertex.x * 3.8) * 0.025;
    vertex.addScaledVector(normal, grain);
    position.setXYZ(index, vertex.x, vertex.y, vertex.z);
}
position.needsUpdate = true;
curlGeometry.computeVertexNormals();

const curlMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6c08,
    roughness: 0.92,
    metalness: 0,
});
const curl = new THREE.Mesh(curlGeometry, curlMaterial);
curl.rotation.set(-0.11, -0.35, 0.12);
scene.add(curl);

const keyLight = new THREE.DirectionalLight(0xffbf75, 4.4);
keyLight.position.set(-5, 6, 7);
scene.add(keyLight);

const warmFill = new THREE.PointLight(0xff4b00, 30, 20, 2);
warmFill.position.set(4, -2, 4);
scene.add(warmFill);

const coolRim = new THREE.DirectionalLight(0xffe1b0, 1.3);
coolRim.position.set(3, -5, -6);
scene.add(coolRim);

const clock = new THREE.Clock();
function render() {
    const elapsed = clock.getElapsedTime();
    curl.rotation.z = 0.12 + Math.sin(elapsed * 0.33) * 0.025;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

render();
