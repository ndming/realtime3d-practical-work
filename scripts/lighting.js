import * as THREE from 'three';
import { setupOrbitControls } from './setup';
import {
    setupTelelumen,
    setupTelelumenLights,
    setupWallGUI,
    setupLightGUI,
} from './telesetup';
import GUI from 'lil-gui';

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

    // The Telelumen box
    const telelumenBoxWidth = 14;
    const telelumenBoxHeight = 12;
    const telelumenBoxDepth = 8;
    const telelumenBox = {
        width: telelumenBoxWidth,
        height: telelumenBoxHeight,
        depth: telelumenBoxDepth,
        position: new THREE.Vector3(0, -telelumenBoxHeight / 2, 0)
    }
    const telelumen = setupTelelumen(scene, telelumenBox);

    // Telelumen lights
    const ambientLightInitialState = {
        color: 0xffffff,
        intensity: 2,
    };
    const pointLightInitialState = {
        color: 0xffffff,
        decay: 2,
        distance: 16,
        intensity: 40,
        position: new THREE.Vector3(0, telelumenBoxHeight - 4, 0),
    };
    const directionalLightInitialState = {
        color: 0xffffff,
        intensity: 40,
        position: new THREE.Vector3(0, telelumenBoxHeight - 1, 0),
        dirPhi: 0,
        dirTheta: -Math.PI / 2
    };
    const spotLightInitialState = {
        color: 0xffffff,
        intensity: 40,
        distance: 16,
        angle: Math.PI / 4,
        penumbra: 0.2,
        decay: 2,
        position: new THREE.Vector3(0, telelumenBoxHeight - 1, 0),
        dirPhi: 0,
        dirTheta: Math.PI
    };
    const hemisphereLightInitialState = {
        skyColor: 0xffffff,
        groundColor: 0xadad85,
        intensity: 2,
        position: new THREE.Vector3(0, telelumenBoxHeight - 4, 0),
    };
    const initialState = {
        ambient: ambientLightInitialState,
        point: pointLightInitialState,
        directional: directionalLightInitialState,
        spot: spotLightInitialState,
        hemisphere: hemisphereLightInitialState,
    };
    const telelumenLights = setupTelelumenLights(scene, initialState, telelumenBox);

    const gui = new GUI();
    gui.onChange(_ => { requestRender(); });
    setupLightGUI(gui, telelumenLights, scene, initialState, telelumenBox);
    setupWallGUI(gui, telelumen);

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
            window.requestAnimationFrame(render);
        }
    }

    function onResize() {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
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
        camera.position.set(0, 0, 20);

        return camera;
    }
}