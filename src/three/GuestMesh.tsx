import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { useGame } from '../store'

const bodyGeo = new THREE.CapsuleGeometry(0.22, 0.42, 4, 10)
const headGeo = new THREE.SphereGeometry(0.17, 14, 10)
const ringGeo = new THREE.RingGeometry(0.34, 0.47, 28)
const ringMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide })

const matCache = new Map<string, THREE.MeshStandardMaterial>()
export function guestMat(color: string, selected = false) {
  const key = color + (selected ? '|s' : '')
  let m = matCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05 })
    if (selected) {
      m.emissive = new THREE.Color('#ffffff')
      m.emissiveIntensity = 0.12
    }
    matCache.set(key, m)
  }
  return m
}

function setCursor(c: string) {
  document.body.style.cursor = c
}

interface Props {
  id: number
  x: number
  z: number
  color: string
  selected: boolean
  onTap: (id: number) => void
}

/** A guest standing in the queue or on a load-zone circle. Walks (lerps) to its target. */
export function GuestMesh({ id, x, z, color, selected, onTap }: Props) {
  const ref = useRef<THREE.Group>(null!)
  const seed = useMemo(() => Math.random() * Math.PI * 2, [])
  const spawned = useRef(false)

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    if (!spawned.current) {
      g.position.set(x, 0, z + 5) // new arrivals walk in from the back of the queue
      spawned.current = true
    }
    const k = Math.min(1, dt * 3.5)
    g.position.x += (x - g.position.x) * k
    g.position.z += (z - g.position.z) * k
    const moving = Math.hypot(x - g.position.x, z - g.position.z) > 0.1
    g.position.y = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 9 + seed)) * 0.09 : 0
    // Overfull-row feedback: selected guests shake while the row flashes red.
    let shake = 0
    if (selected) {
      const flash = useGame.getState().flashRow
      if (flash && Date.now() < flash.until) shake = Math.sin(state.clock.elapsedTime * 45) * 0.18
    }
    g.rotation.z = shake
  })

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        onTap(id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setCursor('pointer')
      }}
      onPointerOut={() => setCursor('auto')}
    >
      <mesh geometry={bodyGeo} material={guestMat(color, selected)} position={[0, 0.56, 0]} castShadow />
      <mesh geometry={headGeo} material={guestMat(color, selected)} position={[0, 1.05, 0]} castShadow />
      {selected && (
        <mesh geometry={ringGeo} material={ringMat} rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} />
      )}
    </group>
  )
}

const seatedBodyGeo = new THREE.CapsuleGeometry(0.22, 0.28, 4, 10)

/** A guest seated in the vehicle (rendered inside the moving train group). */
export function SeatedGuest({
  fromX,
  fromZ,
  x,
  z,
  color,
}: {
  fromX: number
  fromZ: number
  x: number
  z: number
  color: string
}) {
  const ref = useRef<THREE.Group>(null!)
  const spawned = useRef(false)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    if (!spawned.current) {
      g.position.set(fromX, 0, fromZ)
      spawned.current = true
    }
    const k = Math.min(1, dt * 5)
    g.position.x += (x - g.position.x) * k
    g.position.z += (z - g.position.z) * k
  })
  return (
    <group ref={ref}>
      <mesh geometry={seatedBodyGeo} material={guestMat(color)} position={[0, 0.62, 0]} castShadow />
      <mesh geometry={headGeo} material={guestMat(color)} position={[0, 1.0, 0]} castShadow />
    </group>
  )
}
