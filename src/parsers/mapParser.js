import * as XLSX from "xlsx";
import MapModel from "../models/MapModel.js";

/**
 * public/map.xlsx → MapModel
 * 1) Excel의 첫 시트만 사용
 * 2) 값이 있는 최소‧최대 범위를 찾아 0으로 패딩한 grid 생성
 */
export async function mapParser(xlsxRelPath = "/map.xlsx") {
  const res = await fetch(xlsxRelPath);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];

  // 시트의 셀 주소 범위
  const range = XLSX.utils.decode_range(ws["!ref"]);

  // 첫 값이 있는 셀(start), 마지막 값(end) 탐색
  let minRow = Infinity,
    minCol = Infinity,
    maxRow = -1,
    maxCol = -1;

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (!cell || cell.v === undefined || cell.v === null || cell.v === "")
        continue;

      minRow = Math.min(minRow, R);
      minCol = Math.min(minCol, C);
      maxRow = Math.max(maxRow, R);
      maxCol = Math.max(maxCol, C);
    }
  }
  if (minRow === Infinity) throw new Error("엑셀에 데이터가 없습니다.");

  const rowCount = maxRow - minRow + 1;
  const colCount = maxCol - minCol + 1;

  // 0 패딩된 2D 배열
  const grid = Array.from({ length: rowCount }, () => Array(colCount).fill(0));

  for (let R = minRow; R <= maxRow; R++) {
    for (let C = minCol; C <= maxCol; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      const val = cell ? Number(cell.v) : 0;
      grid[R - minRow][C - minCol] = Number.isFinite(val) ? val : 0;
    }
  }
  return new MapModel({ grid, rowCount, colCount });
}
