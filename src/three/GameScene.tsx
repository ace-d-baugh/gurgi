import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { useGame } from '../store'
import {
  CIRCLE_SPACING,
  CIRCLE_Z0,
  ROW_SPACING,
  SEAT_SPACING,
  TRACK_Z,
  circlePos,
  computeQueueTargets,
  queueBaseX,
  rowX,
  sceneFocus,
  totalRows,
  trainLength,
} from '../logic/layout'
import { GRAY, GUEST_COLORS, SINGLE_RIDER_COLOR, type RideConfig } from '../types'
import { GuestMesh } from './GuestMesh'
import { VehicleTrain } from './VehicleMesh'

const groundMat = new THREE.MeshStandardMaterial({ color: '#b7d9a8', roughness: 1 })
const platformMat = new THREE.MeshStandardMaterial({ color: '#e4e9ec', roughness: 0.9 })
const trackBedMat = new THREE.MeshStandardMaterial({ color: '#8d99a5', roughness: 1 })
const railMat = new THREE.MeshStandardMaterial({ color: '#5d6d7e', roughness: 0.5, metalness: 0.5 })
const circleMat = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.75,
})
const circleFlashMat = new THREE.MeshBasicMaterial({ color: '#E74C3C', side: THREE.DoubleSide })
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
const trunkMat = new THREE.MeshStandardMaterial({ color: '#8a5a3b', roughness: 1 })
const leafMat = new THREE.MeshStandardMaterial({ color: '#5fa052', roughness: 1 })
const fenceMat = new THREE.MeshStandardMaterial({ color: '#95A5A6', roughness: 0.7 })
const circleGeo = new THREE.RingGeometry(0.24, 0.32, 24)

function Tree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh material={trunkMat} position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.2, 8]} />
      </mesh>
      <mesh material={leafMat} position={[0, 1.7, 0]} castShadow>
        <icosahedronGeometry args={[0.9, 1]} />
      </mesh>
    </group>
  )
}

const planterMat = new THREE.MeshStandardMaterial({ color: '#c4bfb4', roughness: 0.9 })
const lampMat = new THREE.MeshStandardMaterial({ color: '#3b4652', roughness: 0.4, metalness: 0.5 })
const lampGlowMat = new THREE.MeshStandardMaterial({
  color: '#fff2c8',
  emissive: '#ffe9a8',
  emissiveIntensity: 0.9,
})

function Planter({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh material={planterMat} position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.44, 10]} />
      </mesh>
      <mesh material={leafMat} position={[0, 0.72, 0]} castShadow>
        <icosahedronGeometry args={[0.5, 1]} />
      </mesh>
    </group>
  )
}

function LampPost({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh material={lampMat} position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 2.6, 8]} />
      </mesh>
      <mesh material={lampGlowMat} position={[0, 2.7, 0]}>
        <sphereGeometry args={[0.18, 12, 8]} />
      </mesh>
    </group>
  )
}

function Environment({ config }: { config: RideConfig }) {
  const len = trainLength(config)
  const qx = queueBaseX(config)
  const platformW = len / 2 + 8 - qx
  const platformCX = (qx - 8 + len / 2 + 8) / 2
  const trees = useMemo(() => {
    const list: { x: number; z: number; s: number }[] = []
    for (let i = 0; i < 9; i++) {
      list.push({
        x: qx - 10 + i * ((len + 24) / 9) + ((i * 37) % 5) - 2,
        z: TRACK_Z - 5.5 - ((i * 53) % 4),
        s: 0.8 + ((i * 29) % 10) / 14,
      })
    }
    return list
  }, [len, qx])
  return (
    <group>
      <mesh material={groundMat} rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
      </mesh>
      {/* guest platform */}
      <mesh material={platformMat} position={[platformCX, -0.005, 4.5]} receiveShadow>
        <boxGeometry args={[platformW, 0.06, 18]} />
      </mesh>
      {/* track bed + rails */}
      <mesh material={trackBedMat} position={[0, -0.01, TRACK_Z]} receiveShadow>
        <boxGeometry args={[160, 0.04, Math.max(2.2, config.guestsPerRow * SEAT_SPACING + 1)]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          material={railMat}
          position={[0, 0.05, TRACK_Z + side * Math.max(0.7, (config.guestsPerRow * SEAT_SPACING) / 2 * 0.8)]}
        >
          <boxGeometry args={[160, 0.08, 0.09]} />
        </mesh>
      ))}
      {/* queue rails flanking the standby lane */}
      {[-1.1, 1.1].map((dx) => (
        <group key={dx}>
          <mesh material={fenceMat} position={[qx + dx, 0.42, 6.5]} castShadow>
            <boxGeometry args={[0.06, 0.06, 11]} />
          </mesh>
          {[2, 5, 8, 11].map((z) => (
            <mesh key={z} material={fenceMat} position={[qx + dx, 0.21, z]}>
              <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
            </mesh>
          ))}
        </group>
      ))}
      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}
      {/* dress up the open plaza to the right of the queue */}
      <Planter x={len / 2 + 4} z={1} />
      <Planter x={len / 2 + 4.5} z={7} />
      <Planter x={qx + 6} z={11.5} />
      <LampPost x={len / 2 + 2.5} z={-2.5} />
      <LampPost x={qx + 4} z={-2.5} />
      <LampPost x={len / 2 + 3} z={11.5} />
    </group>
  )
}

