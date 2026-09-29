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

const curlMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6c08,
    roughness: 0.92,
    metalness: 0,
});
const curl = new THREE.Group();

// A single, gently crooked curl reads more like a snack than a near-closed ring.
const curlPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.25, -0.18, -0.12),
    new THREE.Vector3(-2.75, 0.55, 0.02),
    new THREE.Vector3(-1.72, 0.91, 0.18),
    new THREE.Vector3(-0.72, 0.78, 0.06),
    new THREE.Vector3(0.05, 0.25, -0.2),
    new THREE.Vector3(0.92, 0.04, -0.08),
    new THREE.Vector3(1.8, 0.39, 0.22),
    new THREE.Vector3(2.72, 0.8, 0.1),
    new THREE.Vector3(3.3, 0.57, -0.08),
], false, 'centripetal');

const snackRadius = 0.68;
const curlGeometry = new THREE.TubeGeometry(curlPath, 200, snackRadius, 24, false);
const positions = curlGeometry.attributes.position;
const normals = curlGeometry.attributes.normal;
const normal = new THREE.Vector3();
const vertex = new THREE.Vector3();

// Subtle surface waviness gives the extrusion an irregular, crunchy silhouette.
for (let index = 0; index < positions.count; index += 1) {
    vertex.fromBufferAttribute(positions, index);
    normal.fromBufferAttribute(normals, index);
    const grain =
        Math.sin(vertex.x * 8.1 + vertex.y * 5.2 + vertex.z * 3.1) * 0.045 +
        Math.cos(vertex.y * 10.4 - vertex.z * 6.8) * 0.03 +
        Math.sin(vertex.z * 13.2 + vertex.x * 4.6) * 0.022;
    vertex.addScaledVector(normal, grain);
    positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
}
positions.needsUpdate = true;
curlGeometry.computeVertexNormals();

curl.add(new THREE.Mesh(curlGeometry, curlMaterial));

// Round caps close the tube while keeping each tip soft and snack-like.
const capGeometry = new THREE.SphereGeometry(snackRadius, 24, 16);
for (const endpoint of [0, 1]) {
    const cap = new THREE.Mesh(capGeometry, curlMaterial);
    cap.position.copy(curlPath.getPointAt(endpoint));
    curl.add(cap);
}

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
