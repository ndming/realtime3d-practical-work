import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js'

export {
    setupTelelumen,
    setupTelelumenLights,
    setupWallGUI,
    setupLightGUI,
    setupSecondaryLightGUI,
    setupTelelumenSecondaryLights,
    setupMaterialGUI,
    setupShadowGUI,
};

function setupTelelumen(scene, box) {
    const tableGeometry = new THREE.BoxGeometry(8, 2, 6);
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.1, metalness: 0 });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, 1, 0);
    table.position.add(box.position);
    table.receiveShadow = true;
    table.castShadow = true;

    const floorGeometry = new THREE.PlaneGeometry(box.width, box.depth);
    const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotateX(-Math.PI / 2);
    floor.position.add(box.position);
    floor.receiveShadow = true;

    const ceilling = new THREE.Mesh(floorGeometry, floorMaterial);
    ceilling.rotateX(Math.PI / 2);
    ceilling.position.set(0, box.height, 0);
    ceilling.position.add(box.position);
    ceilling.receiveShadow = true;

    const backWallGeometry = new THREE.PlaneGeometry(box.width, box.height);
    const backWallMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.set(0, box.height / 2, -box.depth / 2);
    backWall.position.add(box.position);
    backWall.receiveShadow = true;

    const leftWallGeometry = new THREE.PlaneGeometry(box.height, box.depth);
    const leftWallMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
    leftWall.rotateY(Math.PI / 2);
    leftWall.rotateZ(-Math.PI / 2);
    leftWall.position.set(-box.width / 2, box.height / 2, 0);
    leftWall.position.add(box.position);
    leftWall.receiveShadow = true;

    const rightWallGeomnetry = new THREE.PlaneGeometry(box.height, box.depth);
    const rightWallMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const rightWall = new THREE.Mesh(rightWallGeomnetry, rightWallMaterial);
    rightWall.rotateY(-Math.PI / 2);
    rightWall.rotateZ(-Math.PI / 2);
    rightWall.position.set(box.width / 2, box.height / 2, 0);
    rightWall.position.add(box.position);
    rightWall.receiveShadow = true;

    const coneMaterial = new THREE.MeshLambertMaterial({ color: 0x66ffcc });
    const coneGeometry = new THREE.ConeGeometry(1, 4, 40, 12);
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.set(-2, 4, -1);
    cone.position.add(box.position);
    cone.castShadow = true;
    cone.receiveShadow = true;

    const sphereMaterial = new THREE.MeshPhysicalMaterial({ color: 0x6699ff });
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 3, 1.5);
    sphere.position.add(box.position);
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xff6666 });
    const cylinderGeometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 64, 12);
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(2, 3, -0.8);
    cylinder.position.add(box.position);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

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
    scene.add(ambientLight);

    // Point light
    const pointLight = new THREE.PointLight(
        initialState.point.color,
        initialState.point.intensity,
        initialState.point.distance,
        initialState.point.decay
    );
    pointLight.position.copy(initialState.point.position);
    pointLight.position.add(box.position);
    const pointLightHelper = new THREE.PointLightHelper(pointLight, 1, initialState.point.color);
    scene.add(pointLight);
    scene.add(pointLightHelper);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(
        initialState.directional.color,
        initialState.directional.intensity
    );
    directionalLight.position.copy(initialState.directional.position);
    directionalLight.position.add(box.position);
    const phi = initialState.directional.dirPhi;
    const theta = initialState.directional.dirTheta;
    const target = new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi),
        Math.sin(theta),
        Math.cos(theta) * Math.sin(phi)
    );
    directionalLight.target.position.copy(target);
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
    spotLight.position.copy(initialState.spot.position);
    spotLight.position.add(box.position);
    spotLight.target.position.copy(initialState.spot.target);
    spotLight.target.position.add(box.position);
    const spotLightHelper = new THREE.SpotLightHelper(spotLight, initialState.spot.color);

    // Hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(
        initialState.hemisphere.skyColor,
        initialState.hemisphere.groundColor,
        initialState.hemisphere.intensity,
    );
    hemisphereLight.position.copy(initialState.hemisphere.position);
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
        primary: primaryLights,
    };
}

function setupTelelumenSecondaryLights(scene, initialState, box, wallLeft, wallRight) {
    // Area light left
    const rectLeft = new THREE.RectAreaLight(initialState.rectLeft.color, initialState.rectLeft.intensity);
    rectLeft.width = box.depth;
    rectLeft.height = box.height;
    rectLeft.position.copy(wallLeft.position);
    rectLeft.lookAt(0, 0, 0);
    const rectLeftHelper = new RectAreaLightHelper(rectLeft);

    // Area light left
    const rectRight = new THREE.RectAreaLight(initialState.rectRight.color, initialState.rectRight.intensity);
    rectRight.width = box.depth;
    rectRight.height = box.height;
    rectRight.position.copy(wallRight.position);
    rectRight.lookAt(0, 0, 0);
    const rectRightHelper = new RectAreaLightHelper(rectRight);

    if (initialState.rectLeft.enabled) {
        scene.add(rectLeft);
        scene.add(rectLeftHelper);
    }
    if (initialState.rectRight.enabled) {
        scene.add(rectRight);
        scene.add(rectRightHelper);
    }

    return {
        helperLeft: rectLeftHelper,
        helperRight: rectRightHelper,
    }
}

