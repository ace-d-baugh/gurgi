import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { TIMING, useGame } from '../store'
import {
  ROW_SPACING,
  SEAT_SPACING,
  TRACK_Z,
  circlePos,
  rowX,
  seatPos,
  totalRows,
  trainLength,
} from '../logic/layout'
import { GUEST_COLORS, SINGLE_RIDER_COLOR, type RideConfig } from '../types'
import { SeatedGuest } from './GuestMesh'

const bodyMat = new THREE.MeshStandardMaterial({ color: '#0063B2', roughness: 0.35, metalness: 0.3 })
const trimMat = new THREE.MeshStandardMaterial({ color: '#6B2B9F', roughness: 0.4, metalness: 0.3 })
const seatMat = new THREE.MeshStandardMaterial({ color: '#22303f', roughness: 0.8 })
const wheelMat = new THREE.MeshStandardMaterial({ color: '#1a1a1e', roughness: 0.9 })
const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })

function easeInCubic(t: number) {
  return t * t * t
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/** Static geometry of one train (all sections, rows, seats, wheels). */
function TrainBody({ config, clickable }: { config: RideConfig; clickable: boolean }) {
  const tapRow = useGame((s) => s.tapRow)
  const width = Math.max(1.1, config.guestsPerRow * SEAT_SPACING + 0.5)
  const rows = totalRows(config)
  const sectionLen = config.rowsPerSection * ROW_SPACING

  const sections = useMemo(() => Array.from({ length: config.sections }, (_, i) => i), [config.sections])
  const rowList = useMemo(() => Array.from({ length: rows }, (_, i) => i), [rows])
  const colList = useMemo(
    () => Array.from({ length: config.guestsPerRow }, (_, i) => i),
    [config.guestsPerRow],
  )

  return (
    <group>
      {sections.map((sec) => {
        const firstRow = sec * config.rowsPerSection
        const cx = rowX(config, firstRow) - ROW_SPACING / 2 + sectionLen / 2
        return (
          <group key={sec} position={[cx, 0, TRACK_Z]}>
            {/* chassis */}
            <mesh material={bodyMat} position={[0, 0.28, 0]} castShadow receiveShadow>
              <boxGeometry args={[sectionLen - 0.12, 0.34, width]} />
            </mesh>
            {/* side trim */}
            <mesh material={trimMat} position={[0, 0.47, 0]}>
              <boxGeometry args={[sectionLen - 0.1, 0.06, width + 0.06]} />
            </mesh>
            {/* wheels */}
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
      {/* nose on the lead car */}
      <mesh material={trimMat} position={[trainLength(config) / 2 + 0.18, 0.32, TRACK_Z]} castShadow>
        <coneGeometry args={[0.42, 0.7, 4]} />
      </mesh>
      {/* seats */}
      {rowList.map((r) =>
        colList.map((c) => {
          const p = seatPos(config, r, c)
          return (
            <group key={`${r}-${c}`} position={[p.x, 0, p.z]}>
              <mesh material={seatMat} position={[0, 0.52, 0]} castShadow>
                <boxGeometry args={[0.52, 0.12, 0.52]} />
              </mesh>
              <mesh material={seatMat} position={[-0.28, 0.78, 0]}>
                <boxGeometry args={[0.1, 0.55, 0.52]} />
              </mesh>
            </group>
          )
        }),
      )}
      {/* per-row tap targets on the vehicle itself */}
      {clickable &&
        rowList.map((r) => (
          <mesh
            key={`hit-${r}`}
            material={hitMat}
            position={[rowX(config, r), 0.9, TRACK_Z]}
            onClick={(e) => {
              e.stopPropagation()
              tapRow(r)
            }}
          >
            <boxGeometry args={[ROW_SPACING * 0.95, 1.6, width]} />
          </mesh>
        ))}
    </group>
  )
}

/**
 * The moving train(s): handles dispatch/arrival animation and carries
 * seated + departing guests so they travel with the vehicle.
 */
export function VehicleTrain({ config }: { config: RideConfig }) {
  const ref = useRef<THREE.Group>(null!)
  const guests = useGame((s) => s.guests)
  const departing = useGame((s) => s.departing)

  const spacing = trainLength(config) + 3

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const { phase, phaseAt } = useGame.getState()
    const timing = TIMING[config.rideType]
    const t = Date.now() - phaseAt
    let x = 0
    if (phase === 'dispatching') {
      const p = Math.min(1, t / timing.dispatch)
      x = easeInCubic(p) * (config.rideType === 'continuous' ? spacing : 48)
    } else if (phase === 'arriving') {
      if (config.rideType === 'continuous') {
        x = 0
      } else {
        const p = Math.min(1, t / timing.arrive)
        x = -48 * (1 - easeOutCubic(p))
      }
    }
    g.position.x = x
  })

  const seated = Object.values(guests).filter((g) => g.state === 'seated')

  const colorOf = (colorIndex: number | undefined, single: boolean) =>
    single ? SINGLE_RIDER_COLOR : GUEST_COLORS[(colorIndex ?? 0) % GUEST_COLORS.length]

  return (
    <group ref={ref}>
      <TrainBody config={config} clickable />
      {config.rideType === 'continuous' &&
        [-2, -1, 1].map((i) => (
          <group key={i} position-x={i * spacing}>
            <TrainBody config={config} clickable={false} />
          </group>
        ))}
      {seated.map((g) => {
        const sp = seatPos(config, g.seatRow!, g.seatCol!)
        const cp = circlePos(config, g.seatRow!, g.seatCol!)
        return (
          <SeatedGuest
            key={g.id}
            fromX={cp.x}
            fromZ={cp.z}
            x={sp.x}
            z={sp.z}
            color={colorOf(g.colorIndex, g.single)}
          />
        )
      })}
      {departing.map((d) => {
        const sp = seatPos(config, d.row, d.col)
        return (
          <SeatedGuest
            key={d.id}
            fromX={sp.x}
            fromZ={sp.z}
            x={sp.x}
            z={sp.z}
            color={colorOf(d.colorIndex, d.single)}
          />
        )
      })}
    </group>
  )
}
