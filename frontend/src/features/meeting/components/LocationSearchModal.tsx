import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import Input from '@/shared/components/ui/Input';

interface PlaceResult {
    place_name: string;
    address_name: string;
    road_address_name: string;
    x: string; // lng
    y: string; // lat
}

interface LocationSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLocation: (location: { address: string; latitude: number; longitude: number }) => void;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
    isOpen,
    onClose,
    onSelectLocation,
}) => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [status, setStatus] = useState<'idle' | 'searching' | 'no_result' | 'error'>('idle');

    useEffect(() => {
        if (!isOpen) {
            setKeyword('');
            setResults([]);
            setStatus('idle');
        }
    }, [isOpen]);

    const searchPlaces = () => {
        if (!keyword.trim()) return;

        const kakao = (window as any).kakao;
        if (!kakao || !kakao.maps || !kakao.maps.services) {
            console.error('Kakao Maps API is not loaded');
            setStatus('error');
            return;
        }

        setStatus('searching');
        const ps = new kakao.maps.services.Places();

        ps.keywordSearch(keyword, (data: any[], status: any) => {
            if (status === kakao.maps.services.Status.OK) {
                setResults(data);
                setStatus('idle');
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                setResults([]);
                setStatus('no_result');
            } else {
                setResults([]);
                setStatus('error');
            }
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchPlaces();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
            <div className="w-full max-w-[430px] h-[90vh] sm:h-[600px] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl animate-slide-up sm:animate-none">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h2 className="text-lg font-semibold">장소 검색</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-gray-100 bg-white">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="장소명, 주소 검색 (예: 강남역, 판교 유스페이스)"
                                autoFocus
                                rightElement={
                                    <button onClick={searchPlaces} className="text-primary">
                                        <Search size={20} />
                                    </button>
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    {status === 'searching' && (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    )}

                    {status === 'no_result' && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <p>검색 결과가 없습니다.</p>
                            <p className="text-sm mt-1">다른 키워드로 검색해보세요.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center justify-center h-40 text-red-500">
                            <p>검색 중 오류가 발생했습니다.</p>
                        </div>
                    )}

                    {status === 'idle' && results.length > 0 && (
                        <ul className="space-y-2">
                            {results.map((place, index) => (
                                <li
                                    key={`${place.x}-${place.y}-${index}`}
                                    onClick={() => {
                                        onSelectLocation({
                                            address: place.place_name, // 장소명 우선, 필요시 address_name 사용 가능
                                            latitude: parseFloat(place.y),
                                            longitude: parseFloat(place.x),
                                        });
                                        onClose();
                                    }}
                                    className="p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
                                >
                                    <div className="font-medium text-gray-900 mb-1">{place.place_name}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {place.road_address_name || place.address_name}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {status === 'idle' && results.length === 0 && keyword === '' && (
                        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                            검색어를 입력해주세요.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationSearchModal;
