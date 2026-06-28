import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export const LOGS_DIR = process.env.VERCEL ? path.join('/tmp', 'logs') : path.join(process.cwd(), 'logs');
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_HISTORY_DAYS = 7;

export interface LogFile {
  path: string;
  date: string;
  index: number;
  compressed: boolean;
}

export async function ensureLogsDir(): Promise<void> {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

export function getLogFilename(prefix: string, date: Date, index?: number): string {
  const dateStr = date.toISOString().split('T')[0];
  const baseName = `${prefix}-${dateStr}`;
  return index !== undefined && index > 0 ? `${baseName}-${index}.log.gz` : `${baseName}.log`;
}

export async function rotateLogFile(
  filePath: string,
  prefix: string,
  maxSize: number = MAX_FILE_SIZE,
): Promise<string | null> {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size < maxSize) {
      return null;
    }

    const dir = path.dirname(filePath);
    const basename = path.basename(filePath, '.log');
    const dateStr = basename.split('-').slice(-2).join('-').replace(/-\d+$/, '');
    const date = new Date(dateStr);
    const existing = listLogFiles(prefix, date);

    const nextIndex = existing.length + 1;
    const rotatedName = getLogFilename(prefix, date, nextIndex);
    const rotatedPath = path.join(dir, rotatedName);

    const content = fs.readFileSync(filePath);
    const compressed = await gzip(content);
    fs.writeFileSync(rotatedPath, compressed);

    fs.writeFileSync(filePath, '');

    return rotatedPath;
  } catch {
    return null;
  }
}

export function listLogFiles(prefix: string, date: Date): LogFile[] {
  if (!fs.existsSync(LOGS_DIR)) return [];

  const dateStr = date.toISOString().split('T')[0];
  const basePattern = new RegExp(`^${prefix}-${dateStr}(-\\d+)?\\.log(\\.gz)?$`);

  return fs
    .readdirSync(LOGS_DIR)
    .filter((f) => basePattern.test(f))
    .map((f) => {
      const isCompressed = f.endsWith('.gz');
      const cleanName = f.replace('.gz', '');
      const indexMatch = cleanName.match(/-(\d+)\.log$/);
      return {
        path: path.join(LOGS_DIR, f),
        date: dateStr,
        index: indexMatch ? parseInt(indexMatch[1], 10) : 0,
        compressed: isCompressed,
      };
    })
    .sort((a, b) => a.index - b.index);
}

export async function cleanupOldLogs(
  prefix: string,
  maxDays: number = MAX_HISTORY_DAYS,
): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxDays);

  if (!fs.existsSync(LOGS_DIR)) return;

  const files = fs.readdirSync(LOGS_DIR);
  const oldFiles = files.filter((f) => {
    const dateMatch = f.match(/-(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) return false;
    const fileDate = new Date(dateMatch[1]);
    return fileDate < cutoff;
  });

  for (const file of oldFiles) {
    try {
      fs.unlinkSync(path.join(LOGS_DIR, file));
    } catch {
      // Ignore deletion errors
    }
  }
}

export async function writeToFile(filePath: string, content: string): Promise<void> {
  await ensureLogsDir();
  fs.appendFileSync(filePath, content + '\n', 'utf8');
}

export async function readLogFile(filePath: string): Promise<string> {
  try {
    if (filePath.endsWith('.gz')) {
      const content = fs.readFileSync(filePath);
      const decompressed = await gunzip(content);
      return decompressed.toString('utf8');
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}
