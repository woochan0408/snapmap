import RoomModel from "../models/RoomModel.js";

/**
 * grid 를 순회하며 중복/비직사각형 오류를 체크하고
 * MapModel.rooms 에 RoomModel push
 */
export function roomParser(mapModel) {
  const { grid, rowCount, colCount } = mapModel;
  const workGrid = grid.map((row) => [...row]); // 깊은 복사
  const idSet = new Set();

  const isSame = (r, c, id) =>
    r < rowCount && c < colCount && workGrid[r][c] === id;

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const id = workGrid[r][c];
      if (id === 0) continue;

      if (idSet.has(id))
        throw new Error(`중복된 방 번호 발견: ${id} (row ${r}, col ${c})`);
      idSet.add(id);

      // 가로 길이
      let width = 0;
      while (isSame(r, c + width, id)) width++;

      // 세로 길이 확인 (모든 행이 동일한 폭을 유지해야 직사각형)
      let height = 0;
      let validRect = true;
      while (isSame(r + height, c, id)) {
        for (let cc = c; cc < c + width; cc++) {
          if (!isSame(r + height, cc, id)) {
            validRect = false;
            break;
          }
        }
        if (!validRect) break;
        height++;
      }
      if (!validRect || width === 0 || height === 0)
        throw new Error(`방 ${id}이(가) 직사각형이 아닙니다.`);

      // mark visited → 0
      for (let rr = r; rr < r + height; rr++) {
        for (let cc = c; cc < c + width; cc++) workGrid[rr][cc] = 0;
      }

      // RoomModel 저장
      mapModel.rooms.push(
        new RoomModel({ id, width, height, topLeft: [r, c] })
      );
    }
  }
  return mapModel;
}
