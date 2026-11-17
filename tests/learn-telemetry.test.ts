import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackLearnEvent } from '@/features/learn/telemetry';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('trackLearnEvent', () => {
  it('pushes the funnel payload when dataLayer already exists', () => {
    const dataLayer: unknown[] = [];
    const gtag = vi.fn();
    const dispatched: unknown[] = [];
    vi.stubGlobal('window', {
      dataLayer,
      gtag,
      dispatchEvent: (event: CustomEvent) => {
        dispatched.push(event.detail);
      }
    });

    trackLearnEvent('learn_lesson_open', {
      path_id: 'start',
      step: 3,
      slug: 'mahjong-rules-beginners-complete-guide'
    });

    expect(dataLayer).toEqual([
      {
        event: 'learn_lesson_open',
        path_id: 'start',
        step: 3,
        slug: 'mahjong-rules-beginners-complete-guide'
      }
    ]);
    expect(gtag).toHaveBeenCalledWith('event', 'learn_lesson_open', {
      path_id: 'start',
      step: 3,
      slug: 'mahjong-rules-beginners-complete-guide'
    });
    expect(dispatched).toEqual(dataLayer);
  });

  it('does nothing observable when gtag and dataLayer are missing', () => {
    const dispatched: unknown[] = [];
    vi.stubGlobal('window', {
      dispatchEvent: (event: CustomEvent) => {
        dispatched.push(event.detail);
      }
    });

    expect(() =>
      trackLearnEvent('learn_lesson_step', {
        path_id: 'advanced',
        from_step: 2,
        direction: 'next'
      })
    ).not.toThrow();
    expect(dispatched).toEqual([
      {
        event: 'learn_lesson_step',
        path_id: 'advanced',
        from_step: 2,
        direction: 'next'
      }
    ]);
  });
});
