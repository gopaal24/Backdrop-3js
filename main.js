
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("gainsboro");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 50);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const ambientLight = new THREE.AmbientLight("white", 0.5);
scene.add(ambientLight);

const light = new THREE.DirectionalLight("white", 0.5);
light.position.set(1, 1, 1);
scene.add(light);

function getPageGeometry(plane1_len=25, plane2_len=10, angle=180, curve_len=5, curve_segments=25, width=50) {
  const geometry = new THREE.BufferGeometry();

  const indices = [];
  const vertices = [];

  const angle_in_radians = (angle * Math.PI) / 180;

  const length_segment_count = 10;
  const length_segment_size = width / length_segment_count;

  const length_curved_part = curve_len * (Math.PI / 2 - angle_in_radians);
  const curved_part_segment_size =
  length_curved_part / curve_segments;

  let x, y, z, l, c, s;

  const flat_part_segment_count = 5;
  const flat_part_segment_size = plane1_len / flat_part_segment_count;
  const z_start = plane1_len;
  const y_start = 0;

  const flat_part_segment_count_ = 5;
  const flat_part_segment_size_ = plane2_len / flat_part_segment_count_;

 

  for (let i = 0; i <= flat_part_segment_count; i++) {
    l = i * flat_part_segment_size;
    z = z_start - l * 1;
    y = y_start;

    for (let j = 0; j <= length_segment_count; j++) {
      x = j * length_segment_size - width / 2;

      vertices.push(x, y, z);
    }
  }

  for (let i = 0; i <= curve_segments; i++) {
    l = (i * curved_part_segment_size) / curve_len;
    c = Math.cos(l);
    s = Math.sin(l);
    y = curve_len * (1 - c);
    z = curve_len * s;

    for (let j = 0; j <= length_segment_count; j++) {
      x = j * length_segment_size - width / 2;

      vertices.push(x, y, z);
    }
  }

  const z_start_ = z;
  const y_start_ = y;

  for (let i = 1; i <= flat_part_segment_count_; i++) {
    l = i * flat_part_segment_size_;
    z = z_start_ - l * c;
    y = y_start_ - l * s;

    for (let j = 0; j <= length_segment_count; j++) {
      x = j * length_segment_size - width / 2;

      vertices.push(x, y, z);
    }
  }

  const width_segment_count =
    curve_segments +
    flat_part_segment_count +
    flat_part_segment_count_;
  for (let i = 0; i < width_segment_count; i++) {
    for (let j = 0; j < length_segment_count; j++) {
      const a = i * (length_segment_count + 1) + (j + 1);
      const b = i * (length_segment_count + 1) + j;
      const c = (i + 1) * (length_segment_count + 1) + j;
      const d = (i + 1) * (length_segment_count + 1) + (j + 1);

      indices.push(b, d, c);
      indices.push(a, d, b);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  return geometry;
}

const controls = new OrbitControls(camera, renderer.domElement);

const material = new THREE.MeshStandardMaterial({
  color: 0x80ff00,
  transparent: false,
  // side: THREE.DoubleSide,
  wireframe: true
});

let mesh = new THREE.Mesh(getPageGeometry(), material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

let plane_prop = {
    plane1_len: 25,
    plane2_len: 10,
    angle: 180,
    curve_len: 5,
    curve_segments: 25,
    width: 50,
  };


  const updateMesh = (updatedProp) => {
	plane_prop = {...plane_prop, ...updatedProp};
	console.log(plane_prop)
	mesh.geometry.dispose()
	mesh.geometry = getPageGeometry(plane_prop.plane1_len, 
		plane_prop.plane2_len, 
		plane_prop.angle, 
		plane_prop.curve_len, 
		plane_prop.curve_segments, 
		plane_prop.width)
	mesh.geometry.needsUpdate = true;
  }

  let gui = new GUI();
  gui
    .add(plane_prop, "plane1_len")
    .min(1)
    .max(30)
	.step(1)
    .onChange((value) => updateMesh({plane1_len:value}))
  gui.add(plane_prop, "plane2_len").min(1).max(30).step(1).onChange((value) => updateMesh({plane2_len:value}))
  gui.add(plane_prop, "angle").min(0).max(360).step(1).onChange((value) => updateMesh({angle:value}))
  gui.add(plane_prop, "curve_len").min(1).max(30).step(1).onChange((value) => updateMesh({curve_len:value}));
  gui.add(plane_prop, "curve_segments").min(1).max(60).step(1).onChange((value) => updateMesh({curve_segments:value}));
  gui.add(plane_prop, "width").min(1).max(100).step(1).onChange((value) => updateMesh({width:value}));

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
