import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export {
    setupPrimitives,
    setupOrbitControls,
    setupCoordinateSystem,
    setupFlyControls,
    setupTelelumen,
    setupTelelumenLights,
    setupWallGUI,
    setupLightGUI
};

function setupOrbitControls(camera, domElement, onCameraUpdate = () => { }) {
    const controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.rotateSpeed = 0.5;
    controls.addEventListener('change', onCameraUpdate);

    return controls;
}

function setupFlyControls(camera, domElement, onCameraUpdate = () => { }) {
    const controls = new FlyControls(camera, domElement);
    controls.rollSpeed = 0.1;
    controls.addEventListener('change', onCameraUpdate);

    return controls;
}

function setupCoordinateSystem(scene) {
    const frame = makeBasisVectors(4);
    // scene.add(frame);

    const crossGrid = makeCrosses();
    // scene.add(crossGrid);

    const pointLightTop = new THREE.PointLight(0xffffff, 50, 20);
    pointLightTop.position.set(0, 5, 0);
    const pointLightBot = new THREE.PointLight(0xffffff, 50, 20);
    pointLightBot.position.set(0, -5, 0);
    scene.add(pointLightTop);
    scene.add(pointLightBot);

    const world = new THREE.Group();
    world.add(frame);
    world.add(crossGrid);
    scene.add(world);
    return world;
}

function makeCrosses(halfLength = 0.2, thickness = 0.05, distance = 1, extentCount = 50) {
    const geoX = new THREE.PlaneGeometry(halfLength, thickness);
    const geoZ = new THREE.PlaneGeometry(thickness, halfLength);

    const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });

    const crossGrid = new THREE.Group();

    const count = 2 * extentCount + 1;
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            const crossX = new THREE.Mesh(geoX, material);
            const crossZ = new THREE.Mesh(geoZ, material);
            const cross = new THREE.Group();
            cross.add(crossX);
            cross.add(crossZ);
            cross.rotateX(THREE.MathUtils.degToRad(-90));

            const posX = (j - extentCount) * distance;
            const posZ = (i - extentCount) * distance;
            cross.position.set(posX, 0, posZ);

            crossGrid.add(cross);
        }
    }

    return crossGrid;
}

function makeBasisVectors(size = 1) {
    const originRadius = 0.1;

    const origin = new THREE.Vector3(0, 0, 0);
    const pointX = new THREE.Vector3(size, 0, 0);
    const pointY = new THREE.Vector3(0, size, 0);
    const pointZ = new THREE.Vector3(0, 0, size);

    const geometryX = new THREE.BufferGeometry().setFromPoints([origin, pointX]);
    const geometryY = new THREE.BufferGeometry().setFromPoints([origin, pointY]);
    const geometryZ = new THREE.BufferGeometry().setFromPoints([origin, pointZ]);

    const geoCap = new THREE.ConeGeometry(originRadius, originRadius * 2, 20);

    const materialX = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
    const materialY = new THREE.MeshBasicMaterial({ color: 0x4dffa6 });
    const materialZ = new THREE.MeshBasicMaterial({ color: 0x4da6ff });

    const lineX = new THREE.Line(geometryX, materialX);
    const lineY = new THREE.Line(geometryY, materialY);
    const lineZ = new THREE.Line(geometryZ, materialZ);

    const capX = new THREE.Mesh(geoCap, materialX);
    capX.rotateZ(THREE.MathUtils.degToRad(-90));
    capX.position.set(size - originRadius / 2, 0, 0);
    const capY = new THREE.Mesh(geoCap, materialY);
    capY.position.set(0, size - originRadius / 2, 0);
    const capZ = new THREE.Mesh(geoCap, materialZ);
    capZ.rotateX(THREE.MathUtils.degToRad(90));
    capZ.position.set(0, 0, size - originRadius / 2);

    const frame = new THREE.Group();
    frame.add(lineX);
    frame.add(lineY);
    frame.add(lineZ);
    frame.add(capX);
    frame.add(capY);
    frame.add(capZ);

    return frame;
}

