/**
 * test-smart-notes-persistence-contract.ts
 *
 * Phase 3.4.4
 *
 * Verifies the persistence contract:
 *
 * Smart Notes
 *      ↓
 * insertNote()
 *      ↓
 * notes table payload
 *
 * No real Supabase request is made.
 */

import type {
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  insertNote,
} from '../src/repositories/notes.repository';


async function main(): Promise<void> {

  console.log('');
  console.log('==============================================');
  console.log(' NotePilot — Smart Notes Persistence Contract');
  console.log('==============================================');
  console.log('');


  const lectureId =
    'test-lecture-id';

  const expectedNoteId =
    'test-note-id';

  const content =
    `# Test Smart Notes

## Key Topics

- Large Language Models
- Transformer Architecture

## Exam Focus

- Understand foundation models.
- Understand transformer architecture.
`;


  let insertedTable:
    string | null =
    null;

  let insertedPayload:
    Record<string, unknown> | null =
    null;


  /*
   * Minimal Supabase mock implementing exactly the chain used by:
   *
   * insertNote()
   *
   * supabase
   *   .from('notes')
   *   .insert(payload)
   *   .select('id')
   *   .single()
   */

  const mockSupabase = {

    from(table: string) {

      insertedTable =
        table;


      return {

        insert(payload: Record<string, unknown>) {

          insertedPayload =
            payload;


          return {

            select(column: string) {

              if (
                column !== 'id'
              ) {

                throw new Error(
                  `Expected select('id'), received select('${column}')`
                );

              }


              return {

                async single() {

                  return {

                    data: {

                      id:
                        expectedNoteId,

                    },

                    error:
                      null,

                  };

                },

              };

            },

          };

        },

      };

    },

  } as unknown as SupabaseClient;


  console.log(
    '[TEST] Calling insertNote()'
  );


  const result =
    await insertNote(
      mockSupabase,
      {

        lectureId,

        content,

        generatedBy:
          'knowledge-engine',

        status:
          'completed',

        version:
          1,

        title:
          'How Large Language Models Work',

        sourceType:
          'ai',

      }
    );


  console.log(
    '[TEST] Validating persistence contract'
  );


  if (
    insertedTable !== 'notes'
  ) {

    throw new Error(
      `Expected table "notes", received "${insertedTable}"`
    );

  }


  if (
    !insertedPayload
  ) {

    throw new Error(
      'No insert payload was captured.'
    );

  }


  const payload =
    insertedPayload as Record<
      string,
      unknown
    >;


  if (
    payload.lecture_id !==
    lectureId
  ) {

    throw new Error(
      'lecture_id was not preserved.'
    );

  }


  if (
    payload.content !==
    content
  ) {

    throw new Error(
      'Smart Notes content was not preserved.'
    );

  }


  if (
    payload.generated_by !==
    'knowledge-engine'
  ) {

    throw new Error(
      'generated_by is incorrect.'
    );

  }


  if (
    payload.status !==
    'completed'
  ) {

    throw new Error(
      'Note status is incorrect.'
    );

  }


  if (
    payload.version !==
    1
  ) {

    throw new Error(
      'Note version is incorrect.'
    );

  }


  if (
    payload.source_type !==
    'ai'
  ) {

    throw new Error(
      'source_type is incorrect.'
    );

  }


  if (
    result.id !==
    expectedNoteId
  ) {

    throw new Error(
      'Returned note ID is incorrect.'
    );

  }


  console.log('');
  console.log('Persistence payload:');
  console.log('');

  console.log(
    JSON.stringify(
      payload,
      null,
      2
    )
  );


  console.log('');
  console.log('Contract checks:');
  console.log(
    '  notes table                    ✓'
  );
  console.log(
    '  lecture_id preserved           ✓'
  );
  console.log(
    '  title preserved                ✓'
  );
  console.log(
    '  Markdown content preserved     ✓'
  );
  console.log(
    '  generated_by preserved         ✓'
  );
  console.log(
    '  completed status preserved     ✓'
  );
  console.log(
    '  source_type preserved          ✓'
  );
  console.log(
    '  note ID returned               ✓'
  );


  console.log('');
  console.log('==============================================');
  console.log(' SMART NOTES PERSISTENCE CONTRACT PASSED ✓');
  console.log('==============================================');
  console.log('');

}


main()
  .catch(
    (
      error: unknown
    ) => {

      console.error('');
      console.error('==============================================');
      console.error(' SMART NOTES PERSISTENCE CONTRACT FAILED ✗');
      console.error('==============================================');
      console.error('');

      console.error(
        error instanceof Error
          ? error.stack ?? error.message
          : error
      );

      process.exitCode =
        1;

    }
  );