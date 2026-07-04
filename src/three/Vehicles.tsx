import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { TIMING, useGame } from '../store'
import {
  CONT_SPEED,
  ROUND_CENTER_Z,
  SEAT_SPACING,
  TRACK_Z,
  carouselRadii,
  circleWorld,
  coasterRowX,
  coasterTrainLength,
  contLength,
  contSeatLocal,
  contWidth,
  roundSeatLocal,
  rowAngle,
  seatWorldAtRest,
  spinnerRowRadius,
  totalRows,
} from '../logic/layout'
import { GUEST_COLORS, SINGLE_RIDER_COLOR, type RideConfig } from '../types'
import { SeatedGuest } from './GuestMesh'

const bodyMat = new THREE.MeshStandardMaterial({ color: '#0063B2', roughness: 0.35, metalness: 0.3 })
const trimMat = new THREE.MeshStandardMaterial({ color: '#6B2B9F', roughness: 0.4, metalness: 0.3 })
const seatMat = new THREE.MeshStandardMaterial({ color: '#22303f', roughness: 0.8 })
const wheelMat = new THREE.MeshStandardMaterial({ color: '#1a1a1e', roughness: 0.9 })
const noseMat = new THREE.MeshStandardMaterial({ color: '#F39C12', roughness: 0.3, metalness: 0.4 })
const lightMat = new THREE.MeshStandardMaterial({
  color: '#fff7d6',
  emissive: '#ffe9a8',
  emissiveIntensity: 1.2,
})
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
const steelMat = new THREE.MeshStandardMaterial({ color: '#8d99a5', roughness: 0.5, metalness: 0.6 })
const canopyMat = new THREE.MeshStandardMaterial({ color: '#E74C3C', roughness: 0.6 })
const floorMat = new THREE.MeshStandardMaterial({ color: '#d9c9a3', roughness: 0.9 })
const darkMat = new THREE.MeshStandardMaterial({ color: '#31261f', roughness: 0.95 })
const screenMat = new THREE.MeshStandardMaterial({
  color: '#bcd8ff',
  emissive: '#9cc4ff',
  emissiveIntensity: 0.5,
})

function easeInCubic(t: number) {
  return t * t * t
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
/** smooth spin profile: ease in, cruise, ease out; returns rotations in [0, turns] */
function spinProfile(p: number, turns: number) {
  const s = p < 0.15 ? easeInCubic(p / 0.15) * 0.15 : p > 0.85 ? 0.85 + easeOutCubic((p - 0.85) / 0.15) * 0.15 : p
  return s * turns * Math.PI * 2
}

const colorOf = (colorIndex: number | undefined, single: boolean) =>
  single ? SINGLE_RIDER_COLOR : GUEST_COLORS[(colorIndex ?? 0) % GUEST_COLORS.length]

function Seat({ x, z, ry = 0 }: { x: number; z: number; ry?: number }) {
  return (
    <group position={[x, 0, z]} rotation-y={ry}>
      <mesh material={seatMat} position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.52, 0.12, 0.52]} />
      </mesh>
      <mesh material={seatMat} position={[0, 0.78, -0.26]}>
        <boxGeometry args={[0.52, 0.55, 0.1]} />
      </mesh>
    </group>
  )
}

// --------------------------------------------------------------------------
// Roller coaster
// --------------------------------------------------------------------------