function setupPrimitives(scene, onResourceLoaded) {
    const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

    const box = new THREE.Mesh(new THREE.BoxGeometry(), material);
    box.position.set(-1, 0.5, 1);

    const capsule = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.25, 20, 40), material);
    capsule.position.set(1, 0.5, 1);

    const circle = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), material);
    circle.rotateX(THREE.MathUtils.degToRad(-90));
    circle.position.set(1, 0, -1);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 20, 20), material);
    cone.position.set(5, 0.5, 1);

    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 20, 20), material);
    cylinder.position.set(3, 0.5, 1);

    const dodecahedron = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), material);
    dodecahedron.position.set(-3, 0.5, 1);

    const length = 0.25, width = 0.25;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(0, 0);
    const extrudeSettings = {
        steps: 1,
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.25,
        bevelSize: 0.25,
        bevelOffset: 0,
        bevelSegments: 1
    };
    const extruder = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, extrudeSettings), material);
    extruder.position.set(-5, 0.35, 0.75);

    const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5), material);
    icosahedron.position.set(-5, 0.5, 3);

    const lathePoints = [new THREE.Vector2(0, -0.5), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.25, 0.5)];
    const lathe = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 8), material);
    lathe.position.set(-3, 0.5, 3);

    const octahedron = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), material);
    octahedron.position.set(-1, 0.5, 3);

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    plane.rotateX(THREE.MathUtils.degToRad(-90));
    plane.position.set(-1, 0, -1);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.5, 8), material);
    ring.rotateX(THREE.MathUtils.degToRad(-90));
    ring.position.set(-3, 0, -1);

    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
    const heart = new THREE.Mesh(new THREE.ShapeGeometry(heartShape), material);
    heart.scale.set(0.05, 0.05, 0.05);
    heart.rotateX(THREE.MathUtils.degToRad(-90));
    heart.position.set(2.75, 0, -0.5);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 40), material);
    sphere.position.set(1, 0.5, 3);

    const tetrahedron = new THREE.Mesh(new THREE.TetrahedronGeometry(0.5), material);
    tetrahedron.position.set(-5, 0.5, -1);

    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.2, 40, 48), material);
    torus.position.set(3, 0.5, 3);

    const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.35, 0.1, 60, 68), material);
    torusKnot.position.set(5, 0.5, 3);

    const sinCurve = new SinCurve(0.5);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(sinCurve, 64, 0.1, 20), material);
    tube.position.set(5, 0.5, -1);

    const func = function (u, v, target) {
        const rangeMin = -8;
        const rangeMax = 8;
        const range = rangeMax - rangeMin;

        const x = rangeMin + u * range;
        const y = rangeMin + v * range;
        const z = (x * x + y * y) / 40 + 2 * Math.exp(-(Math.cos(x / 2) + y * y / 4)) - Math.cos(x / 1.5) - Math.sin(y / 1.5);
        target.set(x, y, z);
    }
    const parametricMesh = new THREE.Mesh(new ParametricGeometry(func, 50, 50), material);
    parametricMesh.rotateX(THREE.MathUtils.degToRad(-90));
    parametricMesh.scale.set(1 / 16, 1 / 16, 1 / 16);
    parametricMesh.position.set(5, 0.25, -3);

    const verticesOfCube = [
        - 1, - 1, - 1, 1, - 1, - 1, 1, 1, - 1, - 1, 1, - 1,
        - 1, - 1, 1, 1, - 1, 1, 1, 1, 1, - 1, 1, 1,
    ];
    const indicesOfFaces = [
        2, 1, 0, 0, 3, 2,
        0, 4, 7, 7, 3, 0,
        0, 1, 5, 5, 4, 0,
        1, 2, 6, 6, 5, 1,
        2, 3, 7, 7, 6, 2,
        4, 5, 6, 6, 7, 4,
    ];
    const polyhedron = new THREE.Mesh(new THREE.PolyhedronGeometry(verticesOfCube, indicesOfFaces, 0.5, 1), material);
    polyhedron.position.set(-5, 0.5, -3);

    const loader = new FontLoader();
    loader.load('/typefaces/JetBrains-Mono-SemiBold.json', (font) => {
        const geometry = new TextGeometry("JS", {
            font: font,
            size: 3,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.3,
            bevelSegments: 5,
        });
        const text = new THREE.Mesh(geometry, material);
        text.scale.set(0.2, 0.2, 1);
        text.position.set(2.5, 0, -3.25);
        scene.add(text);

        onResourceLoaded();
    });

    const edges = new THREE.EdgesGeometry(icosahedron.geometry);
    const edge = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
        color: 0xb3b3ff
    }));
    edge.position.set(-3, 0.5, -3);

    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(sphere.geometry), new THREE.LineBasicMaterial({
        color: 0xb3b3ff
    }));
    wireframe.material.opacity = 0.5;
    wireframe.material.transparent = true;
    wireframe.position.set(1, 0.5, -3);

    const vertices = new Float32Array([
        // Face +X
        0.5, -0.5, 1.0,
        1.0, -1.0, -1.0,
        0.5, 0.5, 1.0,
        1.0, 1.0, -1.0,
        // Face +Y
        0.5, 0.5, 1.0,
        1.0, 1.0, -1.0,
        -0.5, 0.5, 1.0,
        -1.0, 1.0, -1.0,
        // Face +Z
        -0.5, 0.5, 1.0,
        -0.5, -0.5, 1.0,
        0.5, 0.5, 1.0,
        0.5, -0.5, 1.0,
        // Face -X
        -0.5, 0.5, 1.0,
        -1.0, 1.0, -1.0,
        -0.5, -0.5, 1.0,
        -1.0, -1.0, -1.0,
        // Face -Y
        -0.5, -0.5, 1.0,
        -1.0, -1.0, -1.0,
        0.5, -0.5, 1.0,
        1.0, -1.0, -1.0,
        // Face -Z
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,
    ]);
    const xpNorm = new THREE.Vector3();
    xpNorm.crossVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(-0.5, 0, 1));
    const xnNorm = new THREE.Vector3();
    xnNorm.crossVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.5, 0, 1));
    const ypNorm = new THREE.Vector3();
    ypNorm.crossVectors(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, -0.5, 1));
    const ynNorm = new THREE.Vector3();
    ynNorm.crossVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.5, 1));
    const normals = new Float32Array([
        // Face +X
        xpNorm.x, xpNorm.y, xpNorm.z,
        xpNorm.x, xpNorm.y, xpNorm.z,
        xpNorm.x, xpNorm.y, xpNorm.z,
        xpNorm.x, xpNorm.y, xpNorm.z,
        // Face +Y
        ypNorm.x, ypNorm.y, ypNorm.z,
        ypNorm.x, ypNorm.y, ypNorm.z,
        ypNorm.x, ypNorm.y, ypNorm.z,
        ypNorm.x, ypNorm.y, ypNorm.z,
        // Face +Z
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        // Face -X
        xnNorm.x, xnNorm.y, xnNorm.z,
        xnNorm.x, xnNorm.y, xnNorm.z,
        xnNorm.x, xnNorm.y, xnNorm.z,
        xnNorm.x, xnNorm.y, xnNorm.z,
        // Face -Y
        ynNorm.x, ynNorm.y, ynNorm.z,
        ynNorm.x, ynNorm.y, ynNorm.z,
        ynNorm.x, ynNorm.y, ynNorm.z,
        ynNorm.x, ynNorm.y, ynNorm.z,
        // Face -Z
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
    ]);
    const indices = [];
    for (let i = 0; i < 6; ++i) {
        const it = i * 4;
        indices.push(it); indices.push(it + 1); indices.push(it + 2);
        indices.push(it + 2); indices.push(it + 1); indices.push(it + 3);
    }
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    bufferGeometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    bufferGeometry.setIndex(indices);
    const buffer = new THREE.Mesh(bufferGeometry, material);
    buffer.rotateX(THREE.MathUtils.degToRad(-90));
    buffer.scale.set(0.5, 0.5, 0.5);
    buffer.position.set(-1, 0.5, -3);

    scene.add(box);
    scene.add(buffer);
    scene.add(capsule);
    scene.add(circle);
    scene.add(cone);
    scene.add(cylinder);
    scene.add(dodecahedron);
    scene.add(edge);
    scene.add(extruder);
    scene.add(icosahedron);
    scene.add(lathe);
    scene.add(octahedron);
    scene.add(plane);
    scene.add(ring);
    scene.add(heart);
    scene.add(sphere);
    scene.add(tetrahedron);
    scene.add(torus);
    scene.add(torusKnot);
    scene.add(tube);
    scene.add(parametricMesh);
    scene.add(polyhedron);
    scene.add(wireframe);
}

class SinCurve extends THREE.Curve {
    constructor(scale = 1) {
        super();
        this.scale = scale;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tx = -1 + 2 * t;
        const ty = Math.sin(2 * Math.PI * t);
        const tz = 0;

        return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
    }
}