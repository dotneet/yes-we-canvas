import * as THREE from 'three'

export function loadImage (image) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(image, (texture) => {
      texture.minFilter = THREE.LinearFilter
      resolve(texture)
    }, null, (e) => {
      reject(e)
    })
  })
}

