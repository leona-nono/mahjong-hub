/**
 * Shared startup / event contract between Mahjong Hub (Next.js) and Cocos web-mobile.
 * Keep in sync with the Cocos HubBridge when the protocol changes.
 */

export type CocosGameId = 'connect' | 'table4p' | 'solitaire';

export type CocosQualityLevel = 'low' | 'medium' | 'high';

export interface CocosHubConfig {
  gameId: CocosGameId;
  slug: string;
  locale: string;
  quality: CocosQualityLevel;
  autoStart: boolean;
  difficulty?: 'relaxed' | 'classic' | 'expert';
  ruleset?: string;
  regionalRuleset?: string;
  levelId?: string;
  compact?: boolean;
  seed?: number;
}

export type CocosHubOutboundEvent =
  | 'ready'
  | 'error'
  | 'complete'
  | 'hand_completed'
  | 'fullscreen'
  | 'request_reward';

export interface CocosHubReadyPayload {
  gameId?: CocosGameId;
  slug?: string;
  build?: string;
}

export interface CocosHubCompletePayload {
  score?: number;
  durationMs?: number;
  difficulty?: string;
}

export interface CocosHubErrorPayload {
  code?: string;
  message?: string;
}

export interface CocosRequestRewardPayload {
  placement: string;
}

export interface CocosRewardResultPayload {
  ok: boolean;
  placement: string;
  grant?: string;
  reason?: string;
}

export interface CocosMahjongHubApi {
  emit?: (event: CocosHubOutboundEvent, payload: unknown) => void;
  configure?: (config: CocosHubConfig) => void;
  grantReward?: (result: CocosRewardResultPayload) => void;
  lastConfig?: CocosHubConfig;
}

/** Same-origin path for the Cocos Connect web-mobile build under public/. */
export const COCOS_CONNECT_SRC = '/cocos/connect/index.html';

/** Feature flag: set NEXT_PUBLIC_COCOS_CONNECT=true to use Cocos iframe path. */
export function isCocosConnectEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COCOS_CONNECT === 'true';
}
