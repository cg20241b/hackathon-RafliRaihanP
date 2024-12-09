import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Ambil elemen canvas dari HTML
const canvas = document.querySelector('#myCanvas');

// Buat scene (wadah untuk semua objek 3D)
const scene = new THREE.Scene();

// Buat kamera perspektif
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Posisi awal kamera

// Buat renderer dan hubungkan ke elemen canvas
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Tambahkan lampu ambient untuk pencahayaan dasar
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Intensitas cahaya 0.3
scene.add(ambientLight);

// Buat geometri dan material untuk central cube
const centralCubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1); // Kubus kecil
const centralCubeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 }, // Waktu untuk animasi
  },
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    void main() {
      // Glow animasi berdasarkan waktu
      float glow = abs(sin(time)) * 0.5 + 0.5;
      gl_FragColor = vec4(vec3(1.0), glow); // Warna putih dengan intensitas glow
    }
  `,
});

// Buat central cube dan tambahkan ke scene
const centralCube = new THREE.Mesh(centralCubeGeometry, centralCubeMaterial);
centralCube.position.set(0, 0, 0); // Posisi awal di tengah
scene.add(centralCube);

// Tambahkan point light pada posisi central cube
const pointLight = new THREE.PointLight(0xffffff, 10, 10); // Cahaya intens dengan radius 10
scene.add(pointLight);

// Load font dan buat teks
const fontLoader = new FontLoader();
fontLoader.load(
  "https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json",
  (font) => {
    // Material shader untuk huruf (efek plastik)
    const alphabetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: { value: centralCube.position }, // Posisi lampu
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 lightPosition;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Ambient lighting
          float ambient = 0.200 + 0.266;

          // Diffuse lighting
          vec3 lightDir = normalize(lightPosition - vPosition);
          float diffuse = max(dot(vNormal, lightDir), 0.0);

          // Specular (Plastic)
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 20.0);

          // Kombinasi warna dan pencahayaan
          vec3 color = vec3(0.674, 0.898, 0.078); // Warna #ace514
          gl_FragColor = vec4(color * (ambient + diffuse), 1.0) + vec4(color * spec, 1.0);
        }
      `,
    });

    // Buat geometri huruf dan tambahkan ke scene
    const alphabetGeometry = new TextGeometry('I', {
      font: font,
      size: 2.5, // Ukuran huruf
      height: 0.2, // Ketebalan huruf
    });
    const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
    alphabetMesh.position.set(-3, -1, 0); // Posisi di sisi kiri
    scene.add(alphabetMesh);

    // Material shader untuk angka (efek metalik)
    const digitMaterial = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: { value: centralCube.position }, // Posisi lampu
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 lightPosition;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          // Ambient lighting
          float ambient = 0.200 + 0.266;

          // Diffuse lighting
          vec3 lightDir = normalize(lightPosition - vPosition);
          float diffuse = max(dot(vNormal, lightDir), 0.0);

          // Specular (Metal)
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0);

          // Kombinasi warna dan pencahayaan
          vec3 color = vec3(0.302, 0.078, 0.898); // Warna #4D14E5
          gl_FragColor = vec4(color * (ambient + diffuse), 1.0) + vec4(vec3(1.0) * spec, 1.0);
        }
      `,
    });

    // Buat geometri angka dan tambahkan ke scene
    const digitGeometry = new TextGeometry('6', {
      font: font,
      size: 2.5, // Ukuran angka
      height: 0.2, // Ketebalan angka
    });
    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.set(1, -1, 0); // Posisi di sisi kanan
    scene.add(digitMesh);

    // Update posisi lampu setiap frame
    function updateLightPosition() {
      alphabetMaterial.uniforms.lightPosition.value.copy(centralCube.position);
      digitMaterial.uniforms.lightPosition.value.copy(centralCube.position);
    }
    renderLoopMaterials.push(updateLightPosition);
  }
);

// Event listener untuk menggerakkan kamera atau objek menggunakan keyboard
const handleKeyDown = (event) => {
  switch (event.key) {
    case 'w': centralCube.position.y += 0.1; break; // Naik
    case 's': centralCube.position.y -= 0.1; break; // Turun
    case 'q': centralCube.position.x += 0.1; break; // Gerak kanan
    case 'e': centralCube.position.x -= 0.1; break; // Gerak kiri
    case 'ArrowUp': centralCube.position.z += 0.1; break; // Ke depan
    case 'ArrowDown': centralCube.position.z -= 0.1; break; // Ke belakang
    case 'a': camera.position.x -= 0.1; break; // Kamera kiri
    case 'd': camera.position.x += 0.1; break; // Kamera kanan
    case 'ArrowRight': camera.rotation.y += Math.PI / 16; break; // Kamera rotasi kanan
    case 'ArrowLeft': camera.rotation.y -= Math.PI / 16; break; // Kamera rotasi kiri
    case 'z': camera.position.z += 0.1; break; // Kamera zoom in
    case 'x': camera.position.z -= 0.1; break; // Kamera zoom out
  }
};
window.addEventListener('keydown', handleKeyDown);

// Animasi dan render loop
function animate() {
  requestAnimationFrame(animate);

  // Update waktu untuk animasi central cube
  centralCubeMaterial.uniforms.time.value += 0.05;

  // Sinkronkan posisi lampu point light dengan central cube
  pointLight.position.copy(centralCube.position);

  // Render adegan
  renderer.render(scene, camera);
}
animate();

// Event listener untuk menangani perubahan ukuran layar
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
