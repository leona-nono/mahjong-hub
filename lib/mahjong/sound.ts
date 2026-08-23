'use client';

import type { Tile } from './tiles';

export type MahjongSound = 'build' | 'shuffle' | 'deal' | 'draw' | 'discard' | 'flower' | 'chi' | 'pon' | 'kan' | 'win' | 'toggle';
export type MahjongVoiceLocale = 'cantonese' | 'mandarin' | 'japanese' | 'english' | 'none';

let audioContext: AudioContext | null = null;
let openingTimers: ReturnType<typeof setTimeout>[] = [];

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

/** A short band-passed noise transient keeps tile impacts from sounding like
 * UI beeps. It is generated locally, so it needs no external sound asset. */
function ceramicNoise(context: AudioContext, start: number, strength: number): void {
  const duration = 0.045;
  const frames = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < frames; index += 1) {
    const decay = 1 - index / frames;
    samples[index] = (Math.random() * 2 - 1) * decay * decay;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2350, start);
  filter.Q.setValueAtTime(1.5, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.09 * strength, start + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
}

function tileClack(context: AudioContext, start: number, strength = 1): void {
  ceramicNoise(context, start, strength);
  tone(context, 760, start, 0.038, 0.08 * strength, 'triangle');
  tone(context, 410, start + 0.012, 0.07, 0.075 * strength, 'triangle');
  tone(context, 155, start + 0.018, 0.055, 0.03 * strength, 'sine');
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

/** Clear stale speech when a hand is restarted, paused, or settled. Browser
 * speech synthesis otherwise keeps utterances from an earlier table state and
 * can announce a tile after the player has already moved on. */
export function stopMahjongSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/** A cancellable mechanical opening sequence: build the wall, shuffle it, then
 * deal. Keeping this on one timeline prevents three independent sounds from
 * colliding when the player starts a new hand twice in quick succession. */
export function playMahjongOpeningSequence(voiceLocale: MahjongVoiceLocale): void {
  openingTimers.forEach((timer) => clearTimeout(timer));
  openingTimers = [];
  playMahjongSound('build', undefined, voiceLocale, false);
  openingTimers.push(setTimeout(() => playMahjongSound('shuffle', undefined, voiceLocale, false), 280));
  openingTimers.push(setTimeout(() => playMahjongSound('deal', undefined, voiceLocale, false), 980));
}

function preferredJapaneseVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => /^ja-jp/i.test(voice.lang)) ?? voices.find((voice) => /japanese|kyoko|otoya/i.test(voice.name));
}
function preferredMandarinVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => /^zh-cn/i.test(voice.lang)) ??
    voices.find((voice) => /^cmn/i.test(voice.lang)) ??
    voices.find((voice) => /^zh/i.test(voice.lang));
}
function preferredEnglishVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  return window.speechSynthesis.getVoices().find((voice) => /^en(-us|-gb)?$/i.test(voice.lang));
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
export function mandarinTileLabel(tile: Tile): string {
  const rankNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const rank = Number(tile.slice(1));
  if (tile[0] === 'm') return `${rankNames[rank - 1] ?? ''}万`;
  if (tile[0] === 'p') return `${rankNames[rank - 1] ?? ''}筒`;
  if (tile[0] === 's') return `${rankNames[rank - 1] ?? ''}条`;
  const honours: Record<string, string> = { z1: '东风', z2: '南风', z3: '西风', z4: '北风', z5: '白板', z6: '发财', z7: '红中' };
  return honours[tile] ?? tile;
}
export function englishTileLabel(tile: Tile): string {
  const rank = Number(tile.slice(1));
  const ranks = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  if (tile[0] === 'm') return ranks[rank - 1] + ' character';
  if (tile[0] === 'p') return ranks[rank - 1] + ' dot';
  if (tile[0] === 's') return ranks[rank - 1] + ' bamboo';
  const honours: Record<string, string> = { z1: 'east wind', z2: 'south wind', z3: 'west wind', z4: 'north wind', z5: 'white dragon', z6: 'green dragon', z7: 'red dragon' };
  return honours[tile] ?? tile;
}

