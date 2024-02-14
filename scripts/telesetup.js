import * as THREE from 'three';

export {
    setupTelelumen,
    setupTelelumenLights,
    setupWallGUI,
    setupLightGUI
};

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
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
        initialState.ambient.color,
        initialState.ambient.intensity
    );

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

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(
        initialState.hemisphere.skyColor,
        initialState.hemisphere.groundColor,
        initialState.hemisphere.intensity,
    );
    hemisphereLight.position.set(0, 0, 0);
    hemisphereLight.position.add(initialState.hemisphere.position);
    hemisphereLight.position.add(box.position);
    const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight);

    const primaryLights = {
        point: pointLightHelper,
        directional: directionalLightHelper,
        spot: spotLightHelper,
        hemisphere: hemisphereLightHelper
    };
    return {
        ambient: ambientLight,
        primary: primaryLights
    };
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
    const ambientLightGUI = lightGUI.addFolder('Ambient Light');
    const ambientLight = telelumenLights.ambient;
    ambientLightGUI
        .add({ enabled: false }, 'enabled')
        .name('Enabled')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(ambientLight);
            } else {
                scene.remove(ambientLight);
            }
        });
    ambientLightGUI.addColor(ambientLight, 'color').name('Name').listen();
    ambientLightGUI.add(ambientLight, 'intensity', 0, 20, 0.1).name('Intensity').listen();
    ambientLightGUI.add({
        onReset: () => {
            ambientLight.color.set(initialState.ambient.color);
            ambientLight.intensity = initialState.ambient.intensity;
        }
    }, 'onReset').name("Reset");

    const primaryLightGUI = lightGUI.addFolder('Primary Lights');

    const pointLightGUI = primaryLightGUI.addFolder('Point');
    setupPointLightGUI(pointLightGUI, telelumenLights.primary.point, scene, initialState.point, box);

    const directionalLightGUI = primaryLightGUI.addFolder('Directional');
    setupDirectionalLightGUI(directionalLightGUI, telelumenLights.primary.directional, scene, initialState.directional, box);

    const spotLightGUI = primaryLightGUI.addFolder('Spot');
    setupSpotLightGUI(spotLightGUI, telelumenLights.primary.spot, scene, initialState.spot, box);

    const hemesphereLightGUI = primaryLightGUI.addFolder('Hemisphere');
    setupHemisphereLightGUI(hemesphereLightGUI, telelumenLights.primary.hemisphere, scene, initialState.hemisphere, box);
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
        .add({ enabled: true }, 'enabled')
        .name('Helper')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(helper);
            } else {
                scene.remove(helper);
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
        .add({ enabled: true }, 'enabled')
        .name('Helper')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(helper);
            } else {
                scene.remove(helper);
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
        .add({ enabled: true }, 'enabled')
        .name('Helper')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(helper);
            } else {
                scene.remove(helper);
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

function setupHemisphereLightGUI(lightGUI, helper, scene, initialState, box) {
    lightGUI
        .add({ enabled: false }, 'enabled')
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
        .add({ enabled: true }, 'enabled')
        .name('Helper')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(helper);
            } else {
                scene.remove(helper);
            }
        });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Sky Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
        });
    lightGUI
        .addColor(helper.light, 'groundColor')
        .name("Ground Color")
        .listen()
        .onChange((color) => {
            // helper.color = color;
            helper.update();
        });
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
        helper.light.color.set(initialState.skyColor);
        helper.color = initialState.color;
        helper.light.goundColor = initialState.groundColor;
        helper.light.intensity = initialState.intensity;
        helper.light.position.set(0, 0, 0);
        helper.light.position.add(initialState.position);
        helper.light.position.add(box.position);
        helper.update();
    }
}