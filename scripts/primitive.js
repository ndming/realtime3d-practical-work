import * as THREE from 'three';
import { setupPrimitives, setupOrbitControls, setupCoordinateSystem } from './setup';

main();

function main() {
    // Render context
    const canvas = document.querySelector("canvas");
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = createCamera();
    scene.add(camera);

    // Orbit controls
    const controls = setupOrbitControls(camera, renderer.domElement, () => {});

    // Register callbacks
    window.addEventListener('resize', onResize);
    onResize();

    setupCoordinateSystem(scene);
    const meshes = setupPrimitives(scene, () => {});

    // Start the render loop
    let lastFrameTime = performance.now();
    animate(lastFrameTime);

    function animate(frameTimeMillis) {
        const deltaTimeMillis = frameTimeMillis - lastFrameTime;
        lastFrameTime = frameTimeMillis;

        for (const obj of meshes) {
            obj.mesh.rotateX(obj.seed / 50);
            obj.mesh.rotateY(obj.seed / 50);
            obj.mesh.position.y = Math.sin(frameTimeMillis / 1000 + obj.seed * 10);
        }
        controls.update(deltaTimeMillis / 1000);

        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    }

    function onResize() {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;;
        const height = canvas.clientHeight * pixelRatio | 0;

        renderer.setSize(width, height, false);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    function createCamera() {
        const fov = 45;
        const aspect = 2;
        const near = 0.1;
        const far = 200;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        return camera;
    }
}