import { GroqProvider } from './providers/groq.provider';
import type { TranscriptionProvider, TranscriptResult } from './types';
import { cleanupChunkFiles, mergeTranscriptChunks, splitAudioIntoChunks } from './audioSplitter';
import { log } from '../../utils/logger';

/**
 * Transcription Service
 *
 * The single public surface for all transcription.
 * Provider is lazily initialized on first call — this ensures dotenv has
 * already loaded environment variables before the provider reads GROQ_API_KEY.
 *
 * Future providers:
 *   import { LocalWhisperProvider } from './providers/local-whisper.provider';
 *   import { AssemblyAIProvider }   from './providers/assemblyai.provider';
 *   import { DeepgramProvider }     from './providers/deepgram.provider';
 */
let provider: TranscriptionProvider | null = null;

function getProvider(): TranscriptionProvider {
  if (!provider) {
    provider = new GroqProvider();
  }
  return provider;
}

export async function transcribe(filePath: string): Promise<TranscriptResult> {
  const providerInstance = getProvider();
  const chunkLengthSeconds = Number(process.env.AUDIO_CHUNK_LENGTH_SECONDS || 600);
  let splitResult: Awaited<ReturnType<typeof splitAudioIntoChunks>> | null = null;

  try {
    splitResult = await splitAudioIntoChunks(filePath, chunkLengthSeconds);

    if (splitResult.chunkPaths.length === 1) {
      return providerInstance.transcribe(filePath);
    }

    log.info('TranscriptionService', 'Processing long audio in chunks', {
      'File': filePath,
      'Chunks': String(splitResult.chunkPaths.length),
      'Chunk length': `${splitResult.chunkLengthSeconds}s`,
    });

    const chunkResults: TranscriptResult[] = [];

    for (const chunkPath of splitResult.chunkPaths) {
      log.info('TranscriptionService', 'Transcribing chunk', { 'Chunk': chunkPath });
      const chunkResult = await providerInstance.transcribe(chunkPath);
      chunkResults.push(chunkResult);
    }

    return mergeTranscriptChunks(chunkResults, 'audio');
  } finally {
    if (splitResult?.chunkPaths) {
      await cleanupChunkFiles(splitResult.chunkPaths).catch(() => undefined);
    }
  }
}
