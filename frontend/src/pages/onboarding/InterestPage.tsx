import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { INTEREST_CATEGORIES } from '@/shared/config/constants';
import Button from '@/shared/components/ui/Button';

const InterestPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Toggle selection of a specific interest item (e.g., "축구")
  const toggleItem = (item: string) => {
    setSelectedItems((prev) => 
      prev.includes(item) 
        ? prev.filter((i) => i !== item) 
        : [...prev, item]
    );
  };

  const handleComplete = () => {
    // In real app, submit selectedItems to API
    navigate('/shorts');
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-6">
        {/* Page Title */}
        <h1 className="text-xl font-bold text-center py-8 text-gray-dark">
          관심사 선택하기
        </h1>

        <div className="flex flex-col gap-10">
          {INTEREST_CATEGORIES.map((category) => (
            <section key={category.id}>
              {/* Category Header */}
              <h2 className="text-lg font-bold text-gray-dark flex items-center gap-2 mb-4">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </h2>

              {/* Items Chips */}
              <div className="flex flex-wrap gap-2">
                {category.items.map((item) => {
                  const isSelected = selectedItems.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleItem(item)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <Button
          fullWidth
          size="lg"
          onClick={handleComplete}
          disabled={selectedItems.length === 0}
          className="shadow-lg font-bold text-lg h-14"
        >
          선택완료
        </Button>
      </div>
    </div>
  );
};

export default InterestPage;
