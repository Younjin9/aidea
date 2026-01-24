import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
        services: {
          Places: new () => Places;
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
}

const KakaoMapModal: React.FC<KakaoMapModalProps> = ({ isOpen, onClose, onSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const placesRef = useRef<Places | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;


  // 카카오 SDK 스크립트 동적 로드
  useEffect(() => {
    // 이미 로드되어 있으면 스킵
    if (window.kakao && window.kakao.maps) return;

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // cleanup은 하지 않음 (한번 로드하면 유지)
    };
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const initMap = () => {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
        level: 3,
      };

      mapRef.current = new window.kakao.maps.Map(mapContainerRef.current!, options);
      markerRef.current = new window.kakao.maps.Marker({
        position: options.center,
        map: mapRef.current,
      });
      placesRef.current = new window.kakao.maps.services.Places();
      setIsMapLoaded(true);
    };

    // kakao 객체가 로드될 때까지 대기
    const checkKakao = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(initMap);
      } else {
        // 100ms 후 다시 체크
        setTimeout(checkKakao, 100);
      }
    };

    checkKakao();
  }, [isOpen]);

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedPlace(null);
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
                placeholder="장소, 주소, 버스 검색"
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
        </div>

        {/* Selected Place Info & Confirm Button */}
        {selectedPlace && (
          <div className="p-4 border-t border-gray-100">
            <div className="mb-3">
              <p className="font-medium text-sm">{selectedPlace.place_name}</p>
              <p className="text-xs text-gray-500">{selectedPlace.road_address_name || selectedPlace.address_name}</p>
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
