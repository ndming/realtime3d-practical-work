import * as THREE from 'three';
import GUI from 'lil-gui';
import { setupOrbitControls } from './setup';
import { initializeTextures } from './texload';
import {
    setupTelelumen,
    setupTelelumenLights,
    setupWallGUI,
    setupLightGUI,
    setupMaterialGUI,
} from './telesetup';

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
        intensity: 0.05,
    };
    const pointLightInitialState = {
        color: 0xffffff,
        decay: 2,
        distance: 16,
        intensity: 20,
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

    // Material textures
    const textures = initializeTextures();

    // In situ environment map
    const coneRenderTarget = new THREE.WebGLCubeRenderTarget(256, { 
        generateMipmaps: true, 
        minFilter: THREE.LinearMipmapLinearFilter,
        colorSpace: THREE.SRGBColorSpace,
    });
    const coneCamera = new THREE.CubeCamera(0.1, 20, coneRenderTarget);
    coneCamera.position.copy(telelumen.cone.position);
    scene.add(coneCamera);

    // Outdoor environment map
    const textureLoader = new THREE.TextureLoader();
    const soccerFieldMap = textureLoader.load('/envs/soccer_field.jpg');
    soccerFieldMap.mapping = THREE.EquirectangularReflectionMapping;
    soccerFieldMap.colorSpace = THREE.SRGBColorSpace;

    // GUI
    const gui = new GUI();
    gui.onChange(() => {
        telelumen.cone.visible = false;
        coneCamera.update(renderer, scene);

        telelumen.cone.visible = true;
        requestRender();
    });

    setupLightGUI(gui, telelumenLights, scene, initialState, telelumenBox);
    setupMaterialGUI(
        gui, telelumen.cone, telelumen.cylinder, telelumen.sphere, textures, {
        cone: {
            None: null,
            InSitu: coneRenderTarget.texture,
            SoccerField: soccerFieldMap,
        }
    });
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