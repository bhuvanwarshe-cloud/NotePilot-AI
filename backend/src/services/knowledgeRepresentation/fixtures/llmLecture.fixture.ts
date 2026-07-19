import type {
  KnowledgeExtraction,
} from '../extraction.schema';


export const validLLMLectureFixture: KnowledgeExtraction = {

  title:
    'How Large Language Models Work',

  language:
    'en',

  overview:
    'An introduction to large language models, foundation models, transformer architecture, training, next-word prediction, fine-tuning, and common business applications.',

  durationSeconds:
    314,

  author:
    'IBM Technology',


  // ───────────────────────────────────────────────────────────────────────────
  // Topics
  // ───────────────────────────────────────────────────────────────────────────

  topics: [

    {
      id:
        'topic_foundation_models',

      title:
        'Foundation Models and Large Language Models',

      explanation:
        'Introduces foundation models and explains the relationship between foundation models and large language models.',

      keyPoints: [

        {
          id:
            'point_llm_subset_foundation_model',

          text:
            'Large language models are presented as a subset of the broader foundation-model category.',

          sourceReference: {
            timestampSeconds:
              20,

            label:
              '00:20',
          },
        },

      ],

      conceptIds: [
        'concept_foundation_model',
        'concept_large_language_model',
      ],

      definitionIds: [
        'definition_foundation_model',
      ],

      formulaIds: [],

      exampleIds: [],

      visualInsightIds: [
        'visual_foundation_model_llm_diagram',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            20,

          label:
            '00:20',
        },

      ],
    },


    {
      id:
        'topic_transformer_architecture',

      title:
        'Transformer Architecture',

      explanation:
        'Explains that transformer architecture is a key architectural foundation behind modern large language models.',

      keyPoints: [

        {
          id:
            'point_transformer_relationships',

          text:
            'Transformers process sequence information and model relationships between words.',

          sourceReference: {
            timestampSeconds:
              174,

            label:
              '02:54',
          },
        },

      ],

      conceptIds: [
        'concept_transformer',
      ],

      definitionIds: [],

      formulaIds: [],

      exampleIds: [
        'example_next_word_prediction',
      ],

      visualInsightIds: [
        'visual_data_architecture_training',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            174,

          label:
            '02:54',
        },

      ],
    },

  ],


  // ───────────────────────────────────────────────────────────────────────────
  // Concepts
  // ───────────────────────────────────────────────────────────────────────────

  concepts: [

    {
      id:
        'concept_foundation_model',

      name:
        'Foundation Model',

      explanation:
        'A broad class of models trained on large amounts of data that can support multiple downstream tasks.',

      relatedConceptIds: [
        'concept_large_language_model',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            20,

          label:
            '00:20',
        },

      ],
    },


    {
      id:
        'concept_large_language_model',

      name:
        'Large Language Model',

      explanation:
        'A language-focused model capable of processing and generating natural-language content.',

      relatedConceptIds: [
        'concept_foundation_model',
        'concept_transformer',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            30,

          label:
            '00:30',
        },

      ],
    },


    {
      id:
        'concept_transformer',

      name:
        'Transformer',

      explanation:
        'An architecture used by modern large language models to process sequence information and relationships between words.',

      relatedConceptIds: [
        'concept_large_language_model',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            174,

          label:
            '02:54',
        },

      ],
    },

  ],


  // ───────────────────────────────────────────────────────────────────────────
  // Definitions
  // ───────────────────────────────────────────────────────────────────────────

  definitions: [

    {
      id:
        'definition_foundation_model',

      term:
        'Foundation Model',

      definition:
        'A model trained broadly enough to serve as a foundation for multiple downstream applications.',

      sourceReferences: [

        {
          timestampSeconds:
            20,

          label:
            '00:20',
        },

      ],
    },

  ],


  // ───────────────────────────────────────────────────────────────────────────
  // Formulas
  //
  // This lecture does not meaningfully teach mathematical formulas.
  // ───────────────────────────────────────────────────────────────────────────

  formulas: [],


  // ───────────────────────────────────────────────────────────────────────────
  // Examples
  // ───────────────────────────────────────────────────────────────────────────

  examples: [

    {
      id:
        'example_next_word_prediction',

      title:
        'Next-word prediction',

      description:
        'The lecture demonstrates language prediction using a partial phrase and shows how a model predicts an appropriate next word.',

      relatedConceptIds: [
        'concept_large_language_model',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            210,

          label:
            '03:30',
        },

      ],
    },

  ],


  // ───────────────────────────────────────────────────────────────────────────
  // Visual Insights
  // ───────────────────────────────────────────────────────────────────────────

  visualInsights: [

    {
      id:
        'visual_foundation_model_llm_diagram',

      type:
        'diagram',

      description:
        'Nested visual categories show large language models inside the broader foundation-model category.',

      educationalSignificance:
        'The diagram communicates the subset relationship between LLMs and foundation models.',

      relatedConceptIds: [
        'concept_foundation_model',
        'concept_large_language_model',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            20,

          label:
            '00:20',
        },

      ],
    },


    {
      id:
        'visual_data_architecture_training',

      type:
        'drawing',

      description:
        'The lecture visually organizes model development into data, architecture, and training.',

      educationalSignificance:
        'The visual communicates the major ingredients involved in building and training a large language model.',

      relatedConceptIds: [
        'concept_transformer',
      ],

      sourceReferences: [

        {
          timestampSeconds:
            150,

          label:
            '02:30',
        },

      ],
    },

  ],


  // ───────────────────────────────────────────────────────────────────────────
  // Timeline
  // ───────────────────────────────────────────────────────────────────────────

  timeline: [

    {
      id:
        'timeline_foundation_models',

      timestampSeconds:
        20,

      label:
        'Foundation models introduced',

      description:
        'Introduces foundation models and their relationship to large language models.',

      relatedTopicIds: [
        'topic_foundation_models',
      ],

      relatedConceptIds: [
        'concept_foundation_model',
        'concept_large_language_model',
      ],
    },


    {
      id:
        'timeline_transformer_intro',

      timestampSeconds:
        174,

      label:
        'Transformer architecture',

      description:
        'Introduces the transformer architecture used by modern large language models.',

      relatedTopicIds: [
        'topic_transformer_architecture',
      ],

      relatedConceptIds: [
        'concept_transformer',
      ],
    },

  ],

};