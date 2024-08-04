import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

const draco = new DRACOLoader();
draco.setDecoderConfig({ type: 'js' });
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')

export function loadGLTFModel(
  scene,
  glbPath,
  options = { receiveShadow: true, castShadow: true },
  position = { x: 0, y: 0, z: 0 },
  name = ""
) {
  const { receiveShadow, castShadow } = options
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco);

    loader.load(
      glbPath,
      gltf => {
        const obj = gltf.scene
        obj.name = name
        obj.position.x = position.x
        obj.position.y = position.y
        obj.position.z = position.z
        obj.receiveShadow = receiveShadow
        obj.castShadow = castShadow
        scene.add(obj)

        obj.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = castShadow
            child.receiveShadow = receiveShadow
          }
        })
        resolve(obj)
      },
      undefined,
      function(error) {
        reject(error)
      }
    )
  })
}
