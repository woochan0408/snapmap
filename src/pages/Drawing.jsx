import { useEffect, useState } from "react";
import { mapParser } from "../parsers/mapParser.js";
import { roomParser } from "../parsers/roomParser.js";
import { MapContext } from "../context/MapContext.jsx";
import useWindowSize from "../hooks/useWindowSize.js";

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

  if (!mapModel) return <p>Loading...</p>;

  const { cellSize, rooms } = mapModel;
  const containerStyle = {
    position: "relative",
    width: cellSize * mapModel.colCount,
    height: cellSize * mapModel.rowCount,
    border: "1px solid #ccc",
    margin: "0 auto",
  };

  return (
    <MapContext.Provider value={mapModel}>
      <div style={containerStyle}>
        {rooms.map((r) => {
          const isHover = hoverId === r.id;
          const hasDefective = roomStatus[r.id]?.hasDefective || false;

          return (
            <div
              key={r.id}
              onMouseEnter={() => setHoverId(r.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => handleRoomClick(r)}
              style={{
                position: "absolute",
                top: r.topLeft[0] * cellSize,
                left: r.topLeft[1] * cellSize,
                width: r.width * cellSize,
                height: r.height * cellSize,
                background: hasDefective ? "#ffcccb" : "#8ecae6",
                border: `3px solid ${
                  isHover ? "#ffb703" : hasDefective ? "#ff6b6b" : "#219ebc"
                }`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#023047",
                fontWeight: "bold",
                userSelect: "none",
                transition: "border-color .15s",
                cursor: "pointer",
              }}
            >
              {hasDefective && (
                <span
                  style={{
                    color: "#d63031",
                    marginRight: "5px",
                    fontSize: "18px",
                  }}
                >
                  ⚠
                </span>
              )}
              R&nbsp;{r.id}
            </div>
          );
        })}
      </div>

      {/* 룸 정보 모달 */}
      {selectedRoom && !showImageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "300px",
              textAlign: "center",
            }}
          >
            <h3>Room {selectedRoom.id}</h3>
            <div style={{ margin: "20px 0" }}>
              <button
                onClick={() => handleShowImages("safe")}
                disabled={selectedRoom.safeCount === 0}
                style={{
                  margin: "0 10px",
                  padding: "10px 20px",
                  backgroundColor:
                    selectedRoom.safeCount > 0 ? "#28a745" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    selectedRoom.safeCount > 0 ? "pointer" : "not-allowed",
                }}
              >
                정상 사진 ({selectedRoom.safeCount})
              </button>
              <button
                onClick={() => handleShowImages("defective")}
                disabled={selectedRoom.defectiveCount === 0}
                style={{
                  margin: "0 10px",
                  padding: "10px 20px",
                  backgroundColor:
                    selectedRoom.defectiveCount > 0 ? "#dc3545" : "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    selectedRoom.defectiveCount > 0 ? "pointer" : "not-allowed",
                }}
              >
                불량 사진 ({selectedRoom.defectiveCount})
              </button>
            </div>
            <button
              onClick={() => setSelectedRoom(null)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 이미지 뷰어 모달 */}
      {showImageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
        >
          <div
            style={{
              color: "white",
              marginBottom: "20px",
              fontSize: "18px",
            }}
          >
            Room {selectedRoom.id} - {imageType === "safe" ? "정상" : "불량"}{" "}
            사진 ({currentImageIndex + 1} / {currentImages.length})
          </div>

          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "70vh",
            }}
          >
            <img
              src={`http://localhost:3001/api/room/${selectedRoom.id}/images/${imageType}/${currentImages[currentImageIndex]}`}
              alt={`Room ${selectedRoom.id} ${imageType} ${
                currentImageIndex + 1
              }`}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />

            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: "absolute",
                    left: "-50px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: "absolute",
                    right: "-50px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "none",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  →
                </button>
              </>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => setShowImageModal(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              뒤로
            </button>
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedRoom(null);
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </MapContext.Provider>
  );
}