function announceCall(sound: MahjongSound, tile: Tile | undefined, voiceLocale: MahjongVoiceLocale): void {
  if (voiceLocale === 'none') return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  // A deal/draw is a high-frequency mechanical action. Speaking it creates a
  // queue that is guaranteed to lag behind the table. Keep it as a clack only;
  // speech is reserved for meaningful, visible calls and discards.
  if (sound === 'build' || sound === 'shuffle' || sound === 'deal' || sound === 'draw' || sound === 'flower' || sound === 'toggle') return;
  const cantonese: Partial<Record<MahjongSound, string>> = {
    chi: '\u5403',
    pon: '\u78b0',
    kan: '\u6760',
    win: '\u80e1'
  };
  const japanese: Partial<Record<MahjongSound, string>> = {
    chi: 'チー', pon: 'ポン', kan: 'カン', win: 'ツモ'
  };
  const english: Partial<Record<MahjongSound, string>> = {
    shuffle: 'Shuffling tiles', draw: 'Draw', discard: 'Discard', chi: 'Chi', pon: 'Pung', kan: 'Kong', win: 'Mah Jongg'
  };
  const word = sound === 'discard' && tile
    ? (voiceLocale === 'japanese' ? japaneseTileLabel(tile) : voiceLocale === 'cantonese' ? cantoneseTileLabel(tile) : voiceLocale === 'mandarin' ? mandarinTileLabel(tile) : englishTileLabel(tile))
    : (voiceLocale === 'japanese' ? japanese[sound] : voiceLocale === 'cantonese' ? cantonese[sound] : english[sound]);
  if (!word) return;
  // The spoken call belongs to the latest visible event. Do not let an old
  // discard survive into a later draw, claim window, or even a new hand.
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = voiceLocale === 'japanese' ? 'ja-JP' : voiceLocale === 'cantonese' ? 'zh-HK' : voiceLocale === 'mandarin' ? 'zh-CN' : 'en-US';
  const voice = voiceLocale === 'japanese' ? preferredJapaneseVoice() : voiceLocale === 'cantonese' ? preferredCantoneseVoice() : voiceLocale === 'mandarin' ? preferredMandarinVoice() : preferredEnglishVoice();
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
    case 'build':
      // Four compact wall-building taps: a heavier, lower sound than a draw.
      [0, 0.075, 0.15, 0.225].forEach((offset, index) => tileClack(context, now + offset, 0.7 + index * 0.08));
      tone(context, 118, now + 0.04, 0.28, 0.04, 'triangle');
      break;
    case 'shuffle':
      Array.from({ length: 14 }, (_, index) => index).forEach((index) => {
        tileClack(context, now + index * 0.035, 0.34 + (index % 3) * 0.08);
      });
      tone(context, 135, now, 0.58, 0.035, 'sawtooth');
      break;
    case 'deal':
      // A brisk four-player deal. It is deliberately sound-only: browser
      // speech cannot remain in sync with a rapid sequence of concealed tiles.
      Array.from({ length: 12 }, (_, index) => index).forEach((index) => {
        tileClack(context, now + index * 0.055, 0.38 + (index % 4) * 0.04);
      });
      break;
    case 'draw':
      tileClack(context, now, 0.42);
      tone(context, 620, now + 0.018, 0.045, 0.04, 'triangle');
      tone(context, 760, now + 0.052, 0.055, 0.03, 'sine');
      break;
    case 'discard':
      tileClack(context, now, 1);
      tone(context, 255, now + 0.04, 0.075, 0.045, 'triangle');
      break;
    case 'flower':
      // Expose → replace: a tile on the table followed by a short, distinct
      // acknowledgement. No voice is used because flower chains can be fast.
      tileClack(context, now, 0.62);
      tone(context, 740, now + 0.07, 0.13, 0.07, 'sine');
      tone(context, 990, now + 0.15, 0.16, 0.065, 'sine');
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
