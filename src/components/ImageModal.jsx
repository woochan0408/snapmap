import { useState, useEffect, useRef } from "react";
import "../styles/ImageModal.css";

export default function ImageModal({ 
  images, 
  currentIndex, 
  onClose, 
  onPrev, 
  onNext, 
  roomId, 
  imageType 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const modalRef = useRef(null);
  const imageRef = useRef(null);

  const imageTypeLabel = imageType === "safe" ? "정상" : "불량";

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // 터치/마우스 이벤트 핸들러
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const deltaX = clientX - startX;
    setTranslateX(deltaX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (translateX > threshold && currentIndex > 0) {
      onPrev();
    } else if (translateX < -threshold && currentIndex < images.length - 1) {
      onNext();
    }
    setTranslateX(0);
  };

  // 마우스 이벤트
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // 터치 이벤트
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // 배경 클릭 시 모달 닫기
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  return (
    <div 
      ref={modalRef}
      className="image-modal-overlay"
      onClick={handleBackdropClick}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
    >
      <div className="image-modal">
        {/* 헤더 */}
        <div className="modal-header">
          <div className="modal-info">
            <h3>Room {roomId} - {imageTypeLabel} 사진</h3>
            <span className="image-counter">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 이미지 컨테이너 */}
        <div className="image-container">
          <div 
            className="image-wrapper"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imageRef}
              src={`http://localhost:3001/api/room/${roomId}/images/${imageType}/${images[currentIndex]}`}
              alt={`Room ${roomId} ${imageTypeLabel} ${currentIndex + 1}`}
              className="modal-image"
              draggable={false}
            />
          </div>

          {/* 네비게이션 버튼 */}
          {images.length > 1 && (
            <>
              <button 
                className={`nav-button prev-button ${currentIndex === 0 ? 'disabled' : ''}`}
                onClick={onPrev}
                disabled={currentIndex === 0}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`nav-button next-button ${currentIndex === images.length - 1 ? 'disabled' : ''}`}
                onClick={onNext}
                disabled={currentIndex === images.length - 1}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* 썸네일 네비게이션 */}
        {images.length > 1 && (
          <div className="thumbnail-container">
            <div className="thumbnail-scroll">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => {
                    const diff = index - currentIndex;
                    if (diff > 0) {
                      for (let i = 0; i < diff; i++) onNext();
                    } else if (diff < 0) {
                      for (let i = 0; i < Math.abs(diff); i++) onPrev();
                    }
                  }}
                >
                  <img
                    src={`http://localhost:3001/api/room/${roomId}/images/${imageType}/${image}`}
                    alt={`Thumbnail ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 하단 컨트롤 */}
        <div className="modal-footer">
          <div className="swipe-hint">
            {images.length > 1 && "← → 스와이프하거나 키보드 화살표로 이동"}
          </div>
        </div>
      </div>
    </div>
  );
}