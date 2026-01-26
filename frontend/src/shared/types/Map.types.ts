// ============================================
// 🗺️ Map Types - 유경님
// 지도 / 위치 기반
// ============================================

import type { Location } from './common.types';
import type { MapMeeting } from './Meeting.types';

// ============================================
// Map Query Types
// ============================================

export interface MapBoundsParams {
  northEastLat: number;
  northEastLng: number;
  southWestLat: number;
  southWestLng: number;
  interestCategoryId?: string;
  limit?: number;
}

export interface MapRadiusParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  interestCategoryId?: string;
}

// ============================================
// Location Search Types
// ============================================

export interface LocationSearchParams {
  query: string;
  lat?: number;
  lng?: number;
}

export interface LocationSearchResult {
  placeName: string;
  address: string;
  roadAddress?: string;
  location: Location;
  category?: string;
  distance?: number;
}

// ============================================
// Cluster Types
// ============================================

export interface MeetingCluster {
  clusterId: string;
  count: number;
  center: Location;
  meetings: MapMeeting[];
}

// ============================================
// Distance Types
// ============================================

export interface DistanceResult {
  distanceKm: number;
  distanceM: number;
  duration?: number;
}

export interface BatchDistanceRequest {
  origin: { lat: number; lng: number };
  destinations: Array<{
    id: string;
    lat: number;
    lng: number;
  }>;
}

export interface BatchDistanceResult {
  id: string;
  distanceKm: number;
  distanceM: number;
}

// ============================================
// Route Types
// ============================================

export type RouteMode = 'walking' | 'transit' | 'driving';

export interface RouteResult {
  distance: number;
  duration: number;
  path: Array<{ lat: number; lng: number }>;
  instructions: string[];
}

// ============================================
// Geocoding Types
// ============================================

export interface GeocodeResult {
  location: Location;
}

export interface ReverseGeocodeResult {
  address: string;
  roadAddress?: string;
  region: string;
}

// ============================================
// Region Types
// ============================================

export interface PopularRegion {
  region: string;
  count: number;
  center: Location;
}

export interface RegionMeetingCount {
  region: string;
  count: number;
}

// ============================================
// Marker Types
// ============================================

export interface MarkerStyle {
  color: string;
  icon: string;
}

export type MarkerStyles = Record<string, MarkerStyle>;