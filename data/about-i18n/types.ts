import type { RichSegment } from '@/components/RichText';

export type AboutBullet = {
  label: string;
  text?: string;
  link?: { label: string; href: string };
  segments?: RichSegment[];
};

export type AboutSection = {
  heading: string;
  paragraphs?: RichSegment[][];
  bullets?: AboutBullet[];
  afterBullets?: RichSegment[][];
};

export type AboutDoc = {
  title: string;
  intro: string;
  metaDescription: string;
  sections: AboutSection[];
};
