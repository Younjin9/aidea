import apiClient, { buildQueryString } from './client';
import type { ApiResponse, Location } from '@/shared/types/common.types';
import type {
  MapBoundsParams,
  MapRadiusParams,
  LocationSearchParams,
  LocationSearchResult,
  MeetingCluster,
  DistanceResult,
  BatchDistanceRequest,
  BatchDistanceResult,
  RouteMode,
  RouteResult,
  GeocodeResult,
  ReverseGeocodeResult,
  PopularRegion,
  RegionMeetingCount,
  MarkerStyles,
} from '@/shared/types/map.types';
import type { MapMeeting } from '@/shared/types/meeting.types';

// ============================================
// 🗺️ Map API - 유경님
// 지도
// ============================================

/**
 * 지도 영역 내 모임 조회
 * GET /api/v1/meetings/map
 */
export const getMeetingsInBounds = async (params: MapBoundsParams): Promise<ApiResponse<MapMeeting[]>> => {
  const queryString = buildQueryString(params);
  return apiClient.get(`/v1/meetings/map?${queryString}`);
};

/**
 * 반경 내 모임 조회
 * GET /api/meetings/radius
 */
export const getMeetingsInRadius = async (params: MapRadiusParams): Promise<ApiResponse<MapMeeting[]>> => {
  const queryString = buildQueryString(params);
  return apiClient.get(`/meetings/radius?${queryString}`);
};

/**
 * 모임 클러스터 정보
 * GET /api/meetings/cluster
 */
export const getCluster = async (lat: number, lng: number, zoom: number): Promise<ApiResponse<MeetingCluster>> => {
  return apiClient.get(`/meetings/cluster?lat=${lat}&lng=${lng}&zoom=${zoom}`);
};

/**
 * 장소 검색
 * GET /api/map/search/places
 */
export const searchPlaces = async (params: LocationSearchParams): Promise<ApiResponse<LocationSearchResult[]>> => {
  const queryString = buildQueryString(params);
  return apiClient.get(`/map/search/places?${queryString}`);
};

/**
 * 주소 → 좌표 변환
 * GET /api/map/geocode
 */
export const geocode = async (address: string): Promise<ApiResponse<GeocodeResult>> => {
  return apiClient.get(`/map/geocode?address=${encodeURIComponent(address)}`);
};

/**
 * 좌표 → 주소 변환
 * GET /api/map/reverse-geocode
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<ApiResponse<ReverseGeocodeResult>> => {
  return apiClient.get(`/map/reverse-geocode?lat=${lat}&lng=${lng}`);
};

/**
 * 두 지점 간 거리 계산
 * GET /api/map/distance
 */
export const calculateDistance = async (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  mode: 'straight' | 'walking' | 'driving' = 'straight'
): Promise<ApiResponse<DistanceResult>> => {
  return apiClient.get(`/map/distance?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}&mode=${mode}`);
};

/**
 * 여러 모임과의 거리 일괄 계산
 * POST /api/map/distances
 */
export const calculateDistances = async (data: BatchDistanceRequest): Promise<ApiResponse<BatchDistanceResult[]>> => {
  return apiClient.post('/map/distances', data);
};

/**
 * 경로 조회
 * GET /api/map/route
 */
export const getRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  mode: RouteMode
): Promise<ApiResponse<RouteResult>> => {
  return apiClient.get(`/map/route?startLat=${start.lat}&startLng=${start.lng}&endLat=${end.lat}&endLng=${end.lng}&mode=${mode}`);
};

/**
 * 인기 지역 조회
 * GET /api/map/regions/popular
 */
export const getPopularRegions = async (): Promise<ApiResponse<PopularRegion[]>> => {
  return apiClient.get('/map/regions/popular');
};

/**
 * 특정 지역의 모임 수 조회
 * GET /api/map/regions/{region}/count
 */
export const getRegionCount = async (region: string): Promise<ApiResponse<RegionMeetingCount>> => {
  return apiClient.get(`/map/regions/${encodeURIComponent(region)}/count`);
};

/**
 * 내 위치 업데이트
 * PUT /api/users/me/location
 */
export const updateMyLocation = async (data: {
  lat: number;
  lng: number;
  region: string;
}): Promise<ApiResponse<{ updated: boolean; location: Location }>> => {
  return apiClient.put('/users/me/location', data);
};

/**
 * 내 위치 조회
 * GET /api/users/me/location
 */
export const getMyLocation = async (): Promise<ApiResponse<Location>> => {
  return apiClient.get('/users/me/location');
};

/**
 * 지도 마커 스타일
 * GET /api/map/marker-styles
 */
export const getMarkerStyles = async (): Promise<ApiResponse<MarkerStyles>> => {
  return apiClient.get('/map/marker-styles');
};

const mapApi = {
  getMeetingsInBounds,
  getMeetingsInRadius,
  getCluster,
  searchPlaces,
  geocode,
  reverseGeocode,
  calculateDistance,
  calculateDistances,
  getRoute,
  getPopularRegions,
  getRegionCount,
  updateMyLocation,
  getMyLocation,
  getMarkerStyles,
};

export default mapApi;