import type { RichSegment } from '@/components/RichText';

export type HomeGuideBullet = {
  strong: string;
  text: string;
  link?: { label: string; href: string };
  links?: { label: string; href: string }[];
};

export type HomeGuideChoice = {
  prompt: string;
  answerStrong?: string;
  answerText?: string;
  link?: { label: string; href: string };
  answerSegments?: RichSegment[];
};

export type HomeGuideSection = {
  heading: string;
  bullets?: HomeGuideBullet[];
  choices?: HomeGuideChoice[];
};

export type HomeGuideDoc = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: HomeGuideSection[];
  closing: RichSegment[];
};
