import { useEffect, useState } from "react";
import { mapParser } from "../parsers/mapParser.js";
import { roomParser } from "../parsers/roomParser.js";
import { MapContext } from "../context/MapContext.jsx";
import useWindowSize from "../hooks/useWindowSize.js";

export default function Drawing() {
  const [mapModel, setMapModel] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [viewportW, viewportH] = useWindowSize();

  // 최초 1회 Excel → MapModel
  useEffect(() => {
    (async () => {
      try {
        const map = await mapParser();
        roomParser(map);
        map.updateCellSize(viewportW, viewportH);
        setMapModel(map);
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
          return (
            <div
              key={r.id}
              onMouseEnter={() => setHoverId(r.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => alert(`room 정보\n ${JSON.stringify(r, null, 2)}`)}
              style={{
                position: "absolute",
                top: r.topLeft[0] * cellSize,
                left: r.topLeft[1] * cellSize,
                width: r.width * cellSize,
                height: r.height * cellSize,
                background: "#8ecae6",
                border: `3px solid ${isHover ? "#ffb703" : "#219ebc"}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#023047",
                fontWeight: "bold",
                userSelect: "none",
                transition: "border-color .15s",
              }}
            >
              room&nbsp;{r.id}
            </div>
          );
        })}
      </div>
    </MapContext.Provider>
  );
}
