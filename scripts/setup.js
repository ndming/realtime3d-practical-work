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

function setupTelelumen(scene, box) {
    const tableGeometry = new THREE.BoxGeometry(8, 2, 6);
    const tableMaterial = new THREE.MeshToonMaterial({ color: 0x999999 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, 1, 0);
    table.position.add(box.position);

    const floorGeometry = new THREE.BoxGeometry(box.width, 0.01, box.depth);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.add(box.position);

    const ceilling = new THREE.Mesh(floorGeometry, floorMaterial);
    ceilling.rotateX(Math.PI);
    ceilling.position.set(0, box.height, 0);
    ceilling.position.add(box.position);

    const backWallGeometry = new THREE.BoxGeometry(box.width, box.height, 0.01);
    const backWallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.set(0, box.height / 2, -box.depth / 2);
    backWall.position.add(box.position);

    const leftWallGeometry = new THREE.BoxGeometry(0.01, box.height, box.depth);
    const leftWallMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
    leftWall.position.set(-box.width / 2, box.height / 2, 0);
    leftWall.position.add(box.position);

    const rightWallGeomnetry = new THREE.BoxGeometry(0.01, box.height, box.depth);
    const rightWallMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const rightWall = new THREE.Mesh(rightWallGeomnetry, rightWallMaterial);
    rightWall.position.set(box.width / 2, box.height / 2, 0);
    rightWall.position.add(box.position);

    const coneMaterial = new THREE.MeshLambertMaterial({ color: 0x66ffcc });
    const coneGeometry = new THREE.ConeGeometry(1, 4, 40, 12);
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(-2, 4, -1);
    cone.position.add(box.position);

    const sphereMaterial = new THREE.MeshPhysicalMaterial({ color: 0x6699ff });
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 3, 1.5);
    sphere.position.add(box.position);

    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xff6666 });
    const cylinderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 64, 12);
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(2, 3, -0.8);
    cylinder.position.add(box.position);

    scene.add(table);
    scene.add(floor);
    scene.add(ceilling);
    scene.add(backWall);
    scene.add(leftWall);
    scene.add(rightWall);
    scene.add(cone);
    scene.add(sphere);
    scene.add(cylinder);

    return {
        table,
        floor,
        ceilling,
        backWall,
        leftWall,
        rightWall,
        cone,
        sphere,
        cylinder
    }
}

function setupTelelumenLights(scene, initialState, box) {
    // Point light
    const pointLight = new THREE.PointLight(
        initialState.point.color,
        initialState.point.intensity,
        initialState.point.distance,
        initialState.point.decay
    );
    pointLight.position.add(initialState.point.position);
    pointLight.position.add(box.position);
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 1, initialState.point.color);
    scene.add(pointLight);
    scene.add(pointLightHelper);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
        initialState.directional.color,
        initialState.directional.intensity
    );
    directionalLight.position.set(0, 0, 0);
    directionalLight.position.add(initialState.directional.position);
    directionalLight.position.add(box.position);
    const phi = initialState.directional.dirPhi;
    const theta = initialState.directional.dirTheta;
    const target = new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi),
        Math.sin(theta),
        Math.cos(theta) * Math.sin(phi)
    );
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.target.position.add(target);
    directionalLight.target.position.add(initialState.directional.position);
    directionalLight.target.position.add(box.position);
    const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);

    // Spot light
    const spotLight = new THREE.SpotLight(
        initialState.spot.color,
        initialState.spot.intensity,
        initialState.spot.distance,
        initialState.spot.angle,
        initialState.spot.penumbra,
        initialState.spot.decay
    );
    spotLight.position.set(0, 0, 0);
    spotLight.position.add(initialState.spot.position);
    spotLight.position.add(box.position);
    const spotPhi = initialState.spot.dirPhi;
    const spotTheta = initialState.spot.dirTheta;
    const spotTarget = new THREE.Vector3(
        Math.sin(spotTheta) * Math.cos(spotPhi),
        Math.cos(spotTheta),
        Math.sin(spotTheta) * Math.sin(spotPhi)
    );
    spotLight.target.position.set(0, 0, 0);
    spotLight.target.position.add(spotTarget);
    spotLight.target.position.add(initialState.spot.position);
    spotLight.target.position.add(box.position);
    const spotLightHelper = new THREE.SpotLightHelper(spotLight, initialState.spot.color);

    const primary = {
        point: pointLightHelper,
        directional: directionalLightHelper,
        spot: spotLightHelper
    };
    return { primary };
}

function setupWallGUI(gui, telelumen) {
    const wallGUI = gui.addFolder('Walls');

    const wallLeftGUI = wallGUI.addFolder('Wall Left');
    wallLeftGUI.addColor(telelumen.leftWall.material, 'color').name("Color");

    const wallRightGUI = wallGUI.addFolder('Wall Right');
    wallRightGUI.addColor(telelumen.rightWall.material, 'color').name("Color");
}

