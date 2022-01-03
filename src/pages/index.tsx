import * as THREE from 'three'
import {
  Canvas,
  extend,
  useFrame,
  useLoader,
  useThree,
} from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { OrbitControls, Reflector, Sky, useTexture } from '@react-three/drei'
import { GLTFLoader, Water } from 'three-stdlib'

extend({ Water })

const HPI = Math.PI / 2
const vec = new THREE.Vector3()
const obj = new THREE.Object3D()
const red = new THREE.Color('#900909')

function Ocean() {
  const ref = useRef<any>()
  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(THREE.TextureLoader, '/waternormals.jpeg')
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  const geom = useMemo(() => new THREE.PlaneGeometry(10000, 10000), [])
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
      format: gl.encoding,
    }),
    [gl.encoding, waterNormals]
  )
  useFrame(
    (state, delta) => (ref.current.material.uniforms.time.value += delta)
  )
  // @ts-ignore
  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} />
}

function Ground() {
  const [floor, normal] = useTexture([
    // '/SurfaceImperfections003_1K_var1.jpg',
    '/SurfaceImperfections003_1K_Normal.jpg',
    '/SurfaceImperfections003_1K_Normal.jpg',
  ])
  return (
    // @ts-ignore
    <Reflector
      position={[0, -0.225, 0]}
      resolution={512}
      args={[10, 10]}
      mirror={0}
      mixBlur={1}
      mixStrength={1}
      // @ts-ignore
      rotation={[-HPI, 0, HPI]}
      blur={[400, 50]}
      scale={100}
    >
      {(Material, props) => (
        <Material
          color='#7585B5'
          metalness={0.5}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[1, 1]}
          {...props}
        />
      )}
    </Reflector>
  )
}

function Box() {
  const ref = useRef<any>()
  useFrame((state, delta) => {
    ref.current.position.y = 10 + Math.sin(state.clock.elapsedTime) * 20
    ref.current.rotation.x =
      ref.current.rotation.y =
      ref.current.rotation.z +=
        delta
  })
  return (
    <mesh ref={ref} scale={20}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}

const DOM = () => {
  const [plants1, setPlants1] = useState(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load('plants1.gltf', async (gltf) => {
      const nodes = await gltf.parser.getDependencies('node')
      setPlants1(nodes[0])
    })
  }, [])

  return (
    <>
      <Canvas camera={{ position: [0, 5, 100], fov: 55, near: 1, far: 20000 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 0]} intensity={1.5} />
        <directionalLight position={[-10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 20, 0]} intensity={1.5} />
        <directionalLight position={[0, -10, 0]} intensity={0.25} />
        <Suspense fallback={null}>
          <group position-y={-0.25}>
            <Ground />
            <Box />
          </group>
          <primitive object={plants1} />
        </Suspense>
        {/* @ts-ignore */}
        <Sky scale={1000} sunPosition={[500, 150, -1000]} turbidity={0.1} />
        <OrbitControls
          addEventListener={() => {}}
          hasEventListener={() => {}}
          removeEventListener={() => {}}
          dispatchEvent={() => {}}
        />
      </Canvas>
    </>
  )
}

const Page = () => {
  return (
    <>
      <DOM />
    </>
  )
}

export default Page

export async function getStaticProps() {
  return {
    props: {
      title: 'Index',
    },
  }
}
