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
} from './spotmake'

main();

function main() {
    // Render context
    const canvas = document.querySelector("#c");
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setClearColor(0x00111a);

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = createCamera();
    scene.add(camera);

    // Orbit controls
    const controls = setupOrbitControls(camera, document.querySelector("#overlay"));

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
    const spotGlobalPosition = new THREE.Vector3(1.5, 2, 2);
    const torso = makeTorso();
    torso.position.set(spotGlobalPosition);
    torso.add(thighA1);
    torso.add(thighA2);
    torso.add(thighB1);
    torso.add(thighB2);
    torso.add(forearm);
    scene.add(torso);

    // Walk cycles
    const thighBWalkCycle = makeThighWalkCycle([thighB1, thighB2]);
    thighBWalkCycle.action.play();
    thighBWalkCycle.mixer.update(0.75);
    thighBWalkCycle.action.paused = true;

    const legBWalkCycle = makeLegWalkCycle([legB1, legB2]);
    legBWalkCycle.action.play();
    legBWalkCycle.mixer.update(0.75);
    legBWalkCycle.action.paused = true;

    const torsoWalkCycle = makeTorsoWalkCycle([torso], spotGlobalPosition);
    torsoWalkCycle.action.play();
    torsoWalkCycle.mixer.update(0.25);
    torsoWalkCycle.action.paused = true;

    // Walking states
    let advancing = false;
    let retreating = false;
    const walkCycles = [thighAWalkCycle, legAWalkCycle, thighBWalkCycle, legBWalkCycle, torsoWalkCycle];

    // Forearm states
    let forearmRotatingP = false;
    let forearmRotatingN = false;
    const forearmMaxRad = THREE.MathUtils.degToRad(170);
    const forearmMinRad = THREE.MathUtils.degToRad(10);

    // Arm states
    let armRotatingP = false;
    let armRotatingN = false;
    const armMaxRad = THREE.MathUtils.degToRad(100);
    const armMinRad = THREE.MathUtils.degToRad(5);

    // Wrist states
    let wristRotatingP = false;
    let wristRotatingN = false;
    const wristMaxRad = THREE.MathUtils.degToRad(90);
    const wristMinRad = THREE.MathUtils.degToRad(-45);

    // Palm states
    let palmRotatingL = false;
    let palmRotatingR = false;

    // Jump actions
    let jumpped = false;
    const thighJumpAction = makeThighJumpAction([thighA1, thighA2, thighB1, thighB2]);
    const legJumpAction = makeLegJumpAction([legA1, legA2, legB1, legB2]);
    const torsoJumpAction = makeTorsoJumpAction([torso], spotGlobalPosition);
    torsoJumpAction.mixer.addEventListener('finished', (e) => { jumpped = false });
    const jumpActions = [torsoJumpAction, thighJumpAction, legJumpAction];

    // Grip states
    const gripDurationSeconds = 0.5;
    const gripAAction = makeGripAAction([gripA], gripDurationSeconds);
    const gripBAction = makeGripBAction([gripB], gripDurationSeconds);
    const gripActions = [gripAAction, gripBAction];

    // Doggy states
    const doggyDurationSeconds = 0.5;
    const thighFrontDoggyAction = makeThighFrontDoggyAction([thighA1, thighB1], doggyDurationSeconds);
    const thighBackDoggyAction = makeThighBackDoggyAction([thighA2, thighB2], doggyDurationSeconds);
    const legFrontDoggyAction = makeLegFrontDoggyAction([legA1, legB1], doggyDurationSeconds);
    const legBackDoggyAction = makeLegBackDoggyAction([legA2, legB2], doggyDurationSeconds);
    const torsoDoggyAction = makeTorsoDoggyAction([torso], doggyDurationSeconds);
    const doggyActions = [torsoDoggyAction, thighFrontDoggyAction, thighBackDoggyAction, legFrontDoggyAction, legBackDoggyAction];

    // Donkey states
    const donkeyDurationSeconds = 0.5;
    const thighFrontDonkeyAction = makeThighFrontDonkeyAction([thighA1, thighB1], donkeyDurationSeconds);
    const thighBackDonkeyAction = makeThighBackDonkeyAction([thighA2, thighB2], donkeyDurationSeconds);
    const legFrontDonkeyAction = makeLegFrontDonkeyAction([legA1, legB1], donkeyDurationSeconds);
    const legBackDonkeyAction = makeLegBackDonkeyAction([legA2, legB2], donkeyDurationSeconds);
    const torsoDonkeyAction = makeTorsoDonkeyAction([torso], donkeyDurationSeconds);
    const donkeyActions = [torsoDonkeyAction, thighFrontDonkeyAction, thighBackDonkeyAction, legFrontDonkeyAction, legBackDonkeyAction];

    // Callbacks
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w') {
            walkCycles.forEach((cycle) => { cycle.action.paused = false; });
            advancing = true;
        } else if (event.key === 's') {
            walkCycles.forEach((cycle) => { cycle.action.paused = false; });
            retreating = true;
        } else if (event.key === 'e') {
            gripActions.forEach((anim) => {
                anim.action.timeScale = 1;
                // Animate from the last keyframe
                const time = anim.action.time;
                anim.action.reset();
                anim.action.time = time;
                anim.action.play();
            });
        } else if (event.code === "ShiftLeft") {
            forearmRotatingP = true;
        } else if (event.code === "ControlLeft") {
            forearmRotatingN = true;
        } else if (event.key === "PageUp") {
            armRotatingP = true;
        } else if (event.key === "PageDown") {
            armRotatingN = true;
        } else if (event.key === "ArrowUp") {
            wristRotatingP = true;
        } else if (event.key === "ArrowDown") {
            wristRotatingN = true;
        } else if (event.key === "ArrowLeft") {
            palmRotatingL = true;
        } else if (event.key === "ArrowRight") {
            palmRotatingR = true;
        } else if (event.key === " ") {
            if (jumpped)
                return;
            jumpped = true;
            jumpActions.forEach((anim) => {
                anim.action.reset();
                anim.action.play(); 
            });
        } else if (event.key === "5") {
            if (jumpped || advancing || retreating)
                return;
            doggyActions.forEach((anim) => {
                anim.action.timeScale = 1;
                // Animate from the last keyframe
                const time = anim.action.time;
                anim.action.reset();
                anim.action.time = time;
                anim.action.play();
            });
        } else if (event.key === "8") {
            if (jumpped || advancing || retreating)
                return;
            donkeyActions.forEach((anim) => {
                anim.action.timeScale = 1;
                // Animate from the last keyframe
                const time = anim.action.time;
                anim.action.reset();
                anim.action.time = time;
                anim.action.play();
            });
        }
    });

    document.addEventListener('keyup', (event) => {
        if (event.key === 'w') {
            walkCycles.forEach((cycle) => { cycle.action.paused = true; });
            advancing = false;
            console.log(torso.position);
        } else if (event.key === 's') {
            walkCycles.forEach((cycle) => { cycle.action.paused = true; });
            retreating = false;
        } else if (event.key === 'e') {
            gripActions.forEach((anim) => {
                anim.action.timeScale = -1;
                // Animate from the last keyframe
                const time = anim.action.time;
                anim.action.reset();
                anim.action.time = time - gripDurationSeconds;
                anim.action.play();
            });
        } else if (event.code === "ShiftLeft") {
            forearmRotatingP = false; 
        } else if (event.code === "ControlLeft") {
            forearmRotatingN = false;
        } else if (event.key === "PageUp") {
            armRotatingP = false;
        } else if (event.key === "PageDown") {
            armRotatingN = false;
        } else if (event.key === "ArrowUp") {
            wristRotatingP = false;
        } else if (event.key === "ArrowDown") {
            wristRotatingN = false;
        } else if (event.key === "ArrowLeft") {
            palmRotatingL = false;
        } else if (event.key === "ArrowRight") {
            palmRotatingR = false;
        } else if (event.key === "5") {
            doggyActions.forEach((anim) => {
                anim.action.timeScale = -1;
                // Animate from the last keyframe
                const time = anim.action.time;
                anim.action.reset();
                anim.action.time = time - doggyDurationSeconds;
                anim.action.play();
            });
        } else if (event.key === "8") {
            donkeyActions.forEach((anim) => {
                anim.action.timeScale = -1;
                // Animate from the last keyframe
                const time = anim.action.time;
                anim.action.reset();
                anim.action.time = time - donkeyDurationSeconds;
                anim.action.play();
            });
        }
    });

    // Start the render loop
    let lastFrameTime = performance.now();
    const rotationSpeed = 0.002;
    animate(lastFrameTime);

    function animate(frameTimeMillis) {
        const deltaTimeMillis = frameTimeMillis - lastFrameTime;
        lastFrameTime = frameTimeMillis;

        // Walk animation
        walkCycles.forEach((cycle) => { cycle.mixer.update(deltaTimeMillis / 1000); });
        if (advancing && world.position.z < 50) {
            world.position.x += deltaTimeMillis / 300;
        } else if (retreating && world.position.z > -50) {
            world.position.x -= deltaTimeMillis / 300;
        }

        // Jump animation
        jumpActions.forEach((anim) => { anim.mixer.update(deltaTimeMillis / 1000); });

        // Doggy/donkey animation
        doggyActions.forEach((anim) => { anim.mixer.update(deltaTimeMillis / 1000); });
        donkeyActions.forEach((anim) => { anim.mixer.update(deltaTimeMillis / 1000); });

        // Forearm motions
        if (forearmRotatingP && forearm.rotation.z < forearmMaxRad) {
            forearm.rotation.z += deltaTimeMillis * rotationSpeed;
        } 
        if (forearmRotatingN && forearm.rotation.z > forearmMinRad) {
            forearm.rotation.z -= deltaTimeMillis * rotationSpeed;
        }

        // Arm motions
        if (armRotatingP && arm.rotation.z < armMaxRad) {
            arm.rotation.z += deltaTimeMillis * rotationSpeed;
        } 
        if (armRotatingN && arm.rotation.z > armMinRad) {
            arm.rotation.z -= deltaTimeMillis * rotationSpeed;
        }

        // Grip animation
        gripActions.forEach((anim) => { anim.mixer.update(deltaTimeMillis / 1000); });

        // Wrist motions
        if (wristRotatingP && wrist.rotation.z < wristMaxRad) {
            wrist.rotation.z += deltaTimeMillis * rotationSpeed;
        }
        if (wristRotatingN && wrist.rotation.z > wristMinRad) {
            wrist.rotation.z -= deltaTimeMillis * rotationSpeed;
        }

        // Palm motions
        if (palmRotatingL) {
            palm.rotation.x -= deltaTimeMillis * rotationSpeed;
        }
        if (palmRotatingR) {
            palm.rotation.x += deltaTimeMillis * rotationSpeed;
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

