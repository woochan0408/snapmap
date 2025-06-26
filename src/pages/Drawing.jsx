import { useEffect, useState } from "react";
import { mapParser } from "../parsers/mapParser.js";
import { roomParser } from "../parsers/roomParser.js";
import { MapContext } from "../context/MapContext.jsx";
import useWindowSize from "../hooks/useWindowSize.js";
import ImageModal from "../components/ImageModal.jsx";
import "../styles/Drawing.css";

export default function Drawing() {
  const [mapModel, setMapModel] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [viewportW, viewportH] = useWindowSize();
  const [roomStatus, setRoomStatus] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageType, setImageType] = useState("");

  // 최초 1회 Excel → MapModel 및 룸 상태 로딩
  useEffect(() => {
    (async () => {
      try {
        const map = await mapParser();
        roomParser(map);
        map.updateCellSize(viewportW, viewportH);
        setMapModel(map);

        // 룸 상태 로딩
        const response = await fetch("http://localhost:3001/api/rooms/status");
        const status = await response.json();
        setRoomStatus(status);
      } catch (err) {
        alert(err.message);
      }
    })();
  }, []);

  // 윈도우 사이즈 변화 시 셀 크기 갱신
  useEffect(() => {
    if (!mapModel) return;
    mapModel.updateCellSize(viewportW, viewportH);
    setMapModel({ ...mapModel });
  }, [viewportW, viewportH]);

  // 룸 클릭 핸들러
  const handleRoomClick = async (room) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/room/${room.id}/status`
      );
      const roomData = await response.json();

      if (!roomData.exists) {
        alert("해당 방의 사진이 없습니다.");
        return;
      }

      setSelectedRoom({ ...room, ...roomData });
    } catch {
      alert("방 정보를 불러오는데 실패했습니다.");
    }
  };

  // 이미지 보기 핸들러
  const handleShowImages = async (type) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/room/${selectedRoom.id}/images/${type}`
      );
      const data = await response.json();

      if (data.images.length === 0) {
        alert(`${type === "safe" ? "정상" : "불량"} 사진이 없습니다.`);
        return;
      }

      setCurrentImages(data.images);
      setImageType(type);
      setCurrentImageIndex(0);
      setShowImageModal(true);
    } catch {
      alert("이미지를 불러오는데 실패했습니다.");
    }
  };

  // 이미지 슬라이드 핸들러
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + currentImages.length) % currentImages.length
    );
  };

  if (!mapModel) {
    return (
      <div className="drawing-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">도면을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const { rooms } = mapModel;

  // 화면에 맞게 도면 크기 계산
  const availableWidth = viewportW - 100; // 패딩 고려
  const availableHeight = viewportH - 180; // 헤더와 패딩 고려

  const cellSizeByWidth = availableWidth / mapModel.colCount;
  const cellSizeByHeight = availableHeight / mapModel.rowCount;
  const cellSize = Math.min(
    cellSizeByWidth,
    cellSizeByHeight,
    mapModel.cellSize
  );

  const mapWidth = cellSize * mapModel.colCount;
  const mapHeight = cellSize * mapModel.rowCount;

  const containerStyle = {
    position: "relative",
    width: mapWidth,
    height: mapHeight,
    margin: "0px auto",
  };

  return (
    <MapContext.Provider value={mapModel}>
      <div className="drawing-page">
        <div className="drawing-container">
          <div className="map-wrapper">
            <div className="map-container" style={containerStyle}>
              {rooms.map((r) => {
                const isHover = hoverId === r.id;
                const hasDefective = roomStatus[r.id]?.hasDefective || false;

                return (
                  <div
                    key={r.id}
                    className={`room ${hasDefective ? "defective" : "normal"}`}
                    onMouseEnter={() => setHoverId(r.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => handleRoomClick(r)}
                    style={{
                      top: r.topLeft[0] * cellSize,
                      left: r.topLeft[1] * cellSize,
                      width: r.width * cellSize,
                      height: r.height * cellSize,
                    }}
                  >
                    {hasDefective && <span className="room-warning">⚠</span>}
                    R&nbsp;{r.id}
                  </div>
                );
              })}
            </div>

            {/* 범례 */}
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color normal"></div>
                <span>정상 상태</span>
              </div>
              <div className="legend-item">
                <div className="legend-color defective"></div>
                <span>불량 상태 (⚠ 표시)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 룸 정보 모달 */}
        {selectedRoom && !showImageModal && (
          <div
            className="room-modal-overlay"
            onClick={() => setSelectedRoom(null)}
          >
            <div className="room-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Room {selectedRoom.id}</h3>
                <button
                  className="close-button"
                  onClick={() => setSelectedRoom(null)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="room-stats">
                <div
                  className={`stat-card safe ${
                    selectedRoom.safeCount === 0 ? "disabled" : ""
                  }`}
                  onClick={() =>
                    selectedRoom.safeCount > 0 && handleShowImages("safe")
                  }
                >
                  <div className="stat-number">{selectedRoom.safeCount}</div>
                  <div className="stat-label">정상 사진</div>
                </div>
                <div
                  className={`stat-card defective ${
                    selectedRoom.defectiveCount === 0 ? "disabled" : ""
                  }`}
                  onClick={() =>
                    selectedRoom.defectiveCount > 0 &&
                    handleShowImages("defective")
                  }
                >
                  <div className="stat-number">
                    {selectedRoom.defectiveCount}
                  </div>
                  <div className="stat-label">불량 사진</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 이미지 뷰어 모달 */}
        {showImageModal && (
          <ImageModal
            images={currentImages}
            currentIndex={currentImageIndex}
            onClose={() => setShowImageModal(false)}
            onPrev={prevImage}
            onNext={nextImage}
            roomId={selectedRoom.id}
            imageType={imageType}
          />
        )}
      </div>
    </MapContext.Provider>
  );
}
