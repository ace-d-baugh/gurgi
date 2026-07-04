import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { useGame } from '../store'
import {
  CIRCLE_SPACING,
  CIRCLE_Z0,
  Q_LANE_GAP,
  Q_LANE_PAIRS,
  Q_PAIR_SPACING,
  ROW_PITCH,
  TRACK_Z,
  circleWorld,
  computeQueueTargets,
  evenQueueBaseX,
  grouperPos,
  loadZoneWidth,
  queueBaseX,
  rowLoadX,
  sceneFocus,
  waitingSlot,
} from '../logic/layout'
import { GRAY, GUEST_COLORS, SINGLE_RIDER_COLOR, type RideConfig } from '../types'
import { GrouperHost, GuestMesh, LeavingGuest } from './GuestMesh'
import { RideVehicle } from './Vehicles'

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
const stagedCircleMat = new THREE.MeshBasicMaterial({
  color: '#6B2B9F',
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.45,
})
const circleFlashMat = new THREE.MeshBasicMaterial({ color: '#E74C3C', side: THREE.DoubleSide })
const dividerMat = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.55,
})
const waitMat = new THREE.MeshBasicMaterial({ color: '#F39C12', transparent: true, opacity: 0.55 })
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

/** Serpentine queue rails: one rail per switchback lane boundary. */
function QueueRails({ baseX }: { baseX: number }) {
  const laneLen = (Q_LANE_PAIRS - 1) * Q_PAIR_SPACING + 1.2
  const zMid = 1.6 + laneLen / 2 - 0.6
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <mesh material={fenceMat} position={[baseX + 0.62 - i * Q_LANE_GAP, 0.42, zMid + 0.4]} castShadow>
            <boxGeometry args={[0.05, 0.05, laneLen]} />
          </mesh>
          {[0.25, 0.5, 0.75].map((f) => (
            <mesh
              key={f}
              material={fenceMat}
              position={[baseX + 0.62 - i * Q_LANE_GAP, 0.21, 1.3 + laneLen * f]}
            >
              <cylinderGeometry args={[0.025, 0.025, 0.42, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Environment({ config }: { config: RideConfig }) {
  const qx = queueBaseX(config)
  const linear = config.rideType === 'coaster' || config.rideType === 'continuous'
  const xMax = loadZoneWidth(config) / 2 + 8
  const platformW = xMax - (qx - 8)
  const platformCX = (qx - 8 + xMax) / 2
  const trees = useMemo(() => {
    const list: { x: number; z: number; s: number }[] = []
    for (let i = 0; i < 8; i++) {
      list.push({
        x: qx - 10 + i * ((xMax - qx + 20) / 8) + ((i * 37) % 5) - 2,
        z: TRACK_Z - 12.5 - ((i * 53) % 4),
        s: 0.8 + ((i * 29) % 10) / 14,
      })
    }
    return list
  }, [qx, xMax])
  return (
    <group>
      <mesh material={groundMat} rotation-x={-Math.PI / 2} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
      </mesh>
      <mesh material={platformMat} position={[platformCX, -0.005, 4.5]} receiveShadow>
        <boxGeometry args={[platformW, 0.06, 18]} />
      </mesh>
      {linear && (
        <>
          <mesh material={trackBedMat} position={[0, -0.01, TRACK_Z]} receiveShadow>
            <boxGeometry args={[160, 0.04, 3.2]} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} material={railMat} position={[0, 0.05, TRACK_Z + side * 1.1]}>
              <boxGeometry args={[160, 0.08, 0.09]} />
            </mesh>
          ))}
        </>
      )}
      <QueueRails baseX={queueBaseX(config)} />
      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}
    </group>
  )
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

function RowNumber({ x, z, n }: { x: number; z: number; n: number }) {
  return (
    <Html position={[x, 0.05, z]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-[11px] font-black text-white shadow">
        {n}
      </div>
    </Html>
  )
}

function LoadZone({ config }: { config: RideConfig }) {
  const rows = useGame((s) => s.rows)
  const staged = useGame((s) => s.staged)
  const options = useGame((s) => s.options)
  const flashRow = useGame((s) => s.flashRow)
  const tapRow = useGame((s) => s.tapRow)
  const theater = config.rideType === 'theater'
  const continuous = config.rideType === 'continuous'
  const cycleRide = config.rideType === 'carousel' || config.rideType === 'spinner' || theater
  const showStaged = !continuous && (options.doubleGrouping || cycleRide)
  const nBlocks = rows.length

  return (
    <group>
      {rows.map((rowSeats, r) => {
        const flashing = flashRow !== null && flashRow.row === r && Date.now() < flashRow.until
        const first = circleWorld(config, r, 0)
        const last = circleWorld(config, r, rowSeats.length - 1)
        const cx = (first.x + last.x) / 2
        const cz = (first.z + last.z) / 2
        return (
          <group key={r}>
            {rowSeats.map((occupant, c) => {
              const p = circleWorld(config, r, c)
              return (
                <mesh
                  key={c}
                  geometry={circleGeo}
                  material={flashing ? circleFlashMat : circleMat}
                  rotation-x={-Math.PI / 2}
                  position={[p.x, 0.04, p.z]}
                  visible={flashing || occupant === null}
                />
              )
            })}
            {showStaged &&
              staged[r]?.map((occupant, c) => {
                const p = circleWorld(config, r, c, true)
                return (
                  <mesh
                    key={`s${c}`}
                    geometry={circleGeo}
                    material={stagedCircleMat}
                    rotation-x={-Math.PI / 2}
                    position={[p.x, 0.04, p.z]}
                    visible={occupant === null}
                  />
                )
              })}
            {/* row number + divider lines between rows */}
            {theater ? (
              <>
                <RowNumber x={first.x - 0.75} z={first.z} n={r + 1} />
                {r < nBlocks - 1 && (
                  <mesh
                    material={dividerMat}
                    rotation-x={-Math.PI / 2}
                    position={[cx, 0.02, first.z + 0.4]}
                  >
                    <planeGeometry args={[rowSeats.length * CIRCLE_SPACING + 0.6, 0.05]} />
                  </mesh>
                )}
              </>
            ) : (
              <>
                <RowNumber x={cx} z={CIRCLE_Z0 - 0.55} n={r + 1} />
                {r < nBlocks - 1 && (
                  <mesh
                    material={dividerMat}
                    rotation-x={-Math.PI / 2}
                    position={[
                      cx + (continuous ? rowLoadX(config, 1) - rowLoadX(config, 0) : ROW_PITCH) / 2,
                      0.02,
                      cz + (showStaged ? 0.5 : 0),
                    ]}
                  >
                    <planeGeometry args={[0.05, rowSeats.length * CIRCLE_SPACING + (showStaged ? 2 : 0.8)]} />
                  </mesh>
                )}
              </>
            )}
            {/* tap target covering the row's circles (primary + staged) */}
            <mesh
              material={hitMat}
              position={[cx, 0.55, cz + (showStaged && !theater ? 0.55 : 0)]}
              onClick={(e) => {
                e.stopPropagation()
                tapRow(r)
              }}
            >
              <boxGeometry
                args={
                  theater
                    ? [rowSeats.length * CIRCLE_SPACING + 0.5, 1.1, 0.75]
                    : [0.95, 1.1, rowSeats.length * CIRCLE_SPACING + (showStaged ? 1.9 : 0.6)]
                }
              />
            </mesh>
          </group>
        )
      })}
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

export function GameScene() {
  const config = useGame((s) => s.config)
  const options = useGame((s) => s.options)
  const groups = useGame((s) => s.groups)
  const singles = useGame((s) => s.singles)
  const guests = useGame((s) => s.guests)
  const selection = useGame((s) => s.selection)
  const leavers = useGame((s) => s.leavers)
  const tapGuest = useGame((s) => s.tapGuest)

  const targets = useMemo(
    () => computeQueueTargets(config, groups, singles, guests, options.evenOdd),
    [config, groups, singles, guests, options.evenOdd],
  )

  // Waiting-area (deferred) groups stand in their marked rows.
  const deferredGroups = groups.filter((g) => g.deferred)
  const waitingTargets = useMemo(() => {
    const m = new Map<number, { x: number; z: number }>()
    deferredGroups.forEach((g, slot) => {
      g.guestIds.forEach((id, i) => {
        if (guests[id]?.state === 'queue') m.set(id, waitingSlot(config, slot, i))
      })
    })
    return m
  }, [deferredGroups, guests, config])

  const groupById = useMemo(() => {
    const m = new Map<number, (typeof groups)[number]>()
    for (const g of groups) m.set(g.id, g)
    return m
  }, [groups])

  const worldGuests = Object.values(guests).filter(
    (g) => g.state === 'queue' || g.state === 'loaded',
  )

  const badges = groups
    .filter((g) => g.revealed)
    .map((g) => {
      const frontId = g.guestIds.find((id) => guests[id]?.state === 'queue')
      if (frontId === undefined) return null
      const t = targets.get(frontId) ?? waitingTargets.get(frontId)
      if (!t) return null
      const count = g.guestIds.filter((id) => guests[id]?.state === 'queue').length
      return {
        id: g.id,
        x: t.x,
        z: t.z,
        count,
        color: GUEST_COLORS[g.colorIndex],
        request: g.requestedRow,
      }
    })
    .filter((b): b is NonNullable<typeof b> => b !== null)

  const { cx, cz } = sceneFocus(config, 1.6)
  const exitX = loadZoneWidth(config) / 2 + 26

  return (
    <Canvas shadows dpr={[1, 2]} camera={{ fov: 48, near: 0.5, far: 400 }}>
      <color attach="background" args={['#bfe0f5']} />
      <fog attach="fog" args={['#bfe0f5', 70, 180]} />
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[18, 30, 14]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
      />
      <CameraRig config={config} />
      <OrbitControls
        makeDefault
        target={[cx, 0, cz]}
        enablePan={false}
        minDistance={7}
        maxDistance={140}
        minPolarAngle={0.3}
        maxPolarAngle={1.35}
        enableDamping
      />
      <Environment config={config} />
      {options.evenOdd && <QueueRailsEven config={config} />}
      <LoadZone config={config} />
      <RideVehicle config={config} />
      <GrouperHost x={grouperPos(config).x} z={grouperPos(config).z} />

      {/* waiting area markers */}
      {options.rowRequests &&
        [0, 1, 2].map((slot) => {
          const p = waitingSlot(config, slot, 0)
          return (
            <mesh
              key={slot}
              material={waitMat}
              rotation-x={-Math.PI / 2}
              position={[p.x + 1.2, 0.02, p.z]}
            >
              <planeGeometry args={[3.4, 0.9]} />
            </mesh>
          )
        })}

      {worldGuests.map((g) => {
        const target =
          g.state === 'loaded'
            ? circleWorld(config, g.seatRow!, g.seatCol!, g.staged === true)
            : (targets.get(g.id) ?? waitingTargets.get(g.id))
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

      {leavers.map((l) => (
        <LeavingGuest
          key={l.id}
          fromX={l.fromX}
          fromZ={l.fromZ}
          exitX={exitX}
          color={l.single ? SINGLE_RIDER_COLOR : GUEST_COLORS[(l.colorIndex ?? 0) % GUEST_COLORS.length]}
        />
      ))}

      {badges.map((b) => (
        <Html
          key={b.id}
          position={[b.x, 2.15, b.z]}
          center
          zIndexRange={[40, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <div
              className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-extrabold text-white shadow-md"
              style={{ backgroundColor: b.color }}
            >
              👥 {b.count}
            </div>
            {b.request != null && (
              <div className="whitespace-nowrap rounded-full bg-white px-1.5 py-px text-[10px] font-bold text-ink shadow">
                Row {b.request} 🙏
              </div>
            )}
          </div>
        </Html>
      ))}

      <FloorLabel x={queueBaseX(config)} z={11.5} text={options.evenOdd ? 'ODD' : 'STANDBY'} />
      {options.evenOdd && <FloorLabel x={evenQueueBaseX(config)} z={11.5} text="EVEN" />}
      {options.singleRider && (
        <FloorLabel x={queueBaseX(config) + 1.6} z={9.2} text="SINGLE RIDERS" />
      )}
      {options.rowRequests && (
        <FloorLabel x={waitingSlot(config, 0, 0).x + 1.2} z={waitingSlot(config, 2, 0).z + 1} text="WAITING AREA" />
      )}
      {config.rideType === 'continuous' &&
        Array.from({ length: config.loadSpots }, (_, k) => (
          <FloorLabel key={k} x={rowLoadX(config, k)} z={CIRCLE_Z0 - 1.1} text={`SPOT ${k + 1}`} />
        ))}
    </Canvas>
  )
}

/** Second serpentine (even groups) beside the main one. */
function QueueRailsEven({ config }: { config: RideConfig }) {
  return <QueueRails baseX={evenQueueBaseX(config)} />
}
