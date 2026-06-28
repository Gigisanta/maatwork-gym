import * as fs from 'fs';
import * as path from 'path';
import { rotateLogFile, writeToFile, cleanupOldLogs, ensureLogsDir, LOGS_DIR } from './storage';
import { loggerConfig } from './config';

export interface RotatorOptions {
  prefix: string;
  maxSize?: number;
  maxHistory?: number;
}

export class LogRotator {
  private prefix: string;
  private maxSize: number;
  private maxHistory: number;
  private currentDate: string;
  private currentFilePath: string;

  constructor(options: RotatorOptions) {
    this.prefix = options.prefix;
    this.maxSize = options.maxSize ?? loggerConfig.maxFileSize;
    this.maxHistory = options.maxHistory ?? loggerConfig.maxHistoryDays;
    const now = new Date();
    this.currentDate = now.toISOString().split('T')[0];
    this.currentFilePath = path.join(LOGS_DIR, this.prefix + '-' + this.currentDate + '.log');
  }

  private ensureDate(): void {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.currentDate) {
      this.currentDate = today;
      this.currentFilePath = path.join(LOGS_DIR, this.prefix + '-' + this.currentDate + '.log');
    }
  }

  async write(content: string): Promise<void> {
    this.ensureDate();
    await ensureLogsDir();

    if (fs.existsSync(this.currentFilePath)) {
      const stats = fs.statSync(this.currentFilePath);
      if (stats.size >= this.maxSize) {
        await rotateLogFile(this.currentFilePath, this.prefix, this.maxSize);
        await cleanupOldLogs(this.prefix, this.maxHistory);
      }
    }

    await writeToFile(this.currentFilePath, content);
  }

  getCurrentPath(): string {
    this.ensureDate();
    return this.currentFilePath;
  }

  getPrefix(): string {
    return this.prefix;
  }
}
