import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const canvas = document.querySelector('#myCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5); // Starting position of the camera

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Central Cube (Light Source)
const centralCubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
const centralCubeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
  },
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    void main() {
      float glow = abs(sin(time)) * 0.5 + 0.5;
      gl_FragColor = vec4(vec3(1.0), glow);
    }
  `,
});
const centralCube = new THREE.Mesh(centralCubeGeometry, centralCubeMaterial);
centralCube.position.set(0, 0, 0);
scene.add(centralCube);

// Light source (PointLight) at the center cube's position
const pointLight = new THREE.PointLight(0xffffff, 10, 10);
scene.add(pointLight);

// Load font and create text meshes
const fontLoader = new FontLoader();
fontLoader.load(
  "https://threejs.org/examples/fonts/droid/droid_serif_regular.typeface.json",
  (font) => {
    // Alphabet ShaderMaterial (Plastic)
    const alphabetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: { value: centralCube.position },
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
          // Ambient lighting based on student ID
          float ambient = 0.200 + 0.266; // example ambient intensity

          // Diffuse lighting
          vec3 lightDir = normalize(lightPosition - vPosition);
          float diffuse = max(dot(vNormal, lightDir), 0.0);

          // Specular (Plastic)
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0); // Lower shininess for plastic

          // Combine
          vec3 color = vec3(0.674, 0.898, 0.078); // #ace514 for alphabet
          gl_FragColor = vec4(color * (ambient + diffuse), 1.0) + vec4(vec3(1.0) * spec, 1.0);
        }
      `,
    });

    // Alphabet mesh
    const alphabetGeometry = new TextGeometry('I', {
      font: font,
      size: 2.5,
      height: 0.2,
    });
    const alphabetMesh = new THREE.Mesh(alphabetGeometry, alphabetMaterial);
    alphabetMesh.position.set(-3, -1, 0); // Left side
    scene.add(alphabetMesh);

    // Digit ShaderMaterial (Metal)
    const digitMaterial = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: { value: centralCube.position },
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
          // Ambient lighting based on student ID
          float ambient = 0.200 + 0.266;

          // Diffuse lighting
          vec3 lightDir = normalize(lightPosition - vPosition);
          float diffuse = max(dot(vNormal, lightDir), 0.0);

          // Specular (Metal)
          vec3 viewDir = normalize(-vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 64.0); // Higher shininess for metal

          // Combine
          vec3 color = vec3(0.302, 0.082, 0.902); // #4D14E5 for digit
          gl_FragColor = vec4(color * (ambient + diffuse), 1.0) + vec4(color * spec, 1.0); // Specular matches the base color
        }
      `,
    });

    // Digit mesh
    const digitGeometry = new TextGeometry('6', {
      font: font,
      size: 2.5,
      height: 0.2,
    });
    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.set(1, -1, 0); // Right side
    scene.add(digitMesh);

    // Update the light position every frame
    function updateLightPosition() {
      alphabetMaterial.uniforms.lightPosition.value.copy(centralCube.position);
      digitMaterial.uniforms.lightPosition.value.copy(centralCube.position);
    }
    renderLoopMaterials.push(updateLightPosition);
  }
);

const handleKeyDown = (event) => {
  switch (event.key) {
    case 'w':
      centralCube.position.y += 0.1; // Move cube upward
      break;
    case 's':
      centralCube.position.y -= 0.1; // Move cube downward
      break;
    case 'q':
      centralCube.position.x += 0.1;
      break;
    case 'e':
      centralCube.position.x -= 0.1;
      break;
    case 'ArrowUp':
      centralCube.position.z += 0.1;
      break;
    case 'ArrowDown':
      centralCube.position.z -= 0.1;
      break;
    case 'a':
      camera.position.x -= 0.1; // Move camera left
      break;
    case 'd':
      camera.position.x += 0.1; // Move camera right
      break;
    case 'ArrowRight': // Rotate camera to the left
      camera.rotation.y += Math.PI / 16; // 90 degrees rotation (Math.PI / 2 radians)
      break;
    case 'ArrowLeft': // Rotate camera to the right
      camera.rotation.y -= Math.PI / 16; // 90 degrees rotation (Math.PI / 2 radians)
      break;
    case 'z':
      camera.position.z += 0.1;
      break;
    case 'x':
      camera.position.z -= 0.1;
  }
};
window.addEventListener('keydown', handleKeyDown);

// Render Loop
function animate() {
  requestAnimationFrame(animate);

  // Update central cube (light source) material time
  centralCubeMaterial.uniforms.time.value += 0.05;

  // Update point light position to follow the central cube
  pointLight.position.copy(centralCube.position);

  renderer.render(scene, camera);
}

animate();

// Resize event handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
