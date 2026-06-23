import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from 'framer-motion';

const faqs = [
  {
    question: "What types of files can I upload?",
    answer: "NotePilot supports a wide range of formats including video (MP4, MOV), audio (MP3, WAV), PDF documents, PowerPoint slides, and even direct YouTube links."
  },
  {
    question: "How accurate is the lecture transcription?",
    answer: "We use state-of-the-art AI speech-to-text models that boast over 95% accuracy, even with technical jargon, heavy accents, and moderate background noise."
  },
  {
    question: "Can I export my flashcards?",
    answer: "Yes! You can export your flashcards directly to popular spaced repetition systems like Anki and Quizlet, or download them as CSV files."
  },
  {
    question: "Is there a limit on file size?",
    answer: "Free users can upload files up to 100MB per file. Pro users enjoy uploads up to 2GB per file, perfect for 2-hour long 1080p video lectures."
  },
  {
    question: "How does the AI Tutor work?",
    answer: "The AI Tutor is context-aware. It only uses the transcripts and notes from your specific lecture to answer questions, ensuring you don't get hallucinated answers from outside sources that conflict with your professor's teachings."
  }
];

export function FAQSection() {
  return (
    <section
      id="faq"
      className="py-24"
      style={{ background: 'var(--np-bg-primary)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--np-text-primary)' }}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl"
            style={{ color: 'var(--np-text-secondary)' }}
          >
            Got questions? We've got answers.
          </motion.p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              style={{ borderColor: 'var(--np-border)' }}
            >
              <AccordionTrigger
                className="text-left text-lg font-medium hover:no-underline py-6 transition-colors duration-200"
                style={{ color: 'var(--np-text-primary)' }}
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent
                className="text-base leading-relaxed pb-6"
                style={{ color: 'var(--np-text-secondary)' }}
              >
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