function setupWallGUI(gui, telelumen, secondaryLights, notifyParent) {
    const wallGUI = gui.addFolder('Walls');
    wallGUI
        .add({ side: THREE.FrontSide }, 'side', { Front: THREE.FrontSide, Double: THREE.DoubleSide })
        .name("Side")
        .onChange((side) => {
            telelumen.leftWall.material.side = side;
            telelumen.rightWall.material.side = side;
            telelumen.ceilling.material.side = side;
            telelumen.floor.material.side = side;

            notifyParent();
        });

    const wallLeftGUI = wallGUI.addFolder('Wall Left');
    wallLeftGUI
        .addColor(telelumen.leftWall.material, 'color')
        .name("Color")
        .onChange((color) => {
            if (secondaryLights != null) {
                secondaryLights.helperLeft.color = color;
                secondaryLights.helperLeft.light.color = color;
            }
            notifyParent();
        });

    const wallRightGUI = wallGUI.addFolder('Wall Right');
    wallRightGUI
        .addColor(telelumen.rightWall.material, 'color')
        .name("Color")
        .onChange((color) => {
            if (secondaryLights != null) {
                secondaryLights.helperRight.color = color;
                secondaryLights.helperRight.light.color = color;
            }
            notifyParent();
        });

    wallGUI.close();
    wallLeftGUI.close();
    wallRightGUI.close();
}

function setupSecondaryLightGUI(gui, secondaryLights, scene, initialState, notifyParent) {
    const secondaryLightGUI = gui.addFolder('Secondary Lights');

    const rectLeftGUI = secondaryLightGUI.addFolder("Area Light Left");
    rectLeftGUI
        .add({ enabled: initialState.rectLeft.enabled }, 'enabled')
        .name("Enabled")
        .onChange((enabled) => {
            if (enabled) {
                scene.add(secondaryLights.helperLeft);
                scene.add(secondaryLights.helperLeft.light);
            } else {
                scene.remove(secondaryLights.helperLeft);
                scene.remove(secondaryLights.helperLeft.light);
            }
            notifyParent();
        });
    rectLeftGUI
        .add({ intensity: initialState.rectLeft.intensity }, 'intensity', 0, 20, 0.1)
        .name("Intensity")
        .onChange((intensity) => {
            secondaryLights.helperLeft.light.intensity = intensity;
            notifyParent();
        });

    const rectRightGUI = secondaryLightGUI.addFolder("Area Light Right");
    rectRightGUI
        .add({ enabled: initialState.rectRight.enabled }, 'enabled')
        .name("Enabled")
        .onChange((enabled) => {
            if (enabled) {
                scene.add(secondaryLights.helperRight);
                scene.add(secondaryLights.helperRight.light);
            } else {
                scene.remove(secondaryLights.helperRight);
                scene.remove(secondaryLights.helperRight.light);
            }
            notifyParent();
        });
    rectRightGUI
        .add({ intensity: initialState.rectRight.intensity }, 'intensity', 0, 20, 0.1)
        .name("Intensity")
        .onChange((intensity) => {
            secondaryLights.helperRight.light.intensity = intensity;
            notifyParent();
        });
}

function setupShadowGUI(gui, telelumenLights, notifyParent) {
    const primaryLightGUI = gui.foldersRecursive()[1];
    const folders = primaryLightGUI.foldersRecursive();

    const pointLightGUI = folders[0];
    const pointHelper = telelumenLights.primary.point;
    setupPointLightShadowGUI(pointLightGUI, pointHelper, notifyParent);

    const directionalLightGUI = folders[1];
    const directionalHelper = telelumenLights.primary.directional;
    setupDirectionalLightShadowGUI(directionalLightGUI, directionalHelper, notifyParent);

    const spotLightGUI = folders[2];
    const spotHelper = telelumenLights.primary.spot;
    setupSpotLightShadowGUI(spotLightGUI, spotHelper, notifyParent);
}

function setupPointLightShadowGUI(gui, helper, notifyParent) {
    helper.light.castShadow = true;
    gui
        .add(helper.light, 'castShadow')
        .name("Cast Shadow")
        .onChange(notifyParent);

    gui
        .add(helper.light.shadow.camera, 'near', 0.1, 20, 0.5)
        .name("Near")
        .onChange(notifyParent);
}

function setupDirectionalLightShadowGUI(gui, helper, notifyParent) {
    helper.light.castShadow = true;
    gui
        .add(helper.light, 'castShadow')
        .name("Cast Shadow")
        .onChange(notifyParent);

    helper.light.shadow.camera.left = -11;
    helper.light.shadow.camera.right = 11;
    gui
        .add(new DimensionGUIHelper(helper.light.shadow.camera, 'left', 'right'), 'value', 1, 30, 0.1)
        .name("Width")
        .onChange(updateShadowCamera);

    helper.light.shadow.camera.bottom = -11;
    helper.light.shadow.camera.top = 11;
    gui
        .add(new DimensionGUIHelper(helper.light.shadow.camera, 'bottom', 'top'), 'value', 1, 30, 0.1)
        .name("Height")
        .onChange(updateShadowCamera);

    helper.light.shadow.camera.near = 0.5;
    helper.light.shadow.camera.far = 30;
    const minMaxGUIHelper = new MinMaxGUIHelper(helper.light.shadow.camera, 'near', 'far', 0.1);
    gui
        .add(minMaxGUIHelper, 'min', 0.1, 20, 0.5)
        .name("Near")
        .onChange(updateShadowCamera);
    gui
        .add(minMaxGUIHelper, 'max', 0.1, 50, 0.5)
        .name("Far")
        .onChange(updateShadowCamera);


    function updateShadowCamera() {
        helper.light.target.updateMatrixWorld();
        helper.update();
        helper.light.shadow.camera.updateProjectionMatrix();
        notifyParent();
    }
}

