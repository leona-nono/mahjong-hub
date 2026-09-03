import type { BlogFaq, BlogSection } from '../blog';

/** One locale file: slug → full translated article (no English base). */
export type BlogLocaleJson = Record<
  string,
  {
    title: string;
    description: string;
    sections: BlogSection[];
    faq: BlogFaq[];
  }
>;
