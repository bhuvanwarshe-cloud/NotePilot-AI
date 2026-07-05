/**
 * test-audio-transcription.ts
 *
 * Standalone diagnostic script — bypasses the entire upload pipeline.
 * Calls TranscriptionService directly with a local audio file.
 *
 * Usage:
 *   npx ts-node scripts/test-audio-transcription.ts <path-to-audio-file>
 *
 * Example:
 *   npx ts-node scripts/test-audio-transcription.ts "C:\Users\HP\Music\lecture.mp3"
 *
 * If this script FAILS → the issue is inside the transcription layer (Groq / file).
 * If this script SUCCEEDS → the issue is in the Audio pipeline orchestration.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// ── Validate CLI arg ──────────────────────────────────────────────────────────
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('');
  console.error('ERROR: No file path provided.');
  console.error('Usage: npx ts-node scripts/test-audio-transcription.ts <path-to-audio-file>');
  console.error('');
  process.exit(1);
}

const absolutePath = path.resolve(inputPath);

// ── Pre-flight: verify file before touching any services ──────────────────────
console.log('');
console.log('══════════════════════════════════════════════════════════');
console.log('  Audio Transcription Diagnostic Script');
console.log('══════════════════════════════════════════════════════════');
console.log('');
console.log('[ File Verification ]');
console.log(`  Input arg         : ${inputPath}`);
console.log(`  Absolute path     : ${absolutePath}`);
console.log(`  Exists            : ${fs.existsSync(absolutePath)}`);

if (!fs.existsSync(absolutePath)) {
  console.error('');
  console.error('FATAL: File does not exist at the given path. Aborting.');
  process.exit(1);
}

const stats = fs.statSync(absolutePath);
const ext   = path.extname(absolutePath).toLowerCase();

console.log(`  Size (bytes)      : ${stats.size}`);
console.log(`  Size (MB)         : ${(stats.size / 1024 / 1024).toFixed(3)}`);
console.log(`  Extension         : ${ext}`);
console.log(`  Modified          : ${stats.mtime.toISOString()}`);

// Read first 12 bytes to show magic bytes
try {
  const buf = Buffer.alloc(12);
  const fd = fs.openSync(absolutePath, 'r');
  fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);
  console.log(`  Magic bytes [0..7]: ${Array.from(buf.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
} catch (e) {
  console.error(`  Magic bytes       : COULD NOT READ — ${e}`);
}

// Check readability
try {
  fs.accessSync(absolutePath, fs.constants.R_OK);
  console.log(`  Readable          : true`);
} catch {
  console.error(`  Readable          : FALSE — process cannot read this file`);
  process.exit(1);
}

console.log('');

// Gate: warn about suspiciously small files but don't abort (let Groq decide)
if (stats.size < 1024) {
  console.warn(`  ⚠ WARNING: File is only ${stats.size} bytes — likely not a real audio file.`);
  console.warn('    A real MP3 is typically 1–200 MB. Continuing anyway to show the Groq error...');
  console.warn('');
}

// ── Check GROQ_API_KEY ────────────────────────────────────────────────────────
const apiKey = process.env.GROQ_API_KEY;
console.log('[ Environment ]');
if (!apiKey) {
  console.error('  GROQ_API_KEY : NOT SET — add it to backend/.env');
  process.exit(1);
}
console.log(`  GROQ_API_KEY : ${apiKey.slice(0, 6)}…${apiKey.slice(-4)} (masked)`);
console.log('');

// ── Call Groq directly (mirrors groq.provider.ts exactly) ────────────────────
import Groq from 'groq-sdk';

const MODEL = 'whisper-large-v3-turbo';
const client = new Groq({ apiKey });

console.log('[ Groq Request ]');
console.log(`  Model             : ${MODEL}`);
console.log(`  File              : ${absolutePath}`);
console.log(`  Response format   : verbose_json`);
console.log(`  Language          : auto-detect`);
console.log('');
console.log('  Sending request to Groq API...');

const startMs = Date.now();

(async () => {
  try {
    const response = await client.audio.transcriptions.create({
      file:            fs.createReadStream(absolutePath),
      model:           MODEL,
      response_format: 'verbose_json',
    }) as any;

    const elapsed = Date.now() - startMs;
    const text     = response.text?.trim() ?? '';
    const language = response.language ?? 'unknown';
    const segments = response.segments ?? [];
    const duration = segments.length > 0 ? Math.ceil(segments[segments.length - 1]?.end ?? 0) : 0;
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;

    console.log('');
    console.log('══════════════════════════════════════════════════════════');
    console.log('  ✓ TRANSCRIPTION SUCCEEDED');
    console.log('══════════════════════════════════════════════════════════');
    console.log(`  Language          : ${language}`);
    console.log(`  Words             : ${wordCount}`);
    console.log(`  Characters        : ${text.length}`);
    console.log(`  Duration          : ${duration}s`);
    console.log(`  Segments          : ${segments.length}`);
    console.log(`  API time          : ${elapsed}ms`);
    console.log('');
    console.log('[ Transcript Preview (first 300 chars) ]');
    console.log(text.slice(0, 300));
    console.log('');
    console.log('RESULT: Groq works. If the Audio pipeline still fails,');
    console.log('        the issue is in the pipeline orchestration, not Groq.');

  } catch (err: any) {
    const elapsed = Date.now() - startMs;

    console.error('');
    console.error('══════════════════════════════════════════════════════════');
    console.error('  ✗ TRANSCRIPTION FAILED');
    console.error('══════════════════════════════════════════════════════════');
    console.error(`  Time elapsed      : ${elapsed}ms`);
    console.error(`  Error message     : ${err?.message}`);
    console.error(`  HTTP status       : ${err?.status ?? 'N/A'}`);
    console.error('');
    console.error('[ Full Error Object ]');
    try {
      console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch {
      console.error(String(err));
    }
    console.error('');
    console.error('[ Stack Trace ]');
    console.error(err?.stack);
    console.error('');
    console.error('RESULT: Groq rejected the file. This is a file content issue,');
    console.error('        not a pipeline orchestration issue.');
    process.exit(1);
  }
})();