function CoasterTrainBody({ config, clickable }: { config: RideConfig; clickable: boolean }) {
  const tapRow = useGame((s) => s.tapRow)
  const len = coasterTrainLength(config)
  const width = Math.max(1.1, Math.max(...config.rowSeats) * SEAT_SPACING + 0.5)
  const sectionLen = config.rowsPerSection * 1.0

  return (
    <group>
      {Array.from({ length: config.sections }, (_, sec) => {
        const firstRow = sec * config.rowsPerSection
        const cx = coasterRowX(config, firstRow) - 0.5 + sectionLen / 2
        return (
          <group key={sec} position={[cx, 0, TRACK_Z]}>
            <mesh material={bodyMat} position={[0, 0.28, 0]} castShadow receiveShadow>
              <boxGeometry args={[sectionLen - 0.12, 0.34, width]} />
            </mesh>
            <mesh material={trimMat} position={[0, 0.47, 0]}>
              <boxGeometry args={[sectionLen - 0.1, 0.06, width + 0.06]} />
            </mesh>
            {[-1, 1].map((sideZ) =>
              [-1, 1].map((sideX) => (
                <mesh
                  key={`${sideZ}${sideX}`}
                  material={wheelMat}
                  position={[sideX * (sectionLen / 2 - 0.35), 0.16, sideZ * (width / 2 - 0.12)]}
                  rotation-x={Math.PI / 2}
                >
                  <cylinderGeometry args={[0.16, 0.16, 0.12, 16]} />
                </mesh>
              )),
            )}
          </group>
        )
      })}
      {/* FRONT (right end, direction of travel): sculpted nose, windshield, headlights */}
      <group position={[len / 2, 0, TRACK_Z]}>
        <mesh material={noseMat} position={[0.35, 0.3, 0]} rotation-z={-Math.PI / 2} castShadow>
          <coneGeometry args={[Math.min(0.55, width / 2), 0.9, 4]} />
        </mesh>
        <mesh material={trimMat} position={[0.05, 0.62, 0]} rotation-z={-0.5}>
          <boxGeometry args={[0.06, 0.4, width * 0.7]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} material={lightMat} position={[0.72, 0.32, s * Math.min(0.35, width / 3)]}>
            <sphereGeometry args={[0.09, 10, 8]} />
          </mesh>
        ))}
      </group>
      {/* BACK (left end): flat tail with a red marker light */}
      <group position={[-len / 2, 0, TRACK_Z]}>
        <mesh material={trimMat} position={[-0.12, 0.4, 0]}>
          <boxGeometry args={[0.12, 0.5, width * 0.9]} />
        </mesh>
        <mesh material={canopyMat} position={[-0.2, 0.55, 0]}>
          <sphereGeometry args={[0.08, 10, 8]} />
        </mesh>
      </group>
      {/* seats */}
      {config.rowSeats.map((seats, r) =>
        Array.from({ length: seats }, (_, c) => {
          const p = seatWorldAtRest(config, r, c)
          return <Seat key={`${r}-${c}`} x={p.x} z={p.z} ry={p.ry} />
        }),
      )}
      {clickable &&
        config.rowSeats.map((_, r) => (
          <mesh
            key={`hit-${r}`}
            material={hitMat}
            position={[coasterRowX(config, r), 0.9, TRACK_Z]}
            onClick={(e) => {
              e.stopPropagation()
              tapRow(r)
            }}
          >
            <boxGeometry args={[0.95, 1.6, width]} />
          </mesh>
        ))}
    </group>
  )
}

