import React, { type ReactNode } from 'react';
import logo from '@/assets/images/logo.png';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'center' | 'bottom'; // 모달 타입: center(중앙) or bottom(바텀 시트)
  title?: string;
  message?: string;
  image?: string | ReactNode; // 로고 URL or 프로필 이미지 컴포넌트
  showLogo?: boolean; // 로고 표시 여부
  showInput?: boolean;
  inputPlaceholder?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  showCheckbox?: boolean; // 재확인 체크박스 표시 여부
  checkboxLabel?: string; // 체크박스 라벨
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  singleButton?: boolean; // OK 버튼만 표시
  children?: ReactNode;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'default' | 'danger' }>; // 바텀 시트 액션들
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  type = 'center',
  title,
  message,
  image,
  showLogo = false,
  showInput = false,
  inputPlaceholder,
  inputValue,
  onInputChange,
  showCheckbox = false,
  checkboxLabel = '확인했습니다',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  singleButton = false,
  actions,
  children,
}) => {
  const [isChecked, setIsChecked] = React.useState(false);

  // 모달이 닫힐 때 체크박스 상태 초기화
  React.useEffect(() => {
    if (!isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // 바텀 시트 스타일
  if (type === 'bottom') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center px-4 pb-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Bottom Sheet Content */}
        <div className="relative bg-white rounded-2xl w-full max-w-[390px] overflow-hidden shadow-xl animate-slide-up max-h-[80vh] flex flex-col">
          {title && (
            <div className="px-6 pt-5 pb-2 flex-shrink-0">
              <h3 className="text-center font-semibold text-sm text-gray-900">{title}</h3>
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="overflow-y-auto flex-1">
              {actions.map((action, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <div className="border-t border-gray-200" />}
                  <button
                    onClick={() => {
                      action.onClick();
                    }}
                    className={`w-full px-6 py-4 text-center font-medium text-base transition hover:bg-gray-50 ${
                      action.variant === 'danger' ? 'text-primary' : 'text-gray-900'
                    }`}
                  >
                    {action.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* 취소 버튼 */}
          <div className="border-t-8 border-gray-100 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-4 text-center font-medium text-base text-gray-600 hover:bg-gray-50 transition"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 센터 모달 스타일 (기존)
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={singleButton ? onClose : undefined} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-[90%] max-w-sm mx-4 overflow-hidden shadow-xl">
        {/* Logo or Image */}
        {(showLogo || image) && (
          <div className="flex justify-center pt-8 pb-4">
            {showLogo ? (
              <img src={logo} alt="logo" className="w-10 h-10 object-contain" />
            ) : typeof image === 'string' ? (
              <img src={image} alt="modal" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="scale-75">{image}</div>
            )}
          </div>
        )}

        {/* Title (optional) */}
        {title && (
          <div className={`px-6 pb-3 ${!showLogo && !image ? 'pt-8' : ''}`}>
            <h3 className="text-center font-semibold text-base">{title}</h3>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`px-6 pb-6 ${!showLogo && !image && !title ? 'pt-8' : ''}`}>
            <p className="text-center text-sm text-gray-500">{message}</p>
          </div>
        )}

        {/* Children (Custom Content) */}
        {children && (
             <div className="px-6 pb-6">
                 {children}
             </div>
        )}

        {/* Input Field (optional) */}
        {showInput && (
          <div className="px-6 pb-6">
            <input
              type="text"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => onInputChange?.(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Checkbox (optional) */}
        {showCheckbox && (
          <div className="px-6 pb-6">
            <label className="flex items-center gap-2 cursor-pointer justify-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm text-gray-600">{checkboxLabel}</span>
            </label>
          </div>
        )}

        {/* Buttons */}
        <div className="border-t border-gray-200">
          {singleButton ? (
            <button
              onClick={handleConfirm}
              className="w-full py-4 text-center font-semibold text-sm text-gray-900 hover:bg-gray-50 transition"
            >
              {confirmText}
            </button>
          ) : (
            <div className="flex">
              <button
                onClick={handleCancel}
                className="flex-1 py-4 text-center font-semibold text-sm text-gray-600 hover:bg-gray-50 transition border-r border-gray-200"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={showCheckbox && !isChecked}
                className={`flex-1 py-4 text-center font-semibold text-sm transition ${
                  showCheckbox && !isChecked
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-primary hover:bg-gray-50'
                }`}
              >
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
