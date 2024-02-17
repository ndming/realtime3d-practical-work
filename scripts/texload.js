import * as THREE from 'three';

export { initializeTextures };

const specularMapTypes = [ 'ao', 'bump', 'diffuse', 'displacement', 'normal', 'specular' ];
const emissiveMapTypes = [ 'ao', 'diffuse', 'displacement', 'emissive', 'normal' ];

function initializeTextures() {
    const textures = [];
    const loader = new THREE.TextureLoader();

    textures.push(loadTextures(loader, '/textures/nightly_castle', emissiveMapTypes, 'jpg', {
        bump: false,
        emissive: true,
        specular: false,
    }));
    textures.push(loadTextures(loader, '/textures/penny_tile', specularMapTypes, 'png', {
        bump: true,
        emissive: false,
        specular: true,
    }));
    textures.push(loadTextures(loader, '/textures/rocky_ground', specularMapTypes, 'jpg', {
        bump: true,
        emissive: false,
        specular: true,
    }));
    textures.push(loadTextures(loader, '/textures/rusted_iron', specularMapTypes, 'png', {
        bump: false,
        emissive: false,
        specular: true,
    }));
    textures.push(loadTextures(loader, '/textures/whitewashed_brick', specularMapTypes, 'png', {
        bump: true,
        emissive: false,
        specular: true,
    }));
    textures.push(loadTextures(loader, '/textures/worn_plastic', specularMapTypes, 'png', {
        bump: true,
        emissive: false,
        specular: true,
    }));

    return textures;
}

function loadTextures(loader, folder, mapTypes, suffix, support) {
    const texture = {};
    const titleCase = (s) => s
        .replace (/^[-_]*(.)/, (_, c) => c.toUpperCase())
        .replace (/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase());
    texture['name'] = titleCase(folder.substring(folder.lastIndexOf('/') + 1));
    texture['support'] = support;
    
    for (const mapType of mapTypes) {
        const map = loader.load(`${folder}/${mapType}.${suffix}`);
        map.colorSpace = THREE.SRGBColorSpace;
        texture[mapType] = map;
    }
    return texture;
}