import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { routing } from './routing';
import englishMessages from '../messages/en.json';

function mergeMessages(base: AbstractIntlMessages, override: AbstractIntlMessages): AbstractIntlMessages {
  const merged: AbstractIntlMessages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object'
      ? mergeMessages(base[key] as AbstractIntlMessages, value as AbstractIntlMessages)
      : value;
  }
  return merged;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const localMessages = (await import(`../messages/${locale}.json`)).default as AbstractIntlMessages;
  return { locale, messages: locale === 'en' ? localMessages : mergeMessages(englishMessages as AbstractIntlMessages, localMessages) };
});