/** Decorative coaster course behind the station; a ghost train runs it after each dispatch. */
function BackgroundCourse() {
  const dispatchCount = useGame((s) => s.dispatchCount)
  const runStart = useRef(0)
  const lastCount = useRef(0)
  const train = useRef<THREE.Group>(null!)

  const path = useMemo(() => {
    // a wavy hill profile along x
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 40; i++) {
      const t = i / 40
      const x = -30 + t * 60
      const y = 1.5 + Math.sin(t * Math.PI * 3) * 2.2 + Math.sin(t * Math.PI * 7) * 0.5 + 2.2
      pts.push(new THREE.Vector3(x, y, -16))
    }
    return new THREE.CatmullRomCurve3(pts)
  }, [])

  const tube = useMemo(() => new THREE.TubeGeometry(path, 80, 0.09, 6, false), [path])
  const supports = useMemo(() => {
    const list: { x: number; h: number }[] = []
    for (let i = 0; i <= 10; i++) {
      const p = path.getPoint(i / 10)
      list.push({ x: p.x, h: p.y })
    }
    return list
  }, [path])

  useFrame(() => {
    if (dispatchCount !== lastCount.current) {
      lastCount.current = dispatchCount
      runStart.current = Date.now()
    }
    const g = train.current
    if (!g) return
    const elapsed = (Date.now() - runStart.current) / 1000
    const dur = 6
    if (runStart.current === 0 || elapsed > dur) {
      g.visible = false
      return
    }
    g.visible = true
    const t = Math.min(0.999, elapsed / dur)
    const p = path.getPoint(t)
    const tan = path.getTangent(t)
    g.position.copy(p)
    g.rotation.z = Math.atan2(tan.y, tan.x)
  })

  return (
    <group>
      <mesh geometry={tube} material={steelMat} />
      {supports.map((s, i) => (
        <mesh key={i} material={steelMat} position={[s.x, s.h / 2, -16]}>
          <cylinderGeometry args={[0.07, 0.09, s.h, 6]} />
        </mesh>
      ))}
      <group ref={train} visible={false}>
        <mesh material={bodyMat}>
          <boxGeometry args={[1.6, 0.35, 0.5]} />
        </mesh>
        <mesh material={noseMat} position={[0.95, 0, 0]} rotation-z={-Math.PI / 2}>
          <coneGeometry args={[0.22, 0.5, 4]} />
        </mesh>
      </group>
    </group>
  )
}

function CoasterRide({ config }: { config: RideConfig }) {
  const ref = useRef<THREE.Group>(null!)
  const guests = useGame((s) => s.guests)
  const departing = useGame((s) => s.departing)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const { phase, phaseAt } = useGame.getState()
    const t = Date.now() - phaseAt
    let x = 0
    if (phase === 'dispatching') x = easeInCubic(Math.min(1, t / TIMING.dispatch)) * 55
    else if (phase === 'arriving') x = -55 * (1 - easeOutCubic(Math.min(1, t / TIMING.arrive)))
    g.position.x = x
  })

  const seated = Object.values(guests).filter((g) => g.state === 'seated' && !g.staged)

  return (
    <>
      <BackgroundCourse />
      <group ref={ref}>
        <CoasterTrainBody config={config} clickable />
        {seated.map((g) => {
          const sp = seatWorldAtRest(config, g.seatRow!, g.seatCol!)
          const cp = circleWorld(config, g.seatRow!, g.seatCol!)
          return (
            <SeatedGuest
              key={g.id}
              fromX={cp.x}
              fromZ={cp.z}
              x={sp.x}
              z={sp.z}
              ry={sp.ry}
              color={colorOf(g.colorIndex, g.single)}
            />
          )
        })}
        {departing.map((d) => {
          const sp = seatWorldAtRest(config, d.row, d.col)
          return (
            <SeatedGuest
              key={d.id}
              fromX={sp.x}
              fromZ={sp.z}
              x={sp.x}
              z={sp.z}
              ry={sp.ry}
              color={colorOf(d.colorIndex, d.single)}
            />
          )
        })}
      </group>
    </>
  )
}

// --------------------------------------------------------------------------
// Carousel & Flying Spinner
// --------------------------------------------------------------------------