function setupSpotLightShadowGUI(gui, helper, notifyParent) {
    helper.light.castShadow = true;
    gui
        .add(helper.light, 'castShadow')
        .name("Cast Shadow")
        .onChange(updateShadowCamera);

    gui
        .add(helper.light.shadow.camera, 'near', 0.1, 20, 0.5)
        .name("Near")
        .onChange(updateShadowCamera);

    function updateShadowCamera() {
        helper.light.target.updateMatrixWorld();
        helper.light.shadow.camera.updateProjectionMatrix();
        helper.update();
        notifyParent();
    }
}

class DimensionGUIHelper {
    constructor(obj, minProp, maxProp) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
    }
    get value() {
        return this.obj[this.maxProp] * 2;
    }
    set value(v) {
        this.obj[this.maxProp] = v / 2;
        this.obj[this.minProp] = v / -2;
    }
}

class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }

    get min() {
        return this.obj[this.minProp];
    }

    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }

    get max() {
        return this.obj[this.maxProp];
    }

    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min; // this will call the min setter
    }
}

function setupLightGUI(gui, telelumenLights, scene, initialState, box, notifyParent) {
    const lightGUI = gui.addFolder('Lights');

    const ambientLightGUI = lightGUI.addFolder('Ambient Light');
    const ambientLight = telelumenLights.ambient;
    ambientLightGUI
        .add({ enabled: true }, 'enabled')
        .name('Enabled')
        .onChange((enabled) => {
            if (enabled) {
                scene.add(ambientLight);
            } else {
                scene.remove(ambientLight);
            }
            notifyParent();
        });
    ambientLightGUI.addColor(ambientLight, 'color').name('Color').listen().onChange(notifyParent);
    ambientLightGUI.add(ambientLight, 'intensity', 0, 5, 0.01).name('Intensity').listen().onChange(notifyParent);
    ambientLightGUI.add({
        onReset: () => {
            ambientLight.color.set(initialState.ambient.color);
            ambientLight.intensity = initialState.ambient.intensity;
        }
    }, 'onReset').name("Reset").onChange(notifyParent);

    const primaryLightGUI = lightGUI.addFolder('Primary Lights');

    const pointLightGUI = primaryLightGUI.addFolder('Point');
    setupPointLightGUI(pointLightGUI, telelumenLights.primary.point, scene, initialState.point, box, notifyParent);

    const directionalLightGUI = primaryLightGUI.addFolder('Directional');
    setupDirectionalLightGUI(directionalLightGUI, telelumenLights.primary.directional, scene, initialState.directional, box, notifyParent);

    const spotLightGUI = primaryLightGUI.addFolder('Spot');
    setupSpotLightGUI(spotLightGUI, telelumenLights.primary.spot, scene, initialState.spot, box, notifyParent);

    const hemesphereLightGUI = primaryLightGUI.addFolder('Hemisphere');
    setupHemisphereLightGUI(hemesphereLightGUI, telelumenLights.primary.hemisphere, scene, initialState.hemisphere, box, notifyParent);

    primaryLightGUI.close();
    pointLightGUI.close();
    directionalLightGUI.close();
    spotLightGUI.close();
    hemesphereLightGUI.close();

    ambientLightGUI.close();
    primaryLightGUI.close();

    lightGUI.close();

    return lightGUI;
}

function setupPointLightGUI(lightGUI, helper, scene, initialState, box, notifyParent) {
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
            notifyParent();
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
            notifyParent();
        });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light, 'decay', 0, 4, 0.01)
        .name("Decay")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light, 'distance', 0, 24, 0.01)
        .name("Distance")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light, 'intensity', 1, 150, 0.1)
        .name("Intensity (cd)")
        .listen()
        .onChange(notifyParent);

    lightGUI
        .add(helper.light.position, 'x', -box.width / 2 + 1.5, box.width / 2 - 1.5, 0.01)
        .name("Position X")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light.position, 'y', -box.height / 2 + 1.5, box.height / 2 - 1.5, 0.01)
        .name("Position Y")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light.position, 'z', -box.depth / 2 + 1.5, box.depth / 2 - 1.5, 0.01)
        .name("Position Z")
        .listen()
        .onChange(notifyParent);

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
        notifyParent();
    }
}

function setupDirectionalLightGUI(lightGUI, helper, scene, initialState, box, notifyParent) {
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
            notifyParent();
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
            notifyParent();
        });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light, 'intensity', 1, 150, 0.1)
        .name("Intensity (cd)")
        .listen()
        .onChange(notifyParent);
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
            notifyParent();
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
            notifyParent();
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
        notifyParent();
    }
}

function setupSpotLightGUI(lightGUI, helper, scene, initialState, box, notifyParent) {
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
            notifyParent();
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
            notifyParent();
        });
    lightGUI
        .add(helper.light, 'angle', 0, Math.PI, 0.01)
        .name("Angle")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light, 'decay', 0, 4, 0.01)
        .name("Decay")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light, 'distance', 0, 24, 0.01)
        .name("Distance")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light, 'intensity', 1, 150, 0.1)
        .name("Intensity (cd)")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light, 'penumbra', 0, 1, 0.01)
        .name("Penumbra")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light.position, 'x', -box.width / 2 + 1, box.width / 2 - 1, 0.01)
        .name("Position X")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light.position, 'y', -box.height / 2 + 0.5, box.height / 2 - 0.5, 0.01)
        .name("Position Y")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light.position, 'z', -box.depth / 2 + 1, box.depth / 2 - 1, 0.01)
        .name("Position Z")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });

    lightGUI
        .add(helper.light.target.position, 'x', -box.width / 2 + 1.5, box.width / 2 - 1.5, 0.01)
        .name("Target X")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light.target.position, 'y', -box.height / 2 + 1.5, box.height / 2 - 1.5, 0.01)
        .name("Target Y")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light.target.position, 'z', -box.depth / 2 + 1.5, box.depth / 2 - 1.5, 0.01)
        .name("Target Z")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });

    lightGUI.add({ onReset: onReset }, 'onReset').name("Reset");
    function onReset() {
        helper.light.color.set(initialState.color);
        helper.color = initialState.color;
        helper.light.intensity = initialState.intensity;
        helper.light.position.copy(initialState.position);
        helper.light.position.add(box.position);
        helper.light.target.position.copy(initialState.target);
        helper.light.target.position.add(box.position);
        helper.light.angle = initialState.angle;
        helper.light.penumbra = initialState.penumbra;
        helper.light.decay = initialState.decay;
        helper.light.distance = initialState.distance;
        helper.update();
        notifyParent();
    }
}

