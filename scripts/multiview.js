import * as THREE from 'three';
import GUI from 'lil-gui';
import { 
    setupPrimitives, setupOrbitControls, setupCoordinateSystem, 
    setupFlyControls, setupBallControls, setupFirstPersonControls
} from './setup';

main();

function main() {
    // Render context
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    // Scenes
    const orthoScene = new THREE.Scene();
    const perspScene = new THREE.Scene();

    // Cameras
    const orthoCamera = createOrthographicCamera();
    const perspCamera = createPerspectiveCamera();
    orthoScene.add(orthoCamera)
    perspScene.add(perspCamera);

    // Orbit controls
    const orbitOrthoControls = setupOrbitControls(orthoCamera, document.querySelector("#orthographic"), requestRender);
    const orbitPerspControls = setupOrbitControls(perspCamera, document.querySelector("#perspective"), requestRender);

    const flyOrthoControls = setupFlyControls(orthoCamera, document.querySelector("#orthographic"), requestRender);
    const flyPerspControls = setupFlyControls(perspCamera, document.querySelector("#perspective"), requestRender);

    const ballOrthoControls = setupBallControls(orthoCamera, document.querySelector("#orthographic"), requestRender);
    const ballPerspControls = setupBallControls(perspCamera, document.querySelector("#perspective"), requestRender);

    const personOrthoControls = setupFirstPersonControls(orthoCamera, document.querySelector("#orthographic"), requestRender);
    const personPerspControls = setupFirstPersonControls(perspCamera, document.querySelector("#perspective"), requestRender);

    const views = [
        { scene: perspScene, camera: perspCamera, elem: document.querySelector("#perspective"), controls: orbitPerspControls },
        { scene: orthoScene, camera: orthoCamera, elem: document.querySelector("#orthographic"), controls: orbitOrthoControls },
    ];

    // On-demand rendering
    let renderRequested = false;
    let onDemandRendering = true;

    // Register callbacks
    window.addEventListener('resize', onResize);
    window.addEventListener('resize', requestRender);
    onResize();

    // Set up a basic scene
    setupCoordinateSystem(orthoScene);
    setupCoordinateSystem(perspScene);
    setupPrimitives(orthoScene, requestRender);
    setupPrimitives(perspScene, requestRender);

    // Controls
    const gui = new GUI();
    const perspectiveControls = {
        Orbit: orbitPerspControls,
        Fly: flyPerspControls,
        Trackball: ballPerspControls,
        FirstPerson: personPerspControls,
    };
    const orthographicControls = {
        Orbit: orbitOrthoControls,
        Fly: flyOrthoControls,
        Trackball: ballOrthoControls,
        FirstPerson: personOrthoControls,
    }
    gui.add(views[0], 'controls', perspectiveControls).name("Perspective Control").onChange((control) => {
        if (control === personPerspControls) {
            perspCamera.position.set(2, 2, 2);
            onDemandRendering = false;
        } else {
            perspCamera.position.set(10, 10, 10);
            if (views[1].controls !== personOrthoControls) {
                onDemandRendering = true;
            }
        }
        requestRender();
    });
    gui.add(views[1], 'controls', orthographicControls).name("Orthographic Control").onChange((control) => {
        if (control === personOrthoControls) {
            orthoCamera.position.set(2, 2, 2);
            onDemandRendering = false;
        } else {
            orthoCamera.position.set(10, 10, 10);
            if (views[0].controls !== personPerspControls) {
                onDemandRendering = true;
            }
        }
        requestRender();
    });

    // Start the render loop
    let lastFrameTime = performance.now();
    render(lastFrameTime);

    function render(frameTimeMillis) {
        const deltaTimeMillis = frameTimeMillis - lastFrameTime;
        lastFrameTime = frameTimeMillis;

        renderRequested = false;

        views.forEach((view) => {
            view.controls.update(deltaTimeMillis / 1000);
            renderView(view); 
        });

        if (!onDemandRendering) {
            requestRender();
        }
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

        views.forEach((view) => { 
            const rect = view.elem.getBoundingClientRect();
            view.camera.aspect = (rect.width * pixelRatio | 0) / (rect.height * pixelRatio | 0);
            view.camera.updateProjectionMatrix();
        });

        personOrthoControls.handleResize();
        personPerspControls.handleResize();
    }

    function createPerspectiveCamera() {
        const fov = 45;
        const aspect = 2;
        const near = 0.1;
        const far = 200;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    function createOrthographicCamera() {
        const left = -6;
        const right = 6;
        const top = 6;
        const bottom = -6;
        const near = 0.1;
        const far = 200;
        const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        camera.position.set(10, 10, 10);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    function renderView(view) {
        const {left, right, top, bottom, width, height} = view.elem.getBoundingClientRect();

        const pixelRatio = window.devicePixelRatio;
        const w = Math.round(width * pixelRatio | 0);
        const h = Math.round(height * pixelRatio | 0);
        const x = Math.round(left * pixelRatio | 0);
        const y = Math.round((renderer.domElement.clientHeight - bottom) * pixelRatio | 0);

        renderer.setScissor(x, y, w, h);
        renderer.setScissorTest(true);

        renderer.setViewport(x, y, w, h);
        renderer.render(view.scene, view.camera);

        renderer.setScissorTest(false);
    }
}