function RoundRide({ config }: { config: RideConfig }) {
  const platform = useRef<THREE.Group>(null!)
  const guests = useGame((s) => s.guests)
  const isSpinner = config.rideType === 'spinner'
  const { outer } = carouselRadii(config)
  const platformR = isSpinner ? spinnerRowRadius(config, totalRows(config) - 1) + 1.4 : outer + 0.5

  useFrame(() => {
    const g = platform.current
    if (!g) return
    const { phase, phaseAt, config: c } = useGame.getState()
    if (phase === 'riding') {
      const p = Math.min(1, (Date.now() - phaseAt) / (c.rideSeconds * 1000))
      // counter-clockwise (positive y rotation), exactly 5 full turns
      g.rotation.y = spinProfile(p, 5)
      if (isSpinner) g.position.y = Math.sin(Math.min(1, p * 1.15) * Math.PI) * 1.6
    } else {
      g.rotation.y = 0
      g.position.y = 0
    }
  })

  const seated = Object.values(guests).filter((g) => g.state === 'seated' && !g.staged)

  return (
    <group position={[0, 0, ROUND_CENTER_Z]}>
      {/* static base */}
      <mesh material={steelMat} position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[platformR + 0.5, platformR + 0.7, 0.12, 32]} />
      </mesh>
      <group ref={platform}>
        {/* rotating platform */}
        <mesh material={floorMat} position={[0, 0.16, 0]} receiveShadow>
          <cylinderGeometry args={[platformR, platformR, 0.1, 32]} />
        </mesh>
        {/* center column */}
        <mesh material={trimMat} position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.7, 2.6, 12]} />
        </mesh>
        {isSpinner ? (
          // spoke arms out to each car
          Array.from({ length: config.spokes }, (_, sIdx) => {
            const a = (sIdx / config.spokes) * Math.PI * 2
            const r = spinnerRowRadius(config, (sIdx + 1) * config.rowsPerSpoke - 1)
            return (
              <mesh
                key={sIdx}
                material={steelMat}
                position={[(Math.cos(a) * r) / 2, 1.0, (Math.sin(a) * r) / 2]}
                rotation-y={-a}
                rotation-z={0.12}
                castShadow
              >
                <boxGeometry args={[r, 0.12, 0.24]} />
              </mesh>
            )
          })
        ) : null /* topless carousel — no canopy, so the benches stay visible */}
        {/* row benches + poles */}
        {config.rowSeats.map((seats, r) => {
          const a = rowAngle(config, r)
          return (
            <group key={r}>
              {Array.from({ length: seats }, (_, cIdx) => {
                const p = roundSeatLocal(config, r, cIdx)
                return <Seat key={cIdx} x={p.x} z={p.z} ry={p.ry} />
              })}
              {!isSpinner && (
                <mesh
                  material={steelMat}
                  position={[Math.cos(a) * (outer - 0.4), 1.5, Math.sin(a) * (outer - 0.4)]}
                >
                  <cylinderGeometry args={[0.04, 0.04, 2.7, 8]} />
                </mesh>
              )}
            </group>
          )
        })}
        {/* riders rotate with the platform */}
        {seated.map((g) => {
          const sp = roundSeatLocal(config, g.seatRow!, g.seatCol!)
          const cp = circleWorld(config, g.seatRow!, g.seatCol!)
          return (
            <SeatedGuest
              key={g.id}
              fromX={cp.x}
              fromZ={cp.z - ROUND_CENTER_Z}
              x={sp.x}
              z={sp.z}
              ry={sp.ry}
              color={colorOf(g.colorIndex, g.single)}
            />
          )
        })}
      </group>
    </group>
  )
}

// --------------------------------------------------------------------------
// Small theater
// --------------------------------------------------------------------------

function TheaterRide({ config }: { config: RideConfig }) {
  const guests = useGame((s) => s.guests)
  const tapRow = useGame((s) => s.tapRow)
  const width = Math.max(...config.rowSeats) * SEAT_SPACING + 1.6
  const depth = totalRows(config) * 0.9 + 1.6
  const backZ = TRACK_Z - 0.6 - depth

  const seated = Object.values(guests).filter((g) => g.state === 'seated' && !g.staged)

  return (
    <group>
      {/* floor + side walls + screen wall (open toward the load zone) */}
      <mesh material={darkMat} position={[0, 0.05, backZ + depth / 2]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={darkMat} position={[(s * width) / 2, 1.1, backZ + depth / 2]} castShadow>
          <boxGeometry args={[0.15, 2.2, depth]} />
        </mesh>
      ))}
      <mesh material={darkMat} position={[0, 1.4, backZ]} castShadow>
        <boxGeometry args={[width, 2.8, 0.15]} />
      </mesh>
      <mesh material={screenMat} position={[0, 1.5, backZ + 0.12]}>
        <planeGeometry args={[width * 0.7, 1.6]} />
      </mesh>
      {/* bench rows with subsection gaps */}
      {config.rowSeats.map((seats, r) =>
        Array.from({ length: seats }, (_, cIdx) => {
          const p = seatWorldAtRest(config, r, cIdx)
          return <Seat key={`${r}-${cIdx}`} x={p.x} z={p.z} ry={p.ry} />
        }),
      )}
      {/* row tap targets inside the theater */}
      {config.rowSeats.map((_, r) => {
        const p = seatWorldAtRest(config, r, 0)
        return (
          <mesh
            key={`hit-${r}`}
            material={hitMat}
            position={[0, 0.9, p.z]}
            onClick={(e) => {
              e.stopPropagation()
              tapRow(r)
            }}
          >
            <boxGeometry args={[width - 0.4, 1.6, 0.8]} />
          </mesh>
        )
      })}
      {seated.map((g) => {
        const sp = seatWorldAtRest(config, g.seatRow!, g.seatCol!)
        const cp = circleWorld(config, g.seatRow!, g.seatCol!)
        return (
          <SeatedGuest
            key={g.id}
            fromX={cp.x}
            fromZ={cp.z}
            x={sp.x}
            z={sp.z}
            ry={sp.ry}
            color={colorOf(g.colorIndex, g.single)}
          />
        )
      })}
    </group>
  )
}