function setupLightGUI(gui, telelumenLights, scene, initialState, box) {
    const lightGUI = gui.addFolder('Lights');

    const primaryLightGUI = lightGUI.addFolder('Primary Lights');

    const pointLightGUI = primaryLightGUI.addFolder('Point');
    setupPointLightGUI(pointLightGUI, telelumenLights.primary.point, scene, initialState.point, box);

    const directionalLightGUI = primaryLightGUI.addFolder('Directional');
    setupDirectionalLightGUI(directionalLightGUI, telelumenLights.primary.directional, scene, initialState.directional, box);

    const spotLightGUI = primaryLightGUI.addFolder('Spot');
    setupSpotLightGUI(spotLightGUI, telelumenLights.primary.spot, scene, initialState.spot, box);
}

function setupPointLightGUI(lightGUI, helper, scene, initialState, box) {
    lightGUI
        .add({ enabled: true }, 'enabled')
        .name('Enabled')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(helper);
                scene.add(helper.light);
            } else {
                scene.remove(helper);
                scene.remove(helper.light);
            }
        });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
        });
    lightGUI
        .add(helper.light, 'decay', 0, 4, 0.01)
        .name("Decay")
        .listen();
    lightGUI
        .add(helper.light, 'distance', 0, 24, 0.01)
        .name("Distance").listen();
    lightGUI
        .add(helper.light, 'intensity', 1, 150, 0.1)
        .name("Intensity (cd)")
        .listen();

    lightGUI
        .add(helper.light.position, 'x', -box.width / 2 + 1.5, box.width / 2 - 1.5, 0.01)
        .name("Position X")
        .listen();
    lightGUI
        .add(helper.light.position, 'y', -box.height / 2 + 1.5, box.height / 2 - 1.5, 0.01)
        .name("Position Y")
        .listen();
    lightGUI
        .add(helper.light.position, 'z', -box.depth / 2 + 1.5, box.depth / 2 - 1.5, 0.01)
        .name("Position Z")
        .listen();

    lightGUI.add({ onReset: onReset }, 'onReset').name("Reset");
    function onReset() {
        helper.light.color.set(initialState.color);
        helper.color = initialState.color;
        helper.light.decay = initialState.decay;
        helper.light.distance = initialState.distance;
        helper.light.intensity = initialState.intensity;
        helper.light.position.set(0, 0, 0);
        helper.light.position.add(initialState.position);
        helper.light.position.add(box.position);
        helper.update();
    }
}

function setupDirectionalLightGUI(lightGUI, helper, scene, initialState, box) {
    const currentDirection = {
        phi: initialState.dirPhi,
        theta: initialState.dirTheta
    };

    lightGUI
        .add({ enabled: false }, 'enabled')
        .name('Enabled')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(helper);
                scene.add(helper.light);
                scene.add(helper.light.target);
            } else {
                scene.remove(helper);
                scene.remove(helper.light);
                scene.remove(helper.light.target);
            }
        });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
        });
    lightGUI
        .add(helper.light, 'intensity', 1, 150, 0.1)
        .name("Intensity (cd)")
        .listen();
    lightGUI
        .add(currentDirection, 'phi', -Math.PI, Math.PI, 0.01)
        .name("Direction Phi")
        .listen()
        .onChange((_) => {
            const target = new THREE.Vector3(
                Math.cos(currentDirection.theta) * Math.cos(currentDirection.phi),
                Math.sin(currentDirection.theta),
                Math.cos(currentDirection.theta) * Math.sin(currentDirection.phi)
            );
            helper.light.target.position.set(0, 0, 0);
            helper.light.target.position.add(target);
            helper.light.target.position.add(initialState.position);
            helper.light.target.position.add(box.position);
            helper.update();
        });
    lightGUI
        .add(currentDirection, 'theta', -Math.PI, 0, 0.01)
        .name("Direction Theta")
        .listen()
        .onChange((_) => {
            const target = new THREE.Vector3(
                Math.cos(currentDirection.theta) * Math.cos(currentDirection.phi),
                Math.sin(currentDirection.theta),
                Math.cos(currentDirection.theta) * Math.sin(currentDirection.phi)
            );
            helper.light.target.position.set(0, 0, 0);
            helper.light.target.position.add(target);
            helper.light.target.position.add(initialState.position);
            helper.light.target.position.add(box.position);
            helper.update();
        });

    lightGUI.add({ onReset: onReset }, 'onReset').name("Reset");
    function onReset() {
        helper.light.color.set(initialState.color);
        helper.color = initialState.color;
        helper.light.intensity = initialState.intensity;
        currentDirection.phi = initialState.dirPhi;
        currentDirection.theta = initialState.dirTheta;
        const target = new THREE.Vector3(
            Math.cos(currentDirection.theta) * Math.cos(currentDirection.phi),
            Math.sin(currentDirection.theta),
            Math.cos(currentDirection.theta) * Math.sin(currentDirection.phi)
        );
        helper.light.target.position.set(0, 0, 0);
        helper.light.target.position.add(target);
        helper.light.target.position.add(initialState.position);
        helper.light.target.position.add(box.position);
        helper.update();
    }
}

