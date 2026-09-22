// src/lib/csv.ts
// Minimal, dependency-free CSV parser + serializer for the bulk member import.

export interface CsvRow { [key: string]: string; }

export function parseCsv(text: string): CsvRow[] {
  const rows = parseRawRows(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  const out: CsvRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const raw = rows[i];
    if (raw.every((c) => c.trim() === '')) continue;
    const row: CsvRow = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = (raw[j] ?? '').trim();
    }
    out.push(row);
  }
  return out;
}

function parseRawRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let i = 0;
  let inQuotes = false;
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  while (i < s.length) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cell += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(cell); cell = ''; i++; continue; }
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; continue; }
    cell += ch; i++;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

export function toCsv(rows: Array<Record<string, unknown>>, columns?: string[]): string {
  if (rows.length === 0) return '';
  const cols = columns && columns.length ? columns : Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
}

export const SAMPLE_CSV_COLUMNS = [
  'fullName',
  'email',
  'password',
  'role',
  'teamIds',
  'committeeIds',
  'status',
  'hours',
  'points',
  'joinedSeason',
  'bio',
];

export function buildSampleCsv(teamIds: string[], committeeIds: string[]): string {
  const header = SAMPLE_CSV_COLUMNS.join(',');
  const example = [
    'Ahmed Mohamed',
    'ahmed@resala-stem.org',
    'ChangeMe#123',
    'MEMBER',
    teamIds.slice(0, 1).join('|') || 'helpers',
    committeeIds.slice(0, 1).join('|') || 'committee-1',
    'active',
    '0',
    '0',
    '7',
    'New volunteer',
  ].map((v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v)).join(',');
  return header + '\n' + example + '\n';
}
