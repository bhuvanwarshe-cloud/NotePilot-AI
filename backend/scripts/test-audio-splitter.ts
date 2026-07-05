import { strict as assert } from 'assert';
import { mergeTranscriptChunks } from '../src/services/transcription/audioSplitter';

const merged = mergeTranscriptChunks([
  {
    text: 'First chunk text.',
    language: 'en',
    durationSeconds: 10,
    wordCount: 3,
    charCount: 18,
    processingTimeMs: 800,
    source: 'audio',
    provider: 'groq-whisper-large-v3-turbo',
  },
  {
    text: 'Second chunk text.',
    language: 'en',
    durationSeconds: 12,
    wordCount: 3,
    charCount: 19,
    processingTimeMs: 750,
    source: 'audio',
    provider: 'groq-whisper-large-v3-turbo',
  },
], 'audio');

assert.strictEqual(merged.text, 'First chunk text. Second chunk text.');
assert.strictEqual(merged.wordCount, 6);
assert.strictEqual(merged.charCount, 36);
assert.strictEqual(merged.durationSeconds, 22);
assert.strictEqual(merged.processingTimeMs, 1550);
console.log('audio splitter merge test passed');
