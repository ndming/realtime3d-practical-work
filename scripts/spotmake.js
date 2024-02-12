import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export {
    makeThigh,
    makeLeg,
    makeTorso,
    makeForearm,
    makeArm,
    makeWrist,
    makePalm,
    makeGrip,
    makeThighWalkCycle,
    makeLegWalkCycle,
    makeTorsoWalkCycle,
    makeThighJumpAction,
    makeTorsoJumpAction,
    makeLegJumpAction,
    makeThighFrontDoggyAction,
    makeThighBackDoggyAction,
    makeLegFrontDoggyAction,
    makeLegBackDoggyAction,
    makeTorsoDoggyAction,
    makeThighFrontDonkeyAction,
    makeThighBackDonkeyAction,
    makeLegFrontDonkeyAction,
    makeLegBackDonkeyAction,
    makeTorsoDonkeyAction,
    makeGripAAction,
    makeGripBAction
};

function makeThigh() {
    const linkTorsoRadius = 0.25;
    const shaftMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 });

    const shaftPoints = [];

    for (const a of linspace(Math.PI / 2, -Math.PI / 6, linkTorsoRadius * 80)) {
        const p = new THREE.Vector2(Math.cos(a), Math.sin(a));
        shaftPoints.push(p.multiplyScalar(linkTorsoRadius));
    }

    const thighLength = 6 * linkTorsoRadius;
    const linkLegRadius = linkTorsoRadius / 2;
    shaftPoints.push(new THREE.Vector2(linkLegRadius, -thighLength + linkLegRadius));

    for (const a of linspace(0, -Math.PI / 2, linkTorsoRadius * 20)) {
        const p = new THREE.Vector2(Math.cos(a), Math.sin(a)).multiplyScalar(linkLegRadius);
        shaftPoints.push(p.add(new THREE.Vector2(0, -thighLength + linkLegRadius)));
    }

    const shaftGeometry = new THREE.LatheGeometry(shaftPoints.reverse(), linkTorsoRadius * 40);
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    return shaft;
}

function makeLeg() {
    const linkThighRadius = 0.125;
    const material = new THREE.MeshLambertMaterial({ color: 0x4d2e00 });

    const points = [];
    for (const a of linspace(Math.PI / 2, 0, linkThighRadius * 40)) {
        const p = new THREE.Vector2(Math.cos(a), Math.sin(a));
        points.push(p.multiplyScalar(linkThighRadius));
    }

    const ankleRadius = linkThighRadius * 2;
    const length = 12 * linkThighRadius;
    points.push(new THREE.Vector2(linkThighRadius, -length + ankleRadius * 2));

    for (const a of linspace(0, -Math.PI / 2, ankleRadius * 40)) {
        const p = new THREE.Vector2(Math.cos(a), Math.sin(a)).multiplyScalar(ankleRadius);
        points.push(p.add(new THREE.Vector2(0, -length + ankleRadius)));
    }

    const geometry = new THREE.LatheGeometry(points.reverse());
    const leg = new THREE.Mesh(geometry, material);
    leg.scale.set(0.5, 1, 1);

    return leg;
}

function linspace(start, stop, num, endpoint = true) {
    const div = endpoint ? (num - 1) : num;
    const step = (stop - start) / div;
    return Array.from({ length: num }, (_, i) => start + step * i);
}

