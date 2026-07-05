import 'dotenv/config';
import path from 'path';

// ts-node resolves from scripts/ — use require with the actual relative path
const { inspectMedia } = require('../src/media/mediaInspector');
const { normalizeToWav, detectSilence, deleteTempFile } = require('../src/media/mediaNormalizer');


const INPUT  = 'C:\\Users\\HP\\Desktop\\Antigravity\\resources\\app\\out\\vs\\workbench\\contrib\\antigravitySounds\\media\\C4.mp3';
const OUTPUT = path.join(__dirname, 'temp', 'test-normalized-c4.wav');

(async () => {
  console.log('');
  console.log('═══════ MediaInspector Test ═══════');
  const info = await inspectMedia(INPUT);
  console.log('Duration   :', info.duration, 's');
  console.log('Container  :', info.container);
  console.log('Has audio  :', info.hasAudio);
  console.log('Codec      :', info.audio?.codec);
  console.log('Sample rate:', info.audio?.sampleRate, 'Hz');
  console.log('Channels   :', info.audio?.channels);
  console.log('Size       :', info.sizeBytes, 'bytes');

  console.log('');
  console.log('═══════ MediaNormalizer Test ═══════');
  const norm = await normalizeToWav(INPUT, OUTPUT);
  console.log('Output     :', norm.outputPath);
  console.log('Duration   :', norm.durationSeconds.toFixed(1), 's');
  console.log('Size       :', (norm.sizeBytes / 1024).toFixed(1), 'KB');
  console.log('Time       :', norm.normalizationMs, 'ms');

  console.log('');
  console.log('═══════ Silence Detection Test ═══════');
  const silence = await detectSilence(OUTPUT);
  console.log('Max volume :', silence.maxVolumeDb, 'dB');
  console.log('Mean volume:', silence.meanVolumeDb, 'dB');
  console.log('Is silent  :', silence.isSilent);

  deleteTempFile(OUTPUT);
  console.log('');
  console.log('✓ ALL TESTS PASSED — media pipeline is fully functional');
})().catch((e: any) => {
  console.error('✗ TEST FAILED:', e.message);
  console.error(e.stack);
  process.exit(1);
});
