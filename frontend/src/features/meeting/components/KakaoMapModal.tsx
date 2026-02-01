import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

// 카카오 지도 타입 선언
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: { center: LatLng; level: number }) => KakaoMap;
        LatLng: new (lat: number, lng: number) => LatLng;
        Marker: new (options: { position: LatLng; map?: KakaoMap }) => Marker;
        event: {
          addListener: (target: any, type: string, callback: Function) => void;
        };
        services: {
          Places: new () => Places;
          Geocoder: new () => Geocoder;
          Status: { OK: string; ZERO_RESULT: string };
        };
      };
    };
  }
}

interface LatLng {
  getLat: () => number;
  getLng: () => number;
}

interface KakaoMap {
  setCenter: (latlng: LatLng) => void;
  setLevel: (level: number) => void;
}

interface Marker {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (position: LatLng) => void;
}

interface PlaceResult {
  place_name: string;
  address_name: string;
  road_address_name?: string;
  x: string;
  y: string;
}

interface Places {
  keywordSearch: (
    keyword: string,
    callback: (result: PlaceResult[], status: string) => void
  ) => void;
}

interface Geocoder {
  coord2Address: (lng: number, lat: number, callback: (result: any, status: string) => void) => void;
}

export interface SelectedPlace {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface KakaoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (place: SelectedPlace) => void;
  currentLocation?: { latitude: number; longitude: number };
  initialAddress?: string;
}

const KakaoMapModal: React.FC<KakaoMapModalProps> = ({ isOpen, onClose, onSelect, currentLocation, initialAddress }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const placesRef = useRef<Places | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const resetState = () => {
    setTimeout(() => {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedPlace(null);
    }, 0);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }

    if (!mapContainerRef.current) return;

    const kakao = window.kakao;
    if (!kakao || !kakao.maps) {
      console.warn('Kakao Maps script is not yet available, retrying...');
      return;
    }

    kakao.maps.load(() => {
      const map = new kakao.maps.Map(mapContainerRef.current as HTMLElement, {
        center: currentLocation
          ? new kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
          : new kakao.maps.LatLng(37.5665, 126.978),
        level: 3,
      });

      mapRef.current = map;

      const initialPosition = currentLocation
        ? new kakao.maps.LatLng(currentLocation.latitude, currentLocation.longitude)
        : new kakao.maps.LatLng(37.5665, 126.978);

      markerRef.current = new kakao.maps.Marker({
        position: initialPosition,
        map,
      });

      placesRef.current = new kakao.maps.services.Places();

      // ✅ 지도 클릭 이벤트 - 클릭한 위치로 마커 이동 & 주소 가져오기
      kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;

        // 마커 위치 이동
        if (markerRef.current) {
          markerRef.current.setPosition(latlng);
        }

        // 좌표를 주소로 변환
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address;
            const roadAddress = result[0].road_address;

            setSelectedPlace({
              place_name: roadAddress?.building_name || address.region_3depth_name || '선택한 위치',
              address_name: address.address_name,
              road_address_name: roadAddress?.address_name,
              x: String(latlng.getLng()),
              y: String(latlng.getLat()),
            });
          }
        });
      });

      setIsMapLoaded(true);
    });
  }, [isOpen, currentLocation]);

  // 입력된 위치가 있으면 해당 위치로 지도 이동
  useEffect(() => {
    if (!isOpen) return;
    if (!isMapLoaded) return;
    if (!initialAddress || !initialAddress.trim()) return;
    if (!placesRef.current || !mapRef.current || !markerRef.current) return;
    if (selectedPlace) return;

    const query = initialAddress.trim();
    setSearchQuery(query);

    placesRef.current.keywordSearch(query, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const first = result[0];
        setSearchResults(result.slice(0, 5));
        setSelectedPlace(first);

        const position = new window.kakao.maps.LatLng(parseFloat(first.y), parseFloat(first.x));
        mapRef.current?.setCenter(position);
        markerRef.current?.setPosition(position);
      } else {
        setSearchResults([]);
      }
    });
  }, [isOpen, isMapLoaded, initialAddress, selectedPlace]);

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // 장소 검색
  const handleSearch = () => {
    if (!searchQuery.trim() || !placesRef.current) return;

    placesRef.current.keywordSearch(searchQuery, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(result.slice(0, 5));
      } else {
        setSearchResults([]);
      }
    });
  };

  // 엔터 키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색 결과 선택
  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setSearchResults([]);

    if (mapRef.current && markerRef.current) {
      const position = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x));
      mapRef.current.setCenter(position);
      markerRef.current.setPosition(position);
    }
  };

  // 선택 완료
  const handleConfirm = () => {
    if (selectedPlace) {
      onSelect({
        name: selectedPlace.place_name,
        address: selectedPlace.road_address_name || selectedPlace.address_name,
        lat: parseFloat(selectedPlace.y),
        lng: parseFloat(selectedPlace.x),
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-[430px] h-[90vh] mx-4 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-base">지도</h2>
          <button onClick={onClose} className="p-1">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="장소, 주소 검색 (예: 스타벅스, 카페)"
                className="w-full bg-gray-100 rounded-lg pl-4 pr-10 py-2 text-sm outline-none"
              />
              <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((place, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <p className="font-medium text-sm">{place.place_name}</p>
                  <p className="text-xs text-gray-500">{place.road_address_name || place.address_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="w-full h-full" />
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
            </div>
          )}

          {/* 지도 사용 안내 */}
          {isMapLoaded && !selectedPlace && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md pointer-events-none select-none">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={14} className="text-primary" />
                <span>지도를 클릭하거나 검색하세요</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Place Info & Confirm Button */}
        {selectedPlace && (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="mb-3">
              <p className="font-medium text-sm">{selectedPlace.place_name}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedPlace.road_address_name || selectedPlace.address_name}</p>
            </div>
            <Button variant="primary" size="md" fullWidth onClick={handleConfirm}>
              이 위치로 선택
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KakaoMapModal;