function setupSpotLightGUI(lightGUI, helper, scene, initialState, box) {
    const currentDirection = {
        phi: initialState.dirPhi,
        theta: initialState.dirTheta
    };

    lightGUI
        .add({ enabled: false }, 'enabled')
        .name('Enabled')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(helper);
                scene.add(helper.light);
                scene.add(helper.light.target);
            } else {
                scene.remove(helper);
                scene.remove(helper.light);
                scene.remove(helper.light.target);
            }
        });
    lightGUI
        .add(helper.light, 'angle', 0, Math.PI, 0.01)
        .name("Angle")
        .listen()
        .onChange((_) => { helper.update(); });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
        });
    lightGUI
        .add(helper.light, 'decay', 0, 4, 0.01)
        .name("Decay")
        .listen();
    lightGUI
        .add(helper.light, 'distance', 0, 24, 0.01)
        .name("Distance")
        .listen()
        .onChange((_) => { helper.update(); });
    lightGUI
        .add(helper.light, 'intensity', 1, 150, 0.1)
        .name("Intensity (cd)")
        .listen();
    lightGUI
        .add(helper.light, 'penumbra', 0, 1, 0.01)
        .name("Penumbra")
        .listen();
    lightGUI
        .add(helper.light.position, 'x', -box.width / 2 + 1.5, box.width / 2 - 1.5, 0.01)
        .name("Position X")
        .listen()
        .onChange((_) => { helper.update(); });
    lightGUI
        .add(helper.light.position, 'y', -box.height / 2 + 1.5, box.height / 2 - 1.5, 0.01)
        .name("Position Y")
        .listen()
        .onChange((_) => { helper.update(); });
    lightGUI
        .add(helper.light.position, 'z', -box.depth / 2 + 1.5, box.depth / 2 - 1.5, 0.01)
        .name("Position Z")
        .listen()
        .onChange((_) => { helper.update(); });
    lightGUI
        .add(currentDirection, 'phi', -Math.PI, Math.PI, 0.01)
        .name("Direction Phi")
        .listen()
        .onChange((_) => {
            const target = new THREE.Vector3(
                Math.sin(currentDirection.theta) * Math.cos(currentDirection.phi),
                Math.cos(currentDirection.theta),
                Math.sin(currentDirection.theta) * Math.sin(currentDirection.phi)
            );
            helper.light.target.position.set(0, 0, 0);
            helper.light.target.position.add(target);
            helper.light.target.position.add(helper.light.position);
            helper.update();
        });
    lightGUI
        .add(currentDirection, 'theta', 0, Math.PI, 0.01)
        .name("Direction Theta")
        .listen()
        .onChange((_) => {
            const target = new THREE.Vector3(
                Math.sin(currentDirection.theta) * Math.cos(currentDirection.phi),
                Math.cos(currentDirection.theta),
                Math.sin(currentDirection.theta) * Math.sin(currentDirection.phi)
            );
            helper.light.target.position.set(0, 0, 0);
            helper.light.target.position.add(target);
            helper.light.target.position.add(helper.light.position);
            helper.update();
        });

    lightGUI.add({ onReset: onReset }, 'onReset').name("Reset");
    function onReset() {
        helper.light.color.set(initialState.color);
        helper.color = initialState.color;
        helper.light.intensity = initialState.intensity;
        currentDirection.phi = initialState.dirPhi;
        currentDirection.theta = initialState.dirTheta;
        helper.light.position.set(0, 0, 0);
        helper.light.position.add(initialState.position);
        helper.light.position.add(box.position);
        const target = new THREE.Vector3(
            Math.sin(currentDirection.theta) * Math.cos(currentDirection.phi),
            Math.cos(currentDirection.theta),
            Math.sin(currentDirection.theta) * Math.sin(currentDirection.phi)
        );
        helper.light.target.position.set(0, 0, 0);
        helper.light.target.position.add(target);
        helper.light.target.position.add(helper.light.position);
        helper.light.target.position.add(box.position);
        helper.light.angle = initialState.angle;
        helper.light.penumbra = initialState.penumbra;
        helper.light.decay = initialState.decay;
        helper.light.distance = initialState.distance;
        helper.update();
    }
}