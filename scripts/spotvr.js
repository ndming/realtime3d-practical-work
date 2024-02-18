import * as THREE from 'three';
import { setupOrbitControls, setupCoordinateSystem } from './setup';
import { 
    makeThigh, makeLeg, makeTorso, makeForearm, makeArm, makeWrist, 
    makePalm, makeGrip, makeThighWalkCycle, makeLegWalkCycle, makeTorsoWalkCycle,
    makeThighJumpAction, makeLegJumpAction, makeTorsoJumpAction,
    makeThighFrontDoggyAction, makeThighBackDoggyAction, makeTorsoDoggyAction,
    makeLegFrontDoggyAction, makeLegBackDoggyAction,
    makeThighFrontDonkeyAction, makeThighBackDonkeyAction, makeTorsoDonkeyAction,
    makeLegFrontDonkeyAction, makeLegBackDonkeyAction,
    makeGripAAction, makeGripBAction
} from './spotmake';
import { VRButton } from 'three/addons/webxr/VRButton.js';

main();

function main() {
    // Render context
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setClearColor(0x00111a);
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = createCamera();
    scene.add(camera);

    // Orbit controls
    const controls = setupOrbitControls(camera, canvas);

    // Register callbacks
    window.addEventListener('resize', onResize);
    onResize();

    // Set up a basic scene
    const world = setupCoordinateSystem(scene);
    const lightA = new THREE.PointLight(0xffffff, 50, 20);
    const lightB = new THREE.PointLight(0xffffff, 50, 20);
    lightA.position.set(4, 4, 4);
    lightB.position.set(-3, 5, -3);
    scene.add(lightA);
    scene.add(lightB);

    // Limbs
    const thighA1 = makeThigh();
    thighA1.position.set(-2, 0, 1.5);
    const legA1 = makeLeg();
    legA1.position.set(0, -6 * 0.25, 0);
    thighA1.add(legA1);

    const thighA2 = makeThigh();
    thighA2.position.set(2, 0, -0.5);
    const legA2 = makeLeg();
    legA2.position.set(0, -6 * 0.25, 0);
    thighA2.add(legA2);

    const thighAWalkCycle = makeThighWalkCycle([thighA1, thighA2]);
    thighAWalkCycle.action.play();
    thighAWalkCycle.mixer.update(0.25);
    thighAWalkCycle.action.paused = true;

    const legAWalkCycle = makeLegWalkCycle([legA1, legA2]);
    legAWalkCycle.action.play();
    legAWalkCycle.mixer.update(0.25);
    legAWalkCycle.action.paused = true;

    const thighB1 = makeThigh();
    thighB1.position.set(-2, 0, -0.5);
    const legB1 = makeLeg();
    legB1.position.set(0, -6 * 0.25, 0);
    thighB1.add(legB1);

    const thighB2 = makeThigh();
    thighB2.position.set(2, 0, 1.5);
    const legB2 = makeLeg();
    legB2.position.set(0, -6 * 0.25, 0);
    thighB2.add(legB2);

    // Forearm
    const forearm = makeForearm();
    forearm.position.set(-2, 0.65, 0.4);
    forearm.rotation.z = Math.PI / 4;

    // Arm
    const arm = makeArm();
    arm.rotation.z = Math.PI / 2;
    arm.position.set(1.5, 0, 0);
    forearm.add(arm);

    // Wrist
    const wrist = makeWrist();
    wrist.position.set(1.5, 0, 0);
    wrist.rotateZ(Math.PI / 4);
    arm.add(wrist);

    // Palm
    const palm = makePalm();
    palm.rotateZ(Math.PI / 2);
    palm.position.set(0.175, 0, 0.075);
    wrist.add(palm);

    // Grip
    const { gripA, gripB } = makeGrip();
    gripA.position.set(0, -0.05, -0.075);
    gripB.position.set(0, -0.05, -0.075);
    gripA.rotateZ(THREE.MathUtils.degToRad(-30));
    gripB.rotateZ(THREE.MathUtils.degToRad(-150));
    palm.add(gripA);
    palm.add(gripB);

    // Torso
    const spotGlobalPosition = new THREE.Vector3(1.5, 2, -6);
    const torso = makeTorso();
    torso.position.set(spotGlobalPosition);
    torso.add(thighA1);
    torso.add(thighA2);
    torso.add(thighB1);
    torso.add(thighB2);
    torso.add(forearm);
    scene.add(torso);

    // Jump actions
    const thighJumpAction = makeThighJumpAction([thighA1, thighA2, thighB1, thighB2]);
    const legJumpAction = makeLegJumpAction([legA1, legA2, legB1, legB2]);
    const torsoJumpAction = makeTorsoJumpAction([torso], spotGlobalPosition);
    const jumpActions = [torsoJumpAction, thighJumpAction, legJumpAction];

    jumpActions.forEach((anim) => {
        anim.action.setLoop(THREE.LoopRepeat);
        anim.action.play(); 
    });

    // Start the render loop
    let lastFrameTime = performance.now();
    renderer.setAnimationLoop(animate);

    function animate(frameTimeMillis) {
        const deltaTimeMillis = frameTimeMillis - lastFrameTime;
        lastFrameTime = frameTimeMillis;

        // Jump animation
        jumpActions.forEach((anim) => { anim.mixer.update(deltaTimeMillis / 1000); });

        controls.update(deltaTimeMillis / 1000);

        renderer.render(scene, camera);
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
        camera.position.set(8, 8, 8);

        return camera;
    }
}

