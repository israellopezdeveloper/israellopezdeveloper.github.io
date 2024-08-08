import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react'
import * as THREE from 'three'
import { sRGBEncoding } from 'three'
import { loadGLTFModel } from '../libs/model'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { KoalaContainer } from './voxel-koala-loader'
import gsap from 'gsap'

const VoxelKoala = forwardRef(function VoxelKoala(props, ref) {
  // References
  const refContainer = useRef()
  const refRenderer = useRef()
  const refCamera = useRef()

  // URLS
  const urlKoalaMainGLB = (process.env.NODE_ENV === 'production' ? '' : '') + '/koala_main.glb'
  const urlKoalaWorkGLB = (process.env.NODE_ENV === 'production' ? '' : '') + '/koala_work.glb'
  const urlKoalaEducationGLB = (process.env.NODE_ENV === 'production' ? '' : '') + '/koala_education.glb'

  const position_main = useMemo(() => (new THREE.Vector3(85, 0, 0)), [])
  const position_work = useMemo(() => (new THREE.Vector3(0, 95, 0)), [])
  const position_education = useMemo(() => (new THREE.Vector3(-85, 0, 0)), [])

  const handleWindowResize = useCallback(() => {
    const { current: renderer } = refRenderer
    const { current: container } = refContainer
    const { current: camera } = refCamera
    if (container && renderer && camera) {
      const newAspect = container.clientWidth / container.clientHeight

      camera.left = 10 * newAspect / -2
      camera.right = 10 * newAspect / 2
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
  }, [])


  useEffect(() => {
    const { current: container } = refContainer
    if (container) {
      const models = []
      const scene = new THREE.Scene()
      function loadModel(url, position) {
        loadGLTFModel(scene, url, {
          receiveShadow: false,
          castShadow: false
        }, position).then((model) => {
          let pos = { x: position.x, y: position.y, z: position.z }
          pos.x += 15
          pos.y += 10
          pos.z += 20
          camera.position.copy(pos)
          models.push(model)
          animate()
        })
      }

      const scW = container.clientWidth
      const scH = container.clientHeight

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(scW, scH)
      renderer.outputEncoding = sRGBEncoding
      container.appendChild(renderer.domElement)
      refRenderer.current = renderer

      const light1 = new THREE.DirectionalLight(0xffffff, 2.5)
      scene.add(light1)
      const light2 = new THREE.AmbientLight(0xffffff, 1.0)
      scene.add(light2)

      const target = new THREE.Vector3(-3.5, 1.2, 0)
      const initialCameraPosition = new THREE.Vector3(20, 10, 20)

      // 640 -> 240
      // 8   -> 6
      const scale = scH * 0.005 + 4.8
      const camera = new THREE.OrthographicCamera(
        -scale,
        scale,
        scale,
        -scale,
        0.01,
        50000
      )
      refCamera.current = camera
      camera.position.copy(initialCameraPosition)
      camera.lookAt(target)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target = target
      controls.enabled = false
      controls.update()

      loadModel(urlKoalaWorkGLB, position_work)
      loadModel(urlKoalaMainGLB, position_main)
      loadModel(urlKoalaEducationGLB, position_education)

      let req = null
      const animate = () => {
        req = requestAnimationFrame(animate)
        models.forEach(model => {
          model.rotation.y += 0.003; // Ajusta la velocidad de rotación según sea necesario
        })
        renderer.render(scene, camera)
      }

      return () => {
        cancelAnimationFrame(req)
        renderer.domElement.remove()
        renderer.dispose()
      }
    }
  }, [position_education, position_main, position_work, urlKoalaEducationGLB, urlKoalaMainGLB, urlKoalaWorkGLB])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize, false)
    return () => {
      window.removeEventListener('resize', handleWindowResize, false)
    }
  }, [handleWindowResize])

  const animateCamera = (newPosition) => {
    let pos = { x: newPosition.x, y: newPosition.y, z: newPosition.z }
    pos.x += 15
    pos.y += 10
    pos.z += 20
    gsap.to(refCamera.current.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration: 1.2
    })
  }

  useImperativeHandle(ref, () => {
    return {
      to_main() {
        animateCamera(position_main)
      },
      to_work() {
        animateCamera(position_work)
      },
      to_education() {
        animateCamera(position_education)
      }
    }
  }, [position_work, position_main, position_education])

  return (
    <KoalaContainer ref={refContainer} {...props}>
    </KoalaContainer>
  )
})

export default VoxelKoala