function setupHemisphereLightGUI(lightGUI, helper, scene, initialState, box, notifyParent) {
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
            notifyParent();
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
            notifyParent();
        });
    lightGUI
        .addColor(helper.light, 'color')
        .name("Sky Color")
        .listen()
        .onChange((color) => {
            helper.color = color;
            helper.update();
            notifyParent();
        });
    lightGUI
        .addColor(helper.light, 'groundColor')
        .name("Ground Color")
        .listen()
        .onChange((_) => {
            helper.update();
            notifyParent();
        });
    lightGUI
        .add(helper.light, 'intensity', 1, 150, 0.1)
        .name("Intensity (cd)")
        .listen()
        .onChange(notifyParent);

    lightGUI
        .add(helper.light.position, 'x', -box.width / 2 + 1.5, box.width / 2 - 1.5, 0.01)
        .name("Position X")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light.position, 'y', -box.height / 2 + 1.5, box.height / 2 - 1.5, 0.01)
        .name("Position Y")
        .listen()
        .onChange(notifyParent);
    lightGUI
        .add(helper.light.position, 'z', -box.depth / 2 + 1.5, box.depth / 2 - 1.5, 0.01)
        .name("Position Z")
        .listen()
        .onChange(notifyParent);

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
        notifyParent();
    }
}

function setupMaterialGUI(gui, cone, cylinder, sphere, textures, envMaps, notifyParent) {
    const materialGUI = gui.addFolder('Materials');

    const commonGUI = materialGUI.addFolder('Common');
    const commonProperties = {
        dithering: false,
        flatShading: false,
        opacity: 1,
        transparent: false,
        precision: "mediump",
        side: THREE.FrontSide,
        visible: true,
        wireframe: false,
    }

    const lambertGUI = materialGUI.addFolder('Lambertian');
    const lambertProperties = {
        aoMap: null,
        aoMapIntensity: 1,
        bumpMap: null,
        bumpScale: 1,
        color: 0x66ffcc,
        map: null,
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        emissive: 0x000000,
        emissiveMap: null,
        emissiveIntensity: 1,
        envMap: null,
        reflectivity: 1,
        refractionRatio: 0.98,
        combine: THREE.MultiplyOperation,
        normalMap: null,
        normalScale: new THREE.Vector2(1, 1),
        specularMap: null,
    };

    const phongGUI = materialGUI.addFolder('Phong');
    const phongProperties = {
        aoMap: null,
        aoMapIntensity: 1,
        bumpMap: null,
        bumpScale: 1,
        color: 0xff6666,
        map: null,
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        emissive: 0x000000,
        emissiveMap: null,
        emissiveIntensity: 1,
        envMap: null,
        reflectivity: 1,
        refractionRatio: 0.98,
        combine: THREE.MultiplyOperation,
        normalMap: null,
        normalScale: new THREE.Vector2(1, 1),
        specular: 0x111111,
        specularMap: null,
    };

    const physicalGUI = materialGUI.addFolder('Physcial');
    const physicalProperties = {
        aoMap: null,
        aoMapIntensity: 1,
        bumpMap: null,
        bumpScale: 1,
        clearcoat: 0,
        clearcoatRoughness: 0,
        color: 0x6699ff,
        map: null,
        displacementMap: null,
        displacementScale: 1,
        displacementBias: 0,
        envMap: null,
        envMapIntensity: 1,
        metalness: 0,
        metalnessMap: null,
        normalMap: null,
        normalScale: new THREE.Vector2(1, 1),
        reflectivity: 0.5,
        ior: 1.5,
        roughness: 1.0,
        roughnessMap: null,
        sheen: 0,
        sheenRoughness: 1,
        sheenColor: 0x000000,
        specularColor: 0x111111,
        specularIntensity: 1.0,
        thickness: 0,
        transmission: 0,
    };

    setupCommonMaterialGUI(
        commonGUI, commonProperties,
        lambertProperties, phongProperties, physicalProperties,
        cone, cylinder, sphere, notifyParent
    );
    setupLambertGUI(lambertGUI, cone, commonProperties, lambertProperties, textures, envMaps.cone, notifyParent);
    setupPhongGUI(phongGUI, cylinder, commonProperties, phongProperties, textures, envMaps.cylinder, notifyParent);
    setupPhysicalGUI(physicalGUI, sphere, commonProperties, physicalProperties, textures, envMaps.sphere, notifyParent);

    materialGUI.close();
    commonGUI.close();
    lambertGUI.close();
    phongGUI.close();
    physicalGUI.close();
}

