/**
 * logger.ts
 *
 * Reusable structured logger for the NotePilot backend pipeline.
 * Outputs timestamped, consistently-formatted messages to stdout/stderr.
 *
 * Usage:
 *   import { log } from '../utils/logger';
 *   log.info('Upload', 'Request received');
 *   log.success('Downloader', 'Audio downloaded');
 *   log.warn('Cleanup', 'File not found');
 *   log.error('Processor', 'Pipeline failed', error);
 *   log.banner('YouTube Processor Started');
 *   log.stage(2, 6, 'Fetching Metadata');
 */

const ts = (): string => new Date().toISOString();

function fmt(level: string, context: string, message: string): string {
  return `[${ts()}] [${level}] [${context}] ${message}`;
}

function divider(char = '─', len = 60): string {
  return char.repeat(len);
}

export const log = {
  /** Informational step — grey/white */
  info(context: string, message: string, data?: Record<string, unknown>): void {
    console.log(fmt('INFO ', context, message));
    if (data) {
      Object.entries(data).forEach(([k, v]) =>
        console.log(`  ${k.padEnd(16)}: ${v}`)
      );
    }
  },

  /** Successful completion of a step — green ✓ */
  success(context: string, message: string, data?: Record<string, unknown>): void {
    console.log(fmt('  OK ', context, `✓ ${message}`));
    if (data) {
      Object.entries(data).forEach(([k, v]) =>
        console.log(`  ${k.padEnd(16)}: ${v}`)
      );
    }
  },

  /** Non-fatal warning */
  warn(context: string, message: string): void {
    console.warn(fmt('WARN ', context, `⚠ ${message}`));
  },

  /**
   * Fatal error — always prints full message + stack trace + serialised error.
   * Never swallows. Always call this in catch blocks.
   */
  error(context: string, message: string, error?: unknown): void {
    console.error('');
    console.error(divider('═'));
    console.error(fmt('ERROR', context, `✗ ${message}`));
    if (error) {
      if (error instanceof Error) {
        console.error(`  Message    : ${error.message}`);
        console.error(`  Stack      :\n${error.stack}`);
      }
      try {
        console.error(`  Full Error : ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`);
      } catch {
        console.error(`  Full Error : [not serialisable]`);
      }
    }
    console.error(divider('═'));
    console.error('');
  },

  /** Bold banner — pipeline boundaries */
  banner(title: string, data?: Record<string, unknown>): void {
    console.log('');
    console.log(divider('═'));
    console.log(`  ${title}`);
    if (data) {
      console.log(divider('─'));
      Object.entries(data).forEach(([k, v]) =>
        console.log(`  ${k.padEnd(16)}: ${v}`)
      );
    }
    console.log(divider('═'));
  },

  /** Numbered pipeline stage header */
  stage(n: number, total: number, name: string): void {
    console.log('');
    console.log(`${divider('─', 40)}`);
    console.log(`  [Stage ${n}/${total}] ${name}`);
    console.log(`${divider('─', 40)}`);
  },
};