function makeTorso() {
    const shape = new THREE.Shape();
    shape.moveTo(-3, 0.5);
    shape.lineTo(-2.5, -0.2);
    shape.lineTo(2.5, -0.1);
    shape.lineTo(2.5, 0.05);
    shape.lineTo(-3, 0.5);

    const extrudeSettings = {
        steps: 2,
        depth: 1,
        bevelEnabled: true,
        bevelThickness: 0.35,
        bevelSize: 0.2,
        bevelSegments: 10,
        bevelOffset: 0
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshLambertMaterial({ color: 0x806600 });

    const torso = new THREE.Mesh(geometry, material);

    const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x4d2e00 });
    const platformGeometry = new THREE.BoxGeometry(1.0, 0.1, 1.0);
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.z = THREE.MathUtils.degToRad(-4);
    platform.position.set(-2, 0.6, 0.5);

    const holderRadius = 0.25;
    const holderShape = new THREE.Shape()
        .moveTo(holderRadius, holderRadius)
        .absarc(0, 0, holderRadius, 0, Math.PI, false)
        .closePath();

    const holderExtrudeSettings = { steps: 2, depth: 0.1, bevelEnabled: false };
    const holderGeometry = new THREE.ExtrudeGeometry(holderShape, holderExtrudeSettings);
    const holderA = new THREE.Mesh(holderGeometry, platformMaterial);
    holderA.rotation.z = THREE.MathUtils.degToRad(-4);
    holderA.position.set(-2, 0.65, 0.3);

    const holderB = new THREE.Mesh(holderGeometry, platformMaterial);
    holderB.rotation.z = THREE.MathUtils.degToRad(-4);
    holderB.position.set(-2, 0.65, 0.55);

    torso.add(platform);
    torso.add(holderA);
    torso.add(holderB);
    return torso;
}

function makeForearm() {
    const linkTorsoRadius = 0.2;
    const forearmLength = 1.5;

    const shape = new THREE.Shape()
        .moveTo(0, linkTorsoRadius)
        .absarc(0, 0, linkTorsoRadius, Math.PI / 2, Math.PI / 6, true)
        .lineTo(forearmLength, Math.sin(Math.PI / 6) * linkTorsoRadius)
        .absarc(forearmLength, 0, Math.sin(Math.PI / 6) * linkTorsoRadius, Math.PI / 2, -Math.PI / 2, true)
        .lineTo(Math.cos(-Math.PI / 6) * linkTorsoRadius, Math.sin(-Math.PI / 6) * linkTorsoRadius)
        .absarc(0, 0, linkTorsoRadius, -Math.PI / 6, Math.PI / 2, true)
        .closePath();

    const extrudeSettings = { steps: 2, depth: 0.15, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshLambertMaterial({ color: 0xffcc00 });

    const forearm = new THREE.Mesh(geometry, material);
    return forearm;
}

function makeArm() {
    const linkForearmRadius = 0.2 * Math.sin(Math.PI / 6);
    const armLength = 1.5;

    const shape = new THREE.Shape()
        .moveTo(0, linkForearmRadius)
        .lineTo(armLength, linkForearmRadius)
        .absarc(armLength, 0, linkForearmRadius, Math.PI / 2, -Math.PI / 2, true)
        .lineTo(0, -linkForearmRadius)
        .absarc(0, 0, linkForearmRadius, -Math.PI / 2, Math.PI / 2, true)
        .closePath();

    const extrudeSettings = { steps: 2, depth: 0.1, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshLambertMaterial({ color: 0x4d2e00 });

    const armA = geometry.clone();
    const armB = geometry.clone();
    armA.translate(0, 0, -0.1);
    armB.translate(0, 0, 0.15);

    const armGeometries = [armA, armB];
    const armGeometry = BufferGeometryUtils.mergeGeometries(armGeometries, false);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4d2e00 });

    const arm = new THREE.Mesh(armGeometry, armMaterial);
    return arm;
}

function makeWrist() {
    const linkForearmRadius = 0.2 * Math.sin(Math.PI / 6);
    const wristLength = 0.15;

    const linkShape = new THREE.Shape()
        .moveTo(0, -linkForearmRadius)
        .absarc(0, 0, linkForearmRadius, -Math.PI / 2, Math.PI / 2, true)
        .lineTo(wristLength, linkForearmRadius)
        .lineTo(wristLength, -linkForearmRadius)
        .closePath();
    const extrudeSettings = { steps: 2, depth: 0.15, bevelEnabled: false };

    const linkGeometry = new THREE.ExtrudeGeometry(linkShape, extrudeSettings);
    const linkMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
    const wrist = new THREE.Mesh(linkGeometry, linkMaterial);

    const baseRadius = 0.25;
    const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, 0.05);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.rotateZ(Math.PI / 2);
    base.position.set(wristLength, 0, 0.075);

    wrist.add(base);
    return wrist;
}

