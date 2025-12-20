/**
 * @module ExcelExport
 * @description Excel 파일 내보내기/가져오기 기능
 *
 * 지원 형식:
 * - .xlsx (Excel 2007+)
 * - .csv (범용)
 * - .json (개발용)
 */

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  autoWidth?: boolean;
  freezeHeader?: boolean;
  dateFormat?: string;
  numberFormat?: string;
  currencyFormat?: string;
}

export interface ColumnConfig {
  key: string;
  header: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'currency' | 'boolean';
  style?: Partial<ExcelJS.Style>;
}

// BIDFLOW 입찰 컬럼 기본 설정
export const BID_COLUMNS: ColumnConfig[] = [
  { key: 'id', header: 'ID', width: 10 },
  { key: 'source', header: '출처', width: 12 },
  { key: 'external_id', header: '공고번호', width: 18 },
  { key: 'title', header: '공고명', width: 50 },
  { key: 'organization', header: '발주기관', width: 25 },
  { key: 'deadline', header: '마감일', width: 15, type: 'date' },
  { key: 'estimated_amount', header: '추정가', width: 18, type: 'currency' },
  { key: 'status', header: '상태', width: 12 },
  { key: 'priority', header: '우선순위', width: 10 },
  { key: 'type', header: '유형', width: 10 },
  { key: 'keywords', header: '키워드', width: 30 },
  { key: 'match_score', header: '매칭점수', width: 12, type: 'number' },
  { key: 'ai_summary', header: 'AI 요약', width: 60 },
  { key: 'url', header: 'URL', width: 40 },
];

// 상태 한글 매핑
const STATUS_MAP: Record<string, string> = {
  new: '신규',
  reviewing: '검토중',
  preparing: '준비중',
  submitted: '제출완료',
  won: '낙찰',
  lost: '탈락',
  cancelled: '취소',
};

// 우선순위 한글 매핑
const PRIORITY_MAP: Record<string, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

// 출처 한글 매핑
const SOURCE_MAP: Record<string, string> = {
  narajangto: '나라장터',
  ted: 'TED(EU)',
  sam: 'SAM.gov',
  kepco: '한전',
  kwater: '수자원공사',
  manual: '수동입력',
};

/**
 * 데이터를 Excel 파일로 내보내기
 */
export async function exportToExcel(
  data: Record<string, unknown>[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = `BIDFLOW_${new Date().toISOString().split('T')[0]}`,
    sheetName = 'BIDFLOW 입찰목록',
    includeHeaders = true,
    autoWidth = true,
    freezeHeader = true,
    // 추후 포맷 적용 시 사용 예정
    // dateFormat = 'YYYY-MM-DD',
    // currencyFormat = '#,##0"원"',
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BIDFLOW';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  // 컬럼 설정
  worksheet.columns = BID_COLUMNS.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // 데이터 추가 (값 변환 포함)
  data.forEach(row => {
    const transformedRow: Record<string, unknown> = {};

    BID_COLUMNS.forEach(col => {
      let value = row[col.key];

      // 값 변환
      if (col.key === 'status' && typeof value === 'string') {
        value = STATUS_MAP[value] || value;
      } else if (col.key === 'priority' && typeof value === 'string') {
        value = PRIORITY_MAP[value] || value;
      } else if (col.key === 'source' && typeof value === 'string') {
        value = SOURCE_MAP[value] || value;
      } else if (col.key === 'keywords' && Array.isArray(value)) {
        value = value.join(', ');
      } else if (col.key === 'match_score' && typeof value === 'number') {
        value = `${Math.round(value * 100)}%`;
      }

      transformedRow[col.key] = value;
    });

    worksheet.addRow(transformedRow);
  });

  // 헤더 스타일 적용
  if (includeHeaders) {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }, // BIDFLOW 브랜드 컬러
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;
  }

  // 헤더 고정
  if (freezeHeader) {
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // 자동 너비 조정
  if (autoWidth) {
    worksheet.columns.forEach(column => {
      if (!column.width) {
        let maxLength = 10;
        column.eachCell?.({ includeEmpty: true }, cell => {
          const length = String(cell.value || '').length;
          if (length > maxLength) {
            maxLength = Math.min(length, 50);
          }
        });
        column.width = maxLength + 2;
      }
    });
  }

  // 데이터 행 스타일
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });

      // 짝수 행 배경색
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9FAFB' },
        };
      }
    }
  });

  // 파일 저장
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Excel 파일에서 데이터 가져오기
 */
export async function importFromExcel(
  file: File
): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('워크시트를 찾을 수 없습니다.');
  }

  const data: Record<string, unknown>[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // 헤더 행
      row.eachCell((cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value || '');
      });
    } else {
      // 데이터 행
      const rowData: Record<string, unknown> = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value;
        }
      });
      data.push(rowData);
    }
  });

  return data;
}

/**
 * CSV로 내보내기
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  filename = `BIDFLOW_${new Date().toISOString().split('T')[0]}`
): void {
  const headers = BID_COLUMNS.map(col => col.header);
  const rows = data.map(row =>
    BID_COLUMNS.map(col => {
      let value = row[col.key];

      // 값 변환
      if (col.key === 'status' && typeof value === 'string') {
        value = STATUS_MAP[value] || value;
      } else if (col.key === 'priority' && typeof value === 'string') {
        value = PRIORITY_MAP[value] || value;
      } else if (col.key === 'source' && typeof value === 'string') {
        value = SOURCE_MAP[value] || value;
      } else if (Array.isArray(value)) {
        value = value.join('; ');
      }

      // CSV 이스케이프
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel 한글 지원
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}

/**
 * JSON으로 내보내기
 */
export function exportToJSON(
  data: Record<string, unknown>[],
  filename = `BIDFLOW_${new Date().toISOString().split('T')[0]}`
): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${filename}.json`);
}

const excelExport = {
  exportToExcel,
  importFromExcel,
  exportToCSV,
  exportToJSON,
  BID_COLUMNS,
};

export default excelExport;