function setupCommonMaterialGUI(
    gui, commonProperties, lambertProperties, phongProperties, physicalProperties,
    cone, cylinder, sphere, notifyParent
) {
    gui
        .add(commonProperties, 'dithering')
        .name("Dithering");

    gui.add(commonProperties, 'flatShading')
        .name("Flat Shading");

    const transparentController = gui.add(commonProperties, 'transparent');
    transparentController.name("Transparent");

    const opacityController = gui.add(commonProperties, 'opacity', 0, 1, 0.1);
    opacityController.name("Opacity");
    opacityController.disable(!commonProperties.transparent);

    transparentController.onChange((transparent) => { opacityController.disable(!transparent); });

    gui
        .add(commonProperties, 'precision', { High: "highp", Medium: "mediump", Low: "lowp" })
        .name("Precision");

    gui
        .add(commonProperties, 'side', { Front: THREE.FrontSide, Back: THREE.BackSide, Double: THREE.DoubleSide })
        .name("Side");

    gui
        .add(commonProperties, 'visible')
        .name("Visible");

    gui
        .add(commonProperties, 'wireframe')
        .name("Wireframe");

    gui.onChange(onChange);
    function onChange() {
        const lambert = new THREE.MeshLambertMaterial();
        lambert.setValues(commonProperties);
        lambert.setValues(lambertProperties);
        cone.material = lambert;

        const phong = new THREE.MeshPhongMaterial();
        phong.setValues(commonProperties);
        phong.setValues(phongProperties);
        cylinder.material = phong;

        const physical = new THREE.MeshPhysicalMaterial();
        physical.setValues(commonProperties);
        physical.setValues(physicalProperties);
        sphere.material = physical;

        notifyParent();
    }
}

function setupLambertGUI(gui, cone, commonProperties, properties, textures, envMaps, notifyParent) {
    const textureNames = textures
        .filter((texture) => !texture.support.physical)
        .map((texture) => texture.name);
    textureNames.unshift('None');

    const aoMapController = gui.add({ aoMap: 'None' }, 'aoMap', textureNames);
    aoMapController.name("AO Map");

    const aoIntensityController = gui.add(properties, 'aoMapIntensity', 0, 1, 0.01);
    aoIntensityController.name("AO Intensity");
    aoIntensityController.onChange(onChange);
    aoIntensityController.disable(properties.aoMap == null);

    aoMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.aoMap = null;
            aoIntensityController.disable(true);
        } else {
            properties.aoMap = texture.ao;
            aoIntensityController.disable(false);
        }
        onChange();
    });

    const bumpMapNames = textures
        .filter((texture) => !texture.support.physical && texture.support.bump)
        .map((texture) => texture.name);
    bumpMapNames.unshift('None');
    const bumpMapController = gui.add({ bumpMap: 'None' }, 'bumpMap', bumpMapNames);
    bumpMapController.name("Bump Map");

    const bumpScaleController = gui.add(properties, 'bumpScale', 0, 1, 0.01);
    bumpScaleController.name("Bump Scale");
    bumpScaleController.onChange(onChange);
    bumpScaleController.disable(properties.bumpMap == null);

    bumpMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.bumpMap = null;
            bumpScaleController.disable(true);
        } else {
            properties.bumpMap = texture.bump;
            bumpScaleController.disable(false);
        }
        onChange();
    });

    const mapController = gui.add({ map: 'None' }, 'map', textureNames);
    mapController.name("Color Map");

    const colorController = gui.addColor(properties, 'color');
    colorController.name("Color");
    colorController.listen();
    colorController.onChange(onChange);
    colorController.disable(properties.map != null);

    mapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.map = null;
            colorController.disable(false);
        } else {
            properties.color = 0xffffff;
            properties.map = texture.diffuse;
            colorController.disable(true);
        }
        onChange();
    });

    const displacementController = gui.add({ displacement: 'None' }, 'displacement', textureNames);
    displacementController.name("Displacement Map");

    const displacementScaleController = gui.add(properties, 'displacementScale', 0, 1, 0.01);
    displacementScaleController.name("Displacement Scale");
    displacementScaleController.onChange(onChange);
    displacementScaleController.disable(properties.displacementMap == null);

    const displacementBiasController = gui.add(properties, 'displacementBias', 0, 10, 0.01);
    displacementBiasController.name("Displacement Bias");
    displacementBiasController.onChange(onChange);
    displacementBiasController.disable(properties.displacementMap == null);

    displacementController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.displacementMap = null;
            displacementScaleController.disable(true);
            displacementBiasController.disable(true);
        } else {
            properties.displacementMap = texture.displacement;
            displacementScaleController.disable(false);
            displacementBiasController.disable(false);
        }
        onChange();
    });

    gui
        .addColor(properties, 'emissive')
        .name("Emissive")
        .listen()
        .onChange(onChange);

    const emissiveMapNames = textures
        .filter((texture) => !texture.support.physical && texture.support.emissive)
        .map((texture) => texture.name);
    emissiveMapNames.unshift('None');
    gui
        .add({ emissive: 'None' }, 'emissive', emissiveMapNames)
        .name("Emissive Map")
        .onChange((textureName) => {
            const texture = textures.find((texture) => texture.name === textureName);
            if (typeof texture === "undefined") {
                properties.emissiveMap = null;
                properties.emissive = 0x000000;
            } else {
                properties.emissiveMap = texture.emissive;
                properties.emissive = 0xffffff;
            }
            onChange();
        });

    gui
        .add(properties, 'emissiveIntensity', 0, 40, 0.1)
        .name("Emissive Intensity")
        .onChange(onChange);

    const envMapController = gui
        .add(properties, 'envMap', envMaps)
        .name("Env. Map");

    const envMappingController = gui
        .add({ mapping: 'Reflection' }, 'mapping', ['Reflection', 'Refraction'])
        .name("Mapping")
        .disable(true)
        .onChange((mapping) => {
            if (mapping === 'Reflection') {
                if (properties.envMap == envMaps.InSitu) {
                    properties.envMap.mapping = THREE.CubeReflectionMapping;
                } else {
                    properties.envMap.mapping = THREE.EquirectangularReflectionMapping;
                }
            } else {
                if (properties.envMap == envMaps.InSitu) {
                    properties.envMap.mapping = THREE.CubeRefractionMapping;
                } else {
                    properties.envMap.mapping = THREE.EquirectangularRefractionMapping;
                }
            }
            onChange();
        });

    const reflectivityController = gui
        .add(properties, 'reflectivity', 0, 1, 0.01)
        .name("Reflectivity")
        .disable(true)
        .onChange(onChange);

    const iorController = gui
        .add(properties, 'refractionRatio', 0, 1, 0.01)
        .name("IOR")
        .disable(true)
        .onChange(onChange);

    const combineController = gui
        .add(properties, 'combine', { Multiply: THREE.MultiplyOperation, Mix: THREE.MixOperation, Add: THREE.AddOperation })
        .name("Combine")
        .disable(true)
        .onChange(onChange);

    envMapController.onChange((envMap) => {
        envMappingController.disable(envMap == null);
        reflectivityController.disable(envMap == null);
        iorController.disable(envMap == null);
        combineController.disable(envMap == null)
        if (envMap != null) { properties.color = 0xffffff; }
        onChange();
    });

    const normalMapController = gui.add({ normal: 'None' }, 'normal', textureNames);
    normalMapController.name("Normal Map");

    const normalScaleXController = gui.add(properties.normalScale, 'x', -1, 1, 0.01);
    normalScaleXController.name("Normal Scale X");
    normalScaleXController.onChange(onChange);
    normalScaleXController.disable(properties.normalMap == null);

    const normalScaleYController = gui.add(properties.normalScale, 'y', -1, 1, 0.01);
    normalScaleYController.name("Normal Scale Y");
    normalScaleYController.onChange(onChange);
    normalScaleYController.disable(properties.normalMap == null);

    normalMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.normalMap = null;
            normalScaleXController.disable(true);
            normalScaleYController.disable(true);
        } else {
            properties.normalMap = texture.normal;
            normalScaleXController.disable(false);
            normalScaleYController.disable(false);
        }
        onChange();
    });

    const specularMapNames = textures
        .filter((texture) => !texture.support.physical && texture.support.specular)
        .map((texture) => texture.name);
    specularMapNames.unshift('None');

    gui
        .add({ specular: 'None' }, 'specular', specularMapNames)
        .name("Specular Map")
        .onChange((textureName) => {
            const texture = textures.find((texture) => texture.name === textureName);
            if (typeof texture === "undefined") {
                properties.specularMap = null;
            } else {
                properties.specularMap = texture.specular;
            }
            onChange();
        });

    function onChange() {
        const lambert = new THREE.MeshLambertMaterial();
        lambert.setValues(commonProperties);
        lambert.setValues(properties);
        cone.material = lambert;

        notifyParent();
    }
}

