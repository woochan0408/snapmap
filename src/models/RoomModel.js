export default class RoomModel {
  constructor({ id, width, height, topLeft }) {
    this.id = id; // Excel 숫자
    this.width = width; // 셀 단위
    this.height = height; // 셀 단위
    this.topLeft = topLeft; // [row, col]
  }
}