function LoadZone({ config }: { config: RideConfig }) {
  const rows = useGame((s) => s.rows)
  const flashRow = useGame((s) => s.flashRow)
  const tapRow = useGame((s) => s.tapRow)
  const nRows = totalRows(config)
  const cols = config.guestsPerRow
  const zCenter = CIRCLE_Z0 + ((cols - 1) * CIRCLE_SPACING) / 2
  return (
    <group>
      {Array.from({ length: nRows }, (_, r) => (
        <group key={r}>
          {Array.from({ length: cols }, (_, c) => {
            const p = circlePos(config, r, c)
            const flashing = flashRow !== null && flashRow.row === r && Date.now() < flashRow.until
            const occupied = rows[r]?.[c] !== null && rows[r]?.[c] !== undefined
            return (
              <mesh
                key={c}
                geometry={circleGeo}
                material={flashing ? circleFlashMat : circleMat}
                rotation-x={-Math.PI / 2}
                position={[p.x, 0.04, p.z]}
                visible={flashing || !occupied}
              />
            )
          })}
          <mesh
            material={hitMat}
            position={[rowX(config, r), 0.55, zCenter]}
            onClick={(e) => {
              e.stopPropagation()
              tapRow(r)
            }}
          >
            <boxGeometry args={[ROW_SPACING * 0.95, 1.1, cols * CIRCLE_SPACING + 0.5]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function CameraRig({ config }: { config: RideConfig }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  useEffect(() => {
    const { cx, cz, dist } = sceneFocus(config, size.width / size.height)
    camera.position.set(cx, dist * 0.92, cz + dist * 0.66)
    camera.lookAt(cx, 0, cz)
  }, [camera, config, size.height, size.width])
  return null
}

/** Floor label rendered as a small HTML pill. */
function FloorLabel({ x, z, text }: { x: number; z: number; text: string }) {
  return (
    <Html position={[x, 0.05, z]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div className="whitespace-nowrap rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-600 shadow">
        {text}
      </div>
    </Html>
  )
}

export function GameScene() {
  const config = useGame((s) => s.config)
  const options = useGame((s) => s.options)
  const groups = useGame((s) => s.groups)
  const singles = useGame((s) => s.singles)
  const guests = useGame((s) => s.guests)
  const selection = useGame((s) => s.selection)
  const tapGuest = useGame((s) => s.tapGuest)

  const targets = useMemo(
    () => computeQueueTargets(config, groups, singles, guests),
    [config, groups, singles, guests],
  )

  const groupById = useMemo(() => {
    const m = new Map<number, (typeof groups)[number]>()
    for (const g of groups) m.set(g.id, g)
    return m
  }, [groups])

  const worldGuests = Object.values(guests).filter((g) => g.state === 'queue' || g.state === 'loaded')

  const badges = groups
    .filter((g) => g.revealed)
    .map((g) => {
      const frontId = g.guestIds.find((id) => guests[id]?.state === 'queue')
      if (frontId === undefined) return null
      const t = targets.get(frontId)
      if (!t) return null
      const count = g.guestIds.filter((id) => guests[id]?.state === 'queue').length
      return { id: g.id, x: t.x, z: t.z, count, color: GUEST_COLORS[g.colorIndex] }
    })
    .filter((b): b is NonNullable<typeof b> => b !== null)

  const { cx, cz } = sceneFocus(config, 1.6)

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 48, near: 0.5, far: 400 }}>
      <color attach="background" args={['#bfe0f5']} />
      <fog attach="fog" args={['#bfe0f5', 60, 160]} />
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[18, 30, 14]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      <CameraRig config={config} />
      <OrbitControls
        makeDefault
        target={[cx, 0, cz]}
        enablePan={false}
        minDistance={7}
        maxDistance={130}
        minPolarAngle={0.3}
        maxPolarAngle={1.35}
        enableDamping
      />
      <Environment config={config} />
      <LoadZone config={config} />
      <VehicleTrain config={config} />

      {worldGuests.map((g) => {
        const target =
          g.state === 'loaded' ? circlePos(config, g.seatRow!, g.seatCol!) : targets.get(g.id)
        if (!target) return null
        const group = groupById.get(g.groupId)
        const color = g.single
          ? SINGLE_RIDER_COLOR
          : group?.revealed
            ? GUEST_COLORS[group.colorIndex]
            : g.state === 'loaded'
              ? GUEST_COLORS[(g.colorIndex ?? 0) % GUEST_COLORS.length]
              : GRAY
        return (
          <GuestMesh
            key={g.id}
            id={g.id}
            x={target.x}
            z={target.z}
            color={color}
            selected={selection.includes(g.id)}
            onTap={tapGuest}
          />
        )
      })}

      {badges.map((b) => (
        <Html
          key={b.id}
          position={[b.x, 2.05, b.z]}
          center
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-extrabold text-white shadow-md"
            style={{ backgroundColor: b.color }}
          >
            👥 {b.count}
          </div>
        </Html>
      ))}

      <FloorLabel x={queueBaseX(config)} z={12.6} text="STANDBY" />
      {options.singleRider && <FloorLabel x={queueBaseX(config) + 1.9} z={9.5} text="SINGLE RIDERS" />}
    </Canvas>
  )
}
