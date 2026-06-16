/**
 * Single source of truth for the sports offered in the sport dropdown.
 * Add or remove sports here — every screen that lists sports reads from this file.
 */
export const SPORTS = [
  "Soccer",
  "American Football",
  "Basketball",
  "Baseball",
  "Tennis",
  "Golf",
  "Volleyball",
  "Track and Field",
] as const

export type Sport = (typeof SPORTS)[number]

/** Value used when an athlete's sport isn't in the predefined list. */
export const OTHER_SPORT = "Other"
