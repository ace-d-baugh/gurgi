// Real-world party size probability distribution (see PRD 4.3.2)
const BASE_DISTRIBUTION: Array<[size: number, weight: number]> = [
  [1, 4.93],
  [2, 41.74],
  [3, 15.95],
  [4, 29.92],
  [5, 2.99],
  [6, 1.99],
  [7, 0.6],
  [8, 0.8],
  [9, 0.3],
  [10, 0.2],
]

export function sampleGroupSize(maxSize: number): number {
  const entries: Array<[number, number]> = BASE_DISTRIBUTION.filter(([s]) => s <= maxSize).map(
    ([s, w]) => [s, w],
  )
  // Parties of 11-40 with geometrically diminishing probability
  for (let s = 11; s <= Math.min(40, maxSize); s++) {
    entries.push([s, 0.15 * Math.pow(0.65, s - 11)])
  }
  if (entries.length === 0) return 1
  const total = entries.reduce((acc, [, w]) => acc + w, 0)
  let r = Math.random() * total
  for (const [size, weight] of entries) {
    r -= weight
    if (r <= 0) return size
  }
  return entries[entries.length - 1][0]
}
