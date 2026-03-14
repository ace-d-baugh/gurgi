export interface Location {
  _id: string;
  name: string;
  slug: string;
}

export interface Ride {
  _id: string;
  name: string;
  nameSlug: string;
  location: Location;
  rideType: string;
  guests: number[][] | number[];
  evenOddLines: boolean;
  singleRiders: boolean;
  rowRequest: boolean;
  doubleGroupable: boolean;
  active: boolean;
}

export interface Guest {
  id: string;
  groupId: string;
  color: string;
  selected: boolean;
}

export interface GuestGroup {
  id: string;
  size: number;
  isActive: boolean;
  color?: string;
  selected?: boolean;
}

export interface GameConfig {
  vehiclesToComplete: number;
  visibleGuests: number;
  maxGroupSize: number;
  timerEnabled: boolean;
  timerDuration: number;
  tapToShow: boolean;
  doubleGrouping: boolean;
}
