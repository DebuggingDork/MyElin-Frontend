"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { MaskReveal } from "@/components/ui/ScrollEffects";
import { InkWash, SectionLabel } from "@/components/ui/SectionLabel";
import { WordReveal } from "@/components/ui/TextReveal";

const faqs = [
  {
    q: "What is Myelin?",
    a: "Myelin is a learning environment where students discover how professionals think — through judgment, consequence, and reflection — instead of being told what to think.",
  },
  {
    q: "How is this different from case studies or quizzes?",
    a: "Case studies and quizzes test recall or hindsight. Myelin places learners in living decision environments where information is incomplete, consequences unfold over time, and there is no single correct answer on a rubric.",
  },
  {
    q: "What do students actually do?",
    a: "They investigate ambiguous situations, commit to decisions, experience how a simulated world reacts, and reflect on the thinking patterns behind the outcome — then adapt and decide again.",
  },
  {
    q: "What are the hidden mental models?",
    a: "Every simulation confronts a cognitive trap professionals face — survivorship bias, confirmation bias, anchoring, Goodhart's Law, loss aversion, second-order effects, and more — while students believe they are simply running a business scenario.",
  },
  {
    q: "What is the Judgment Portfolio?",
    a: "A living profile of how a student reasons — problem framing, evidence gathering, decision quality, adaptability, systems thinking, reflection, and risk awareness. No GPA. No percentages. Evidence recruiters have rarely been able to see.",
  },
  {
    q: "Who is Myelin for?",
    a: "Students who need to rehearse real decisions, faculty who want to facilitate inquiry instead of lecture, universities seeking deeper engagement, and recruiters who need verifiable evidence of judgment under uncertainty.",
  },
  {
    q: "Which subjects does it support?",
    a: "Business education ecosystems including analytics, marketing, finance, operations, strategy, entrepreneurship, accounting, supply chain, leadership, HR, taxation, and auditing — each with distinct decisions and habits of mind.",
  },
  {
    q: "Is Myelin gamification?",
    a: "No. Mechanics map to cognitive science: experience, reflection, feedback, iteration, pattern recognition, transfer of learning, and decision making — not points for their own sake.",
  },
  {
    q: "How much does it cost?",
    a: "Early university partnerships are free. We are building decision environments with partners first; commercial pricing comes later.",
  },
  {
    q: "How do we get started?",
    a: "Request access and bring Myelin to your faculty. We onboard partners into living decision environments and simulation ecosystems tailored to your programs.",
  },
];

export function FAQ() {
  return (
    <section
      id="faq"
      className="relative scroll-mt-24 overflow-hidden bg-bg-soft py-28 sm:py-36"
      aria-labelledby="faq-heading"
    >
      <InkWash />

      <Container className="relative z-10">
        <MaskReveal>
          <SectionLabel>FAQ</SectionLabel>
          <h2
            id="faq-heading"
            className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-brand-deep sm:text-5xl"
          >
            <WordReveal text="Questions worth answering." as="span" />
          </h2>
        </MaskReveal>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Straight answers about how Myelin teaches professional thinking —
          without quizzes, MCQs, or static games.
        </p>

        <div className="mx-auto mt-12 max-w-3xl rounded-[1.75rem] border border-border bg-white px-5 sm:px-8">
          <Accordion type="single" collapsible defaultValue="item-0">
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-[15px] text-brand-deep sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
