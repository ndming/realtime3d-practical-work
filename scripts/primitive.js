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

    // On-demand rendering
    let renderRequested = false;

    // Orbit controls
    const controls = setupOrbitControls(camera, renderer.domElement, requestRender);

    // Register callbacks
    window.addEventListener('resize', onResize);
    window.addEventListener('resize', requestRender);
    onResize();

    setupCoordinateSystem(scene);
    setupPrimitives(scene, requestRender);

    // Start the render loop
    render();

    function render() {
        renderRequested = false;
        controls.update();

        renderer.render(scene, camera);
    }

    function requestRender() {
        if (!renderRequested) {
            renderRequested = true;
            // Use request animation frame to avoid deadlock
            window.requestAnimationFrame(render);
        }
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