function makePalm() {
    const palmRadius = 0.2;
    const palmGeometry = new THREE.CylinderGeometry(palmRadius, palmRadius, 0.075);
    const palmMaterial = new THREE.MeshLambertMaterial({ color: 0x4d2e00 });
    const palm = new THREE.Mesh(palmGeometry, palmMaterial);

    return palm;
}

function makeGrip() {
    const linkPalmRadius = 0.1;
    const segmentLength = 0.25;
    const bendAngleRad = Math.PI / 4;
    const yOffset = segmentLength * Math.sin(bendAngleRad);
    const xOffset = segmentLength * Math.cos(bendAngleRad);

    const shapeA = new THREE.Shape()
        .moveTo(linkPalmRadius * Math.cos(Math.PI / 6), linkPalmRadius * Math.sin(Math.PI / 6))
        .absarc(0, 0, linkPalmRadius, Math.PI / 6, -Math.PI / 6, false)
        .lineTo(segmentLength, linkPalmRadius * Math.sin(-Math.PI / 6))
        .lineTo(segmentLength + xOffset, linkPalmRadius * Math.sin(-Math.PI / 6) - yOffset)
        .lineTo(segmentLength + xOffset + linkPalmRadius, linkPalmRadius * Math.sin(-Math.PI / 6) - yOffset)
        .lineTo(segmentLength, linkPalmRadius * Math.sin(Math.PI / 6))
        .closePath();

    const shapeB = new THREE.Shape()
        .moveTo(linkPalmRadius * Math.cos(-Math.PI / 6), linkPalmRadius * Math.sin(-Math.PI / 6))
        .absarc(0, 0, linkPalmRadius, -Math.PI / 6, Math.PI / 6, true)
        .lineTo(segmentLength, linkPalmRadius * Math.sin(Math.PI / 6))
        .lineTo(segmentLength + xOffset, linkPalmRadius * Math.sin(Math.PI / 6) + yOffset)
        .lineTo(segmentLength + xOffset + linkPalmRadius, linkPalmRadius * Math.sin(Math.PI / 6) + yOffset)
        .lineTo(segmentLength, linkPalmRadius * Math.sin(-Math.PI / 6))
        .closePath();

    const extrudeSettings = { steps: 2, depth: 0.15, bevelEnabled: false };
    const material = new THREE.MeshLambertMaterial({ color: 0xffcc00 });

    const geometryA = new THREE.ExtrudeGeometry(shapeA, extrudeSettings);
    const geometryB = new THREE.ExtrudeGeometry(shapeB, extrudeSettings);

    const gripA = new THREE.Mesh(geometryA, material);
    const gripB = new THREE.Mesh(geometryB, material);

    return { gripA, gripB };

}

const walkKeyTimes = [0, 0.25, 0.5];

function makeThighWalkCycle(targets) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();
    const q2 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(25));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(48));
    q2.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(60));

    const values = [q0.toArray(), q1.toArray(), q2.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', walkKeyTimes, values);

    const clip = new THREE.AnimationClip('ThighWalkCycle', walkKeyTimes[walkKeyTimes.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopPingPong);

    return { mixer: mixer, action: action };
}

function makeLegWalkCycle(targets) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();
    const q2 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(110));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(98));
    q2.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(85));

    const values = [q0.toArray(), q1.toArray(), q2.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', walkKeyTimes, values);

    const clip = new THREE.AnimationClip('LegWalkCycle', walkKeyTimes[walkKeyTimes.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopPingPong);

    return { mixer: mixer, action: action };
}

function makeTorsoWalkCycle(targets, globalPosition) {
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();

    p0.addVectors(globalPosition, new THREE.Vector3(0, 0.2, 0));
    p1.addVectors(globalPosition, new THREE.Vector3(0, 0.0, 0));
    p2.addVectors(globalPosition, new THREE.Vector3(0, 0.2, 0));

    const values = [p0.toArray(), p1.toArray(), p2.toArray()].flat();
    const track = new THREE.VectorKeyframeTrack('.position', walkKeyTimes, values);

    const clip = new THREE.AnimationClip('TorsoWalkCycle', walkKeyTimes[walkKeyTimes.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopPingPong);

    return { mixer: mixer, action: action };
}

const jumpKeyTimes = [0, 0.25, 0.45, 0.7];

function makeThighJumpAction(targets) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();
    const q2 = new THREE.Quaternion();
    const q3 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(48));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(75));
    q2.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(30));
    q3.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(48));

    const values = [q0.toArray(), q1.toArray(), q2.toArray(), q3.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', jumpKeyTimes, values);

    const clip = new THREE.AnimationClip('ThighJumpAction', jumpKeyTimes[jumpKeyTimes.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);

    return { mixer: mixer, action: action };
}

function makeLegJumpAction(targets) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();
    const q2 = new THREE.Quaternion();
    const q3 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(98));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(130));
    q2.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(75));
    q3.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(98));

    const values = [q0.toArray(), q1.toArray(), q2.toArray(), q3.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', jumpKeyTimes, values);

    const clip = new THREE.AnimationClip('ThighJumpAction', jumpKeyTimes[jumpKeyTimes.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);

    return { mixer: mixer, action: action };
}

function makeTorsoJumpAction(targets, globalPosition) {
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();
    const p3 = new THREE.Vector3();

    p0.addVectors(globalPosition, new THREE.Vector3());
    p1.addVectors(globalPosition, new THREE.Vector3(0, -0.75, 0));
    p2.addVectors(globalPosition, new THREE.Vector3(0, 1.35, 0));
    p3.addVectors(globalPosition, new THREE.Vector3());

    const values = [p0.toArray(), p1.toArray(), p2.toArray(), p3.toArray()].flat();
    const track = new THREE.VectorKeyframeTrack('.position', jumpKeyTimes, values);

    const clip = new THREE.AnimationClip('TorsoJumpAction', jumpKeyTimes[jumpKeyTimes.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);

    return { mixer: mixer, action: action };
}

function makeThighFrontDoggyAction(targets, doggyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(48));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(60));

    const times = [0, doggyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeThighBackDoggyAction(targets, doggyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(48));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(10));

    const times = [0, doggyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeLegFrontDoggyAction(targets, doggyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(98));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(130));

    const times = [0, doggyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeLegBackDoggyAction(targets, doggyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(98));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(20));

    const times = [0, doggyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeTorsoDoggyAction(targets, doggyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(0));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(25));

    const times = [0, doggyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('TorsoDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeThighFrontDonkeyAction(targets, donkeyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(48));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(30));

    const times = [0, donkeyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeThighBackDonkeyAction(targets, donkeyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(48));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(70));

    const times = [0, donkeyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeLegFrontDonkeyAction(targets, donkeyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(98));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(20));

    const times = [0, donkeyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeLegBackDonkeyAction(targets, donkeyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(98));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(130));

    const times = [0, donkeyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('ThighDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeTorsoDonkeyAction(targets, donkeyDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(0));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(25));

    const times = [0, donkeyDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('TorsoDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeGripAAction(targets, gripDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(-30));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(-60));

    const times = [0, gripDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('TorsoDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}

function makeGripBAction(targets, gripDurationSeconds) {
    const q0 = new THREE.Quaternion();
    const q1 = new THREE.Quaternion();

    q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(-150));
    q1.setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(-120));

    const times = [0, gripDurationSeconds];
    const values = [q0.toArray(), q1.toArray()].flat();
    const track = new THREE.QuaternionKeyframeTrack('.quaternion', times, values);

    const clip = new THREE.AnimationClip('TorsoDoggyAction', times[times.length - 1], [track]);
    const mixer = new THREE.AnimationMixer(new THREE.AnimationObjectGroup(...targets));

    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat);
    action.repetitions = 1;
    action.clampWhenFinished = true;

    return { mixer: mixer, action: action };
}