// --------------------------------------------------------------------------
// Continuous mover fleet
// --------------------------------------------------------------------------

function ContVehicleBody({ config }: { config: RideConfig }) {
  const len = contLength(config)
  const wid = contWidth(config)
  return (
    <group position={[0, 0, TRACK_Z]}>
      <mesh material={bodyMat} position={[0, 0.26, 0]} castShadow>
        <boxGeometry args={[len, 0.3, wid]} />
      </mesh>
      <mesh material={trimMat} position={[0, 0.43, 0]}>
        <boxGeometry args={[len + 0.05, 0.05, wid + 0.05]} />
      </mesh>
      {/* front marker (direction of travel = +x) */}
      <mesh material={lightMat} position={[len / 2 + 0.05, 0.3, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
      </mesh>
    </group>
  )
}

function ContinuousFleet({ config }: { config: RideConfig }) {
  const contVehicles = useGame((s) => s.contVehicles)
  const guests = useGame((s) => s.guests)
  const refs = useRef(new Map<number, THREE.Group>())

  useFrame(() => {
    const s = useGame.getState()
    s.contTick(Date.now())
    const elapsed = (Date.now() - s.contStartAt) / 1000
    for (const v of s.contVehicles) {
      const g = refs.current.get(v.id)
      if (g) g.position.x = v.offset + elapsed * CONT_SPEED
    }
  })

  return (
    <group>
      {contVehicles.map((v) => (
        <group key={v.id} ref={(el) => el && refs.current.set(v.id, el)}>
          <ContVehicleBody config={config} />
          {config.rowSeats.map((seats, r) =>
            Array.from({ length: seats }, (_, cIdx) => {
              const p = contSeatLocal(config, r, cIdx)
              return <Seat key={`${r}-${cIdx}`} x={p.x} z={p.z} ry={p.ry} />
            }),
          )}
          {v.seats.flatMap((row, ri) =>
            row.map((id, ci) => {
              if (id === null) return null
              const g = guests[id]
              const p = contSeatLocal(config, ri, ci)
              return (
                <SeatedGuest
                  key={id}
                  fromX={p.x}
                  fromZ={p.z}
                  x={p.x}
                  z={p.z}
                  ry={p.ry}
                  color={colorOf(g?.colorIndex, g?.single ?? false)}
                />
              )
            }),
          )}
        </group>
      ))}
    </group>
  )
}

// --------------------------------------------------------------------------

export function RideVehicle({ config }: { config: RideConfig }) {
  switch (config.rideType) {
    case 'coaster':
      return <CoasterRide config={config} />
    case 'carousel':
    case 'spinner':
      return <RoundRide config={config} />
    case 'theater':
      return <TheaterRide config={config} />
    case 'continuous':
      return <ContinuousFleet config={config} />
  }
}
