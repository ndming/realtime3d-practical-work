import * as THREE from 'three';
import GUI from 'lil-gui';
import { setupOrbitControls } from './setup';
import { initializeTextures } from './texload';
import {
    setupTelelumen,
    setupTelelumenLights,
    setupWallGUI,
    setupLightGUI,
    setupTelelumenSecondaryLights,
    setupMaterialGUI,
    setupSecondaryLightGUI,
    setupShadowGUI,
} from './telesetup';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';
import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';

main();

function main() {
    // Render context
    const canvas = document.querySelector("canvas");
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));

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
        position: new THREE.Vector3(0, -telelumenBoxHeight / 2 + 2, -6)
    }
    const telelumen = setupTelelumen(scene, telelumenBox);

    // For area light
    RectAreaLightUniformsLib.init();

    // Telelumen lights
    const ambientLightInitialState = {
        color: 0xffffff,
        intensity: 0.01,
    };
    const pointLightInitialState = {
        color: 0xffffff,
        decay: 2,
        distance: 16,
        intensity: 20,
        position: new THREE.Vector3(0, telelumenBoxHeight - 2, 0),
    };
    const directionalLightInitialState = {
        color: 0xffffff,
        intensity: 9,
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
        target: new THREE.Vector3(0, telelumenBoxHeight / 6, 0),
    };
    const hemisphereLightInitialState = {
        skyColor: 0xffffff,
        groundColor: 0xadad85,
        intensity: 2,
        position: new THREE.Vector3(0, telelumenBoxHeight - 4, 0),
    };
    const rectLightLeftInitialState = {
        color: 0xff0000,
        enabled: true,
        intensity: 5,
    };
    const rectLightRightInitialState = {
        color: 0x00ff00,
        enabled: true,
        intensity: 5,
    };
    const initialState = {
        ambient: ambientLightInitialState,
        point: pointLightInitialState,
        directional: directionalLightInitialState,
        spot: spotLightInitialState,
        hemisphere: hemisphereLightInitialState,
        rectLeft: rectLightLeftInitialState,
        rectRight: rectLightRightInitialState,
    };
    const telelumenLights = setupTelelumenLights(scene, initialState, telelumenBox);
    const secondaryLights = setupTelelumenSecondaryLights(scene, initialState, telelumenBox, telelumen.leftWall, telelumen.rightWall);

    // Material textures
    const textures = initializeTextures();

    // In situ environment maps
    const coneRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        colorSpace: THREE.SRGBColorSpace,
    });
    const coneCamera = new THREE.CubeCamera(0.1, 20, coneRenderTarget);
    coneCamera.position.copy(telelumen.cone.position);
    scene.add(coneCamera);

    const cylinderRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        colorSpace: THREE.SRGBColorSpace,
    });
    const cylinderCamera = new THREE.CubeCamera(0.1, 20, cylinderRenderTarget);
    cylinderCamera.position.copy(telelumen.cylinder.position);
    scene.add(cylinderCamera);

    const sphereRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        colorSpace: THREE.SRGBColorSpace,
    });
    const sphereCamera = new THREE.CubeCamera(0.1, 20, sphereRenderTarget);
    sphereCamera.position.copy(telelumen.sphere.position);
    scene.add(sphereCamera);

    // Outdoor environment maps
    const textureLoader = new THREE.TextureLoader();
    const soccerFieldMap = textureLoader.load('/envs/soccer_field.jpg');
    soccerFieldMap.mapping = THREE.EquirectangularReflectionMapping;
    soccerFieldMap.colorSpace = THREE.SRGBColorSpace;

    // GUI
    const gui = new GUI();
    const onNotify = () => {
        // Update in-situ maps, the order is matter here
        telelumen.cone.visible = false;
        coneCamera.update(renderer, scene);
        telelumen.cone.visible = true;

        telelumen.cylinder.visible = false;
        cylinderCamera.update(renderer, scene);
        telelumen.cylinder.visible = true;

        telelumen.sphere.visible = false;
        sphereCamera.update(renderer, scene);
        telelumen.sphere.visible = true;
        requestRender();
    }

    setupSecondaryLightGUI(gui, secondaryLights, scene, initialState, onNotify);
    setupWallGUI(gui, telelumen, secondaryLights, onNotify);
    gui.domElement.style.visibility = 'hidden';

    const group = new InteractiveGroup(renderer, camera);
    scene.add(group);

    const mesh = new HTMLMesh(gui.domElement);
    mesh.position.x = 1;
    mesh.position.y = 1.5;
    mesh.position.z = 0;
    mesh.rotation.y = -Math.PI / 2;
    mesh.scale.setScalar(4);
    group.add(mesh);

    // Start the render loop
    renderer.setAnimationLoop(render);

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