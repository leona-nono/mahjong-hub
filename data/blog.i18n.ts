/**
 * 5-language overrides for the SEO blog.
 *
 * English base lives in data/blog.ts; getLocalizedBlogPost() merges these and
 * falls back to English for any missing key, so partial translations are safe.
 * Body sections + FAQ can be added progressively under `sections`/`faq`.
 */
import type { BlogSection, BlogFaq } from './blog';

export type LocaleCode = 'en' | 'zh' | 'zh-TW' | 'ja' | 'ko';

export interface BlogI18n {
  title?: Partial<Record<LocaleCode, string>>;
  description?: Partial<Record<LocaleCode, string>>;
  sections?: Partial<Record<LocaleCode, BlogSection[]>>;
  faq?: Partial<Record<LocaleCode, BlogFaq[]>>;
}

export const BLOG_I18N: Record<string, BlogI18n> = {
  'what-is-mahjong': {
    title: {
      zh: '什么是麻将？完整新手指南',
      'zh-TW': '什麼是麻將？完整新手指南',
      ja: '麻雀とは？初心者のための完全ガイド',
      ko: '마작이란 무엇인가? 초보자 완전 가이드'
    },
    description: {
      zh: '麻将是一款四人牌类游戏，讲究技巧、策略与运气。了解麻将是什么、牌如何组成、世界各地的主要玩法，以及它和网上常见的配对消除游戏有何不同。',
      'zh-TW': '麻將是一款四人牌類遊戲，講究技巧、策略與運氣。了解麻將是什麼、牌如何組成、世界各地的主要玩法，以及它和網上常見的配對消除遊戲有何不同。',
      ja: '麻雀は四人で遊ぶ牌を使ったゲームで、技術・戦略・運が絡みます。麻雀とは何か、牌の構成、世界各地の主要ルール、そしてオンラインでよく見かける牌合わせゲームとの違いを解説します。',
      ko: '마작은 네 명이 즐기는 타일 게임으로 기술, 전략, 운이 함께 작용합니다. 마작이 무엇인지, 타일 구성, 세계 주요 룰, 그리고 온라인에서 흔히 보는 타일 맞추기 게임과의 차이를 알아보세요.'
    }
  },
  'how-to-play-mahjong': {
    title: {
      zh: '如何打麻将：新手分步指南',
      'zh-TW': '如何打麻將：新手分步指南',
      ja: '麻雀の遊び方：初心者向けステップガイド',
      ko: '마작 하는 법: 초보자 단계별 가이드'
    },
    description: {
      zh: '从零开始学打麻将：牌、砌墙、摸牌打牌、碰吃杠、以及胡牌——用简单易懂的方式讲解。',
      'zh-TW': '從零開始學打麻將：牌、砌牆、摸牌打牌、碰吃槓、以及胡牌——用簡單易懂的方式講解。',
      ja: '麻雀をゼロから学ぶ：牌、壁の構築、引く・切る、ポン・チー・カン、そして和了までを分かりやすく解説。',
      ko: '마작을 처음부터 배워요: 타일, 벽 쌓기, 뽑고 버리기, 퐁·치·캉, 그리고 화료까지 쉽게 설명합니다.'
    }
  },
  'how-to-win-mahjong': {
    title: {
      zh: '如何赢麻将：新手策略',
      'zh-TW': '如何贏麻將：新手策略',
      ja: '麻雀で勝つ方法：初心者向け戦略',
      ko: '마작에서 이기는 법: 초보자 전략'
    },
    description: {
      zh: '实用的麻将新手策略：尽早确定方向、先打孤张字牌、读牌河、不要过度叫牌、更快听牌。',
      'zh-TW': '實用的麻將新手策略：盡早確定方向、先打孤張字牌、讀牌河、不要過度叫牌、更快聽牌。',
      ja: '実践的な麻雀初心者戦略：早めに方向を決め、孤立した字牌を切り、捨て牌を読み、鳴きすぎず、より早く聴牌する。',
      ko: '실용적인 마작 초보자 전략: 일찍 방향을 정하고, 외로운 자패를 버리고, 버림패를 읽고, 선언을 줄이고, 더 빨리 텐파이에 도달하세요.'
    }
  }
};
