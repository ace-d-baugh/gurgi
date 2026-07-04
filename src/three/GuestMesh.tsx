import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { useGame } from '../store'

// Shared geometry for the articulated guest: torso, head, arms, legs.
const torsoGeo = new THREE.CapsuleGeometry(0.2, 0.3, 4, 10)
const headGeo = new THREE.SphereGeometry(0.155, 14, 10)
// Limbs are pivoted at the top: shift geometry down so rotation swings naturally.
const armGeo = new THREE.CapsuleGeometry(0.055, 0.3, 3, 8)
armGeo.translate(0, -0.19, 0)
const legGeo = new THREE.CapsuleGeometry(0.07, 0.3, 3, 8)
legGeo.translate(0, -0.19, 0)
const ringGeo = new THREE.RingGeometry(0.34, 0.47, 28)
const ringMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide })
const capGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.09, 12)
const brimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 12)

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
const skinMat = guestMat('#e8c39e')

function setCursor(c: string) {
  document.body.style.cursor = c
}

interface FigureProps {
  color: string
  selected?: boolean
  seated?: boolean
  /** limb swing phase driver ref — set by the parent's useFrame */
  swingRef?: React.MutableRefObject<number>
}

/**
 * The articulated body. Limb swing is applied by the owner each frame via
 * `swingRef.current` (radians); 0 = standing still.
 */
export function GuestFigure({ color, selected = false, seated = false, swingRef }: FigureProps) {
  const lArm = useRef<THREE.Mesh>(null!)
  const rArm = useRef<THREE.Mesh>(null!)
  const lLeg = useRef<THREE.Mesh>(null!)
  const rLeg = useRef<THREE.Mesh>(null!)
  useFrame(() => {
    const s = swingRef?.current ?? 0
    if (seated) {
      // knees forward, arms resting
      if (lLeg.current) lLeg.current.rotation.x = -1.4
      if (rLeg.current) rLeg.current.rotation.x = -1.4
      if (lArm.current) lArm.current.rotation.x = -0.4
      if (rArm.current) rArm.current.rotation.x = -0.4
      return
    }
    if (lArm.current) lArm.current.rotation.x = s
    if (rArm.current) rArm.current.rotation.x = -s
    if (lLeg.current) lLeg.current.rotation.x = -s
    if (rLeg.current) rLeg.current.rotation.x = s
  })
  const mat = guestMat(color, selected)
  return (
    <group>
      <mesh geometry={torsoGeo} material={mat} position={[0, seated ? 0.55 : 0.72, 0]} castShadow />
      <mesh geometry={headGeo} material={skinMat} position={[0, seated ? 0.98 : 1.15, 0]} castShadow />
      <mesh ref={lArm} geometry={armGeo} material={mat} position={[-0.26, seated ? 0.72 : 0.88, 0]} />
      <mesh ref={rArm} geometry={armGeo} material={mat} position={[0.26, seated ? 0.72 : 0.88, 0]} />
      <mesh ref={lLeg} geometry={legGeo} material={mat} position={[-0.1, seated ? 0.42 : 0.42, 0]} />
      <mesh ref={rLeg} geometry={legGeo} material={mat} position={[0.1, seated ? 0.42 : 0.42, 0]} />
    </group>
  )
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
  const swing = useRef(0)
  const seed = useMemo(() => Math.random() * Math.PI * 2, [])
  const spawned = useRef(false)

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    if (!spawned.current) {
      g.position.set(x, 0, z + 5)
      spawned.current = true
    }
    const k = Math.min(1, dt * 3.5)
    const dx = x - g.position.x
    const dz = z - g.position.z
    g.position.x += dx * k
    g.position.z += dz * k
    const moving = Math.hypot(dx, dz) > 0.1
    if (moving) {
      swing.current = Math.sin(state.clock.elapsedTime * 10 + seed) * 0.7
      g.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10 + seed)) * 0.05
      g.rotation.y = Math.atan2(dx, dz)
    } else {
      swing.current *= 0.85
      g.position.y = 0
      g.rotation.y += (0 - g.rotation.y) * Math.min(1, dt * 4)
    }
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
      <GuestFigure color={color} selected={selected} swingRef={swing} />
      {selected && (
        <mesh geometry={ringGeo} material={ringMat} rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} />
      )}
    </group>
  )
}

/** A guest seated in a vehicle (rendered inside the vehicle/platform group). */
export function SeatedGuest({
  fromX,
  fromZ,
  x,
  z,
  ry = 0,
  color,
}: {
  fromX: number
  fromZ: number
  x: number
  z: number
  ry?: number
  color: string
}) {
  const ref = useRef<THREE.Group>(null!)
  const spawned = useRef(false)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    if (!spawned.current) {
      g.position.set(fromX, 0, fromZ)
      g.rotation.y = ry
      spawned.current = true
    }
    const k = Math.min(1, dt * 5)
    g.position.x += (x - g.position.x) * k
    g.position.z += (z - g.position.z) * k
  })
  return (
    <group ref={ref}>
      <GuestFigure color={color} seated />
    </group>
  )
}

/** A rider who finished the ride: hops out and walks off screen to the right. */
export function LeavingGuest({
  fromX,
  fromZ,
  exitX,
  color,
}: {
  fromX: number
  fromZ: number
  exitX: number
  color: string
}) {
  const ref = useRef<THREE.Group>(null!)
  const swing = useRef(0)
  const seed = useMemo(() => Math.random() * Math.PI * 2, [])
  const spawned = useRef(false)
  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    if (!spawned.current) {
      g.position.set(fromX, 0, fromZ)
      spawned.current = true
    }
    // walk toward the exit lane, then off screen
    const tx = exitX
    const tz = -1.4
    const dx = tx - g.position.x
    const dz = tz - g.position.z
    const d = Math.hypot(dx, dz)
    const speed = 3.2 * dt
    if (d > 0.05) {
      g.position.x += (dx / d) * Math.min(speed, d)
      g.position.z += (dz / d) * Math.min(speed, d)
      g.rotation.y = Math.atan2(dx, dz)
    }
    swing.current = Math.sin(state.clock.elapsedTime * 10 + seed) * 0.7
    g.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 10 + seed)) * 0.05
  })
  return (
    <group ref={ref}>
      <GuestFigure color={color} swingRef={swing} />
    </group>
  )
}

/** The "grouper" attraction host at the front of the queue, facing the guests. */
export function GrouperHost({ x, z }: { x: number; z: number }) {
  const swing = useRef(0)
  useFrame((state) => {
    // a gentle idle sway so the host feels alive
    swing.current = Math.sin(state.clock.elapsedTime * 1.6) * 0.12
  })
  return (
    <group position={[x, 0, z]} rotation-y={0 /* faces +z, toward the queue */}>
      <GuestFigure color="#0063B2" swingRef={swing} />
      <mesh geometry={capGeo} material={guestMat('#6B2B9F')} position={[0, 1.3, 0]} castShadow />
      <mesh geometry={brimGeo} material={guestMat('#6B2B9F')} position={[0, 1.26, 0]} />
    </group>
  )
}