function setupPhongGUI(gui, cylinder, commonProperties, properties, textures, envMaps, notifyParent) {
    const textureNames = textures
        .filter((texture) => !texture.support.physical)
        .map((texture) => texture.name);
    textureNames.unshift('None');

    const aoMapController = gui.add({ aoMap: 'None' }, 'aoMap', textureNames);
    aoMapController.name("AO Map");

    const aoIntensityController = gui.add(properties, 'aoMapIntensity', 0, 1, 0.01);
    aoIntensityController.name("AO Intensity");
    aoIntensityController.onChange(onChange);
    aoIntensityController.disable(properties.aoMap == null);

    aoMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.aoMap = null;
            aoIntensityController.disable(true);
        } else {
            properties.aoMap = texture.ao;
            aoIntensityController.disable(false);
        }
        onChange();
    });

    const bumpMapNames = textures
        .filter((texture) => !texture.support.physical && texture.support.bump)
        .map((texture) => texture.name);
    bumpMapNames.unshift('None');
    const bumpMapController = gui.add({ bumpMap: 'None' }, 'bumpMap', bumpMapNames);
    bumpMapController.name("Bump Map");

    const bumpScaleController = gui.add(properties, 'bumpScale', 0, 1, 0.01);
    bumpScaleController.name("Bump Scale");
    bumpScaleController.onChange(onChange);
    bumpScaleController.disable(properties.bumpMap == null);

    bumpMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.bumpMap = null;
            bumpScaleController.disable(true);
        } else {
            properties.bumpMap = texture.bump;
            bumpScaleController.disable(false);
        }
        onChange();
    });

    const mapController = gui.add({ map: 'None' }, 'map', textureNames);
    mapController.name("Color Map");

    const colorController = gui.addColor(properties, 'color');
    colorController.name("Color");
    colorController.listen();
    colorController.onChange(onChange);
    colorController.disable(properties.map != null);

    mapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.map = null;
            colorController.disable(false);
        } else {
            properties.color = 0xffffff;
            properties.map = texture.diffuse;
            colorController.disable(true);
        }
        onChange();
    });

    const displacementController = gui.add({ displacement: 'None' }, 'displacement', textureNames);
    displacementController.name("Displacement Map");

    const displacementScaleController = gui.add(properties, 'displacementScale', 0, 1, 0.01);
    displacementScaleController.name("Displacement Scale");
    displacementScaleController.onChange(onChange);
    displacementScaleController.disable(properties.displacementMap == null);

    const displacementBiasController = gui.add(properties, 'displacementBias', 0, 10, 0.01);
    displacementBiasController.name("Displacement Bias");
    displacementBiasController.onChange(onChange);
    displacementBiasController.disable(properties.displacementMap == null);

    displacementController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.displacementMap = null;
            displacementScaleController.disable(true);
            displacementBiasController.disable(true);
        } else {
            properties.displacementMap = texture.displacement;
            displacementScaleController.disable(false);
            displacementBiasController.disable(false);
        }
        onChange();
    });

    gui
        .addColor(properties, 'emissive')
        .name("Emissive")
        .listen()
        .onChange(onChange);

    const emissiveMapNames = textures
        .filter((texture) => !texture.support.physical && texture.support.emissive)
        .map((texture) => texture.name);
    emissiveMapNames.unshift('None');
    gui
        .add({ emissive: 'None' }, 'emissive', emissiveMapNames)
        .name("Emissive Map")
        .onChange((textureName) => {
            const texture = textures.find((texture) => texture.name === textureName);
            if (typeof texture === "undefined") {
                properties.emissiveMap = null;
                properties.emissive = 0x000000;
            } else {
                properties.emissiveMap = texture.emissive;
                properties.emissive = 0xffffff;
            }
            onChange();
        });

    gui
        .add(properties, 'emissiveIntensity', 0, 40, 0.1)
        .name("Emissive Intensity")
        .onChange(onChange);

    const envMapController = gui
        .add(properties, 'envMap', envMaps)
        .name("Env. Map");

    const envMappingController = gui
        .add({ mapping: 'Reflection' }, 'mapping', ['Reflection', 'Refraction'])
        .name("Mapping")
        .disable(true)
        .onChange((mapping) => {
            if (mapping === 'Reflection') {
                if (properties.envMap == envMaps.InSitu) {
                    properties.envMap.mapping = THREE.CubeReflectionMapping;
                } else {
                    properties.envMap.mapping = THREE.EquirectangularReflectionMapping;
                }
            } else {
                if (properties.envMap == envMaps.InSitu) {
                    properties.envMap.mapping = THREE.CubeRefractionMapping;
                } else {
                    properties.envMap.mapping = THREE.EquirectangularRefractionMapping;
                }
            }
            onChange();
        });

    const reflectivityController = gui
        .add(properties, 'reflectivity', 0, 1, 0.01)
        .name("Reflectivity")
        .disable(true)
        .onChange(onChange);

    const iorController = gui
        .add(properties, 'refractionRatio', 0, 1, 0.01)
        .name("IOR")
        .disable(true)
        .onChange(onChange);

    const combineController = gui
        .add(properties, 'combine', { Multiply: THREE.MultiplyOperation, Mix: THREE.MixOperation, Add: THREE.AddOperation })
        .name("Combine")
        .disable(true)
        .onChange(onChange);

    envMapController.onChange((envMap) => {
        envMappingController.disable(envMap == null);
        reflectivityController.disable(envMap == null);
        iorController.disable(envMap == null);
        combineController.disable(envMap == null);
        if (envMap != null) { properties.color = 0xffffff; }
        onChange();
    });

    const normalMapController = gui.add({ normal: 'None' }, 'normal', textureNames);
    normalMapController.name("Normal Map");

    const normalScaleXController = gui.add(properties.normalScale, 'x', 0, 1, 0.01);
    normalScaleXController.name("Normal Scale X");
    normalScaleXController.onChange(onChange);
    normalScaleXController.disable(properties.normalMap == null);

    const normalScaleYController = gui.add(properties.normalScale, 'y', 0, 1, 0.01);
    normalScaleYController.name("Normal Scale Y");
    normalScaleYController.onChange(onChange);
    normalScaleYController.disable(properties.normalMap == null);

    normalMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.normalMap = null;
            normalScaleXController.disable(true);
            normalScaleYController.disable(true);
        } else {
            properties.normalMap = texture.normal;
            normalScaleXController.disable(false);
            normalScaleYController.disable(false);
        }
        onChange();
    });

    gui
        .addColor(properties, 'specular')
        .name("Specular")
        .listen()
        .onChange(onChange);

    const specularMapNames = textures
        .filter((texture) => !texture.support.physical && texture.support.specular)
        .map((texture) => texture.name);
    specularMapNames.unshift('None');

    gui
        .add({ specular: 'None' }, 'specular', specularMapNames)
        .name("Specular Map")
        .onChange((textureName) => {
            const texture = textures.find((texture) => texture.name === textureName);
            if (typeof texture === "undefined") {
                properties.specularMap = null;
            } else {
                properties.specularMap = texture.specular;
                properties.specular = 0xffffff;
            }
            onChange();
        });

    function onChange() {
        const phong = new THREE.MeshPhongMaterial();
        phong.setValues(commonProperties);
        phong.setValues(properties);
        cylinder.material = phong;

        notifyParent();
    }
}

