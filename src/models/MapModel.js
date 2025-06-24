export default class MapModel {
  constructor({ grid, rowCount, colCount }) {
    this.grid = grid; // 2D 배열
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.cellSize = 0; // 화면에 맞춰 런타임 계산
    this.rooms = []; // RoomModel[] (roomParser 가 채움)

    // 경계 좌표
    this.topLeft = [0, 0];
    this.topRight = [0, colCount - 1];
    this.bottomLeft = [rowCount - 1, 0];
    this.bottomRight = [rowCount - 1, colCount - 1];
  }

  /** 뷰포트에 맞춰 셀 크기를 계산 */
  updateCellSize(viewportW, viewportH, margin = 32) {
    const maxW = viewportW - margin;
    const maxH = viewportH - margin;
    this.cellSize = Math.floor(
      Math.min(maxW / this.colCount, maxH / this.rowCount)
    );
  }
}
