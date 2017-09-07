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

export async function createSpriteFromImage (imageUrl) {
  const map = await loadImage(imageUrl)
  const material = new THREE.SpriteMaterial({map: map, color: 0xffffff, fog: true})
  return new THREE.Sprite(material)
}