function setupPhysicalGUI(gui, sphere, commonProperties, properties, textures, envMaps, notifyParent) {
    const textureNames = textures
        .filter((texture) => texture.support.physical)
        .map((texture) => texture.name);
    textureNames.unshift('None');

    const aoTextureNames = textures
        .filter((texture) => texture.support.physical && texture.support.ao)
        .map((texture) => texture.name);
    aoTextureNames.unshift('None');
    const aoMapController = gui.add({ aoMap: 'None' }, 'aoMap', aoTextureNames);
    aoMapController.name("AO Map");

    const aoIntensityController = gui.add(properties, 'aoMapIntensity', 0, 1, 0.01);
    aoIntensityController.name("AO Intensity");
    aoIntensityController.onChange(onChange);
    aoIntensityController.disable(properties.aoMap == null);

    aoMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.aoMap = null;
            aoIntensityController.disable(true);
        } else {
            properties.aoMap = texture.ao;
            aoIntensityController.disable(false);
        }
        onChange();
    });

    const bumpMapController = gui.add({ bumpMap: 'None' }, 'bumpMap', textureNames);
    bumpMapController.name("Bump Map");

    const bumpScaleController = gui.add(properties, 'bumpScale', 0, 1, 0.01);
    bumpScaleController.name("Bump Scale");
    bumpScaleController.onChange(onChange);
    bumpScaleController.disable(properties.bumpMap == null);

    bumpMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.bumpMap = null;
            bumpScaleController.disable(true);
        } else {
            properties.bumpMap = texture.bump;
            bumpScaleController.disable(false);
        }
        onChange();
    });

    gui
        .add(properties, 'clearcoat', 0, 1, 0.01)
        .name("Clearcoat")
        .onChange(onChange);

    gui
        .add(properties, 'clearcoatRoughness', 0, 1, 0.01)
        .name("Clearcoat Roughness")
        .onChange(onChange);

    const mapController = gui.add({ map: 'None' }, 'map', textureNames);
    mapController.name("Color Map");

    const colorController = gui.addColor(properties, 'color');
    colorController.name("Color");
    colorController.listen();
    colorController.onChange(onChange);
    colorController.disable(properties.map != null);

    mapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.map = null;
            colorController.disable(false);
        } else {
            properties.color = 0xffffff;
            properties.map = texture.diffuse;
            colorController.disable(true);
        }
        onChange();
    });

    const displacementController = gui.add({ displacement: 'None' }, 'displacement', textureNames);
    displacementController.name("Displacement Map");

    const displacementScaleController = gui.add(properties, 'displacementScale', 0, 1, 0.01);
    displacementScaleController.name("Displacement Scale");
    displacementScaleController.onChange(onChange);
    displacementScaleController.disable(properties.displacementMap == null);

    const displacementBiasController = gui.add(properties, 'displacementBias', 0, 10, 0.01);
    displacementBiasController.name("Displacement Bias");
    displacementBiasController.onChange(onChange);
    displacementBiasController.disable(properties.displacementMap == null);

    displacementController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.displacementMap = null;
            displacementScaleController.disable(true);
            displacementBiasController.disable(true);
        } else {
            properties.displacementMap = texture.displacement;
            displacementScaleController.disable(false);
            displacementBiasController.disable(false);
        }
        onChange();
    });

    const envMapController = gui
        .add(properties, 'envMap', envMaps)
        .name("Env. Map");

    const envMapIntensityController = gui
        .add(properties, 'envMapIntensity', 0, 1, 0.01)
        .name("Env. Map Intensity")
        .disable(true)
        .onChange(onChange);

    envMapController.onChange((envMap) => {
        envMapIntensityController.disable(envMap === null);
        if (envMap != null) { properties.color = 0xffffff; }
        onChange();
    });

    gui
        .add(properties, 'metalness', 0, 1, 0.1)
        .name("Metalness")
        .listen()
        .onChange(onChange);

    gui
        .add({ metalness: 'None' }, 'metalness', textureNames)
        .name("Metalness Map")
        .onChange((textureName) => {
            const texture = textures.find((texture) => texture.name === textureName);
            if (typeof texture === "undefined") {
                properties.metalnessMap = null;
            } else {
                properties.metalnessMap = texture.metal;
                properties.metalness = 1;
            }
            onChange();
        });

    const normalMapController = gui.add({ normal: 'None' }, 'normal', textureNames);
    normalMapController.name("Normal Map");

    const normalScaleXController = gui.add(properties.normalScale, 'x', 0, 1, 0.01);
    normalScaleXController.name("Normal Scale X");
    normalScaleXController.onChange(onChange);
    normalScaleXController.disable(properties.normalMap == null);

    const normalScaleYController = gui.add(properties.normalScale, 'y', 0, 1, 0.01);
    normalScaleYController.name("Normal Scale Y");
    normalScaleYController.onChange(onChange);
    normalScaleYController.disable(properties.normalMap == null);

    normalMapController.onChange((textureName) => {
        const texture = textures.find((texture) => texture.name === textureName);
        if (typeof texture === "undefined") {
            properties.normalMap = null;
            normalScaleXController.disable(true);
            normalScaleYController.disable(true);
        } else {
            properties.normalMap = texture.normal;
            normalScaleXController.disable(false);
            normalScaleYController.disable(false);
        }
        onChange();
    });

    gui
        .add(properties, 'reflectivity', 0, 1, 0.01)
        .name("Reflectivity")
        .onChange(onChange);

    gui
        .add(properties, 'ior', 1, 2.333, 0.01)
        .name("IOR")
        .onChange(onChange);

    gui
        .add(properties, 'roughness', 0, 1, 0.01)
        .name("Roughness")
        .onChange(onChange);

    gui
        .add({ roughness: 'None' }, 'roughness', textureNames)
        .name("Roughness Map")
        .onChange((textureName) => {
            const texture = textures.find((texture) => texture.name === textureName);
            if (typeof texture === "undefined") {
                properties.roughnessMap = null;
            } else {
                properties.roughnessMap = texture.rough;
            }
            onChange();
        });

    gui
        .add(properties, 'sheen', 0, 1, 0.01)
        .name("Sheen")
        .onChange(onChange);

    gui
        .add(properties, 'sheenRoughness', 0, 1, 0.01)
        .name("Sheen Roughness")
        .onChange(onChange);

    gui
        .addColor(properties, 'sheenColor')
        .name("Sheen Color")
        .onChange(onChange);

    gui
        .addColor(properties, 'specularColor')
        .name("Specular Color")
        .onChange(onChange);

    gui
        .add(properties, 'specularIntensity', 0, 1, 0.01)
        .name("Specular Intensity")
        .onChange(onChange);

    gui
        .add(properties, 'thickness', 0, 5, 0.1)
        .name("Thickness")
        .onChange(onChange);

    gui
        .add(properties, 'transmission', 0, 1, 0.01)
        .name("Transmission")
        .onChange(onChange);

    function onChange() {
        const physical = new THREE.MeshPhysicalMaterial();
        physical.setValues(commonProperties);
        physical.setValues(properties);
        sphere.material = physical;

        notifyParent();
    }
}