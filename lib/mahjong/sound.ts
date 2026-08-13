'use client';

import type { Tile } from './tiles';

export type MahjongSound = 'shuffle' | 'draw' | 'discard' | 'chi' | 'pon' | 'kan' | 'win' | 'toggle';
export type MahjongVoiceLocale = 'cantonese' | 'japanese' | 'none';

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  return audioContext;
}

export function primeMahjongAudio(): void {
  const context = getContext();
  if (context?.state === 'suspended') void context.resume();
}

function tone(
  context: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  gainValue: number,
  type: OscillatorType = 'sine'
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function tileClack(context: AudioContext, start: number, strength = 1): void {
  tone(context, 920, start, 0.045, 0.12 * strength, 'square');
  tone(context, 510, start + 0.012, 0.075, 0.09 * strength, 'triangle');
  tone(context, 180, start + 0.018, 0.06, 0.035 * strength, 'sine');
}

export function cantoneseTileLabel(tile: Tile): string {
  const rankNames = ['\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d', '\u4e03', '\u516b', '\u4e5d'];
  const suit = tile[0];
  const rank = Number(tile.slice(1));
  const rankName = rankNames[rank - 1] ?? '';
  if (suit === 'm') return `${rankName}\u842c`;
  if (suit === 'p') return `${rankName}\u7b52`;
  if (suit === 's') return `${rankName}\u7d22`;
  const honours: Record<number, string> = {
    1: '\u6771\u98a8',
    2: '\u5357\u98a8',
    3: '\u897f\u98a8',
    4: '\u5317\u98a8',
    5: '\u767d\u677f',
    6: '\u767c\u8ca1',
    7: '\u7d05\u4e2d'
  };
  return honours[rank] ?? tile;
}

function preferredCantoneseVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => /^(zh-hk|yue)/i.test(voice.lang)) ??
    voices.find((voice) => /cantonese|hong kong|hiumaan|hiu maan/i.test(voice.name));
}

function preferredJapaneseVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => /^ja-jp/i.test(voice.lang)) ?? voices.find((voice) => /japanese|kyoko|otoya/i.test(voice.name));
}

export function japaneseTileLabel(tile: Tile): string {
  const ranks = ['イー', 'リャン', 'サン', 'スー', 'ウー', 'ロー', 'チー', 'パー', 'キュー'];
  const rank = ranks[Number(tile.slice(1)) - 1] ?? '';
  if (tile[0] === 'm') return `${rank}マン`;
  if (tile[0] === 'p') return `${rank}ピン`;
  if (tile[0] === 's') return `${rank}ソウ`;
  const honours: Record<string, string> = { z1: 'トン', z2: 'ナン', z3: 'シャー', z4: 'ペー', z5: 'ハク', z6: 'ハツ', z7: 'チュン' };
  return honours[tile] ?? tile;
}

function announceCall(sound: MahjongSound, tile: Tile | undefined, voiceLocale: MahjongVoiceLocale): void {
  if (voiceLocale === 'none') return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const cantonese: Partial<Record<MahjongSound, string>> = {
    chi: '\u5403',
    pon: '\u78b0',
    kan: '\u6760',
    win: '\u80e1'
  };
  const japanese: Partial<Record<MahjongSound, string>> = {
    chi: 'チー', pon: 'ポン', kan: 'カン', win: 'ツモ'
  };
  const word = sound === 'discard' && tile
    ? (voiceLocale === 'japanese' ? japaneseTileLabel(tile) : cantoneseTileLabel(tile))
    : (voiceLocale === 'japanese' ? japanese[sound] : cantonese[sound]);
  if (!word) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = voiceLocale === 'japanese' ? 'ja-JP' : 'zh-HK';
  const voice = voiceLocale === 'japanese' ? preferredJapaneseVoice() : preferredCantoneseVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 1.08;
  utterance.pitch = 0.9;
  utterance.volume = 0.82;
  window.speechSynthesis.speak(utterance);
}
export function playMahjongSound(sound: MahjongSound, tile?: Tile, voiceLocale: MahjongVoiceLocale = 'cantonese', announce = true): void {
  if (announce) announceCall(sound, tile, voiceLocale);
  const context = getContext();
  if (!context) return;
  if (context.state === 'suspended') {
    void context.resume().then(() => playMahjongSound(sound, tile, voiceLocale, false));
    return;
  }

  const now = context.currentTime + 0.01;
  switch (sound) {
    case 'shuffle':
      Array.from({ length: 14 }, (_, index) => index).forEach((index) => {
        tileClack(context, now + index * 0.035, 0.34 + (index % 3) * 0.08);
      });
      tone(context, 135, now, 0.58, 0.035, 'sawtooth');
      break;
    case 'draw':
      tileClack(context, now, 0.42);
      tone(context, 620, now + 0.018, 0.045, 0.04, 'triangle');
      tone(context, 760, now + 0.052, 0.055, 0.03, 'sine');
      break;
    case 'discard':
      tileClack(context, now, 1);
      break;
    case 'chi':
      tileClack(context, now, 0.65);
      tone(context, 520, now + 0.055, 0.1, 0.07, 'sine');
      tone(context, 660, now + 0.1, 0.11, 0.065, 'sine');
      break;
    case 'pon':
      tileClack(context, now, 0.9);
      tileClack(context, now + 0.075, 0.75);
      tone(context, 740, now + 0.13, 0.12, 0.085, 'square');
      break;
    case 'kan':
      tileClack(context, now, 1.15);
      tone(context, 190, now + 0.04, 0.22, 0.1, 'sawtooth');
      tone(context, 620, now + 0.14, 0.2, 0.09, 'triangle');
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((frequency, index) =>
        tone(context, frequency, now + index * 0.09, 0.3, 0.085, 'sine')
      );
      tone(context, 392, now + 0.04, 0.55, 0.045, 'triangle');
      break;
    case 'toggle':
      tone(context, 660, now, 0.06, 0.045, 'sine');
      tone(context, 880, now + 0.05, 0.08, 0.04, 'sine');
      break;
  }
}
