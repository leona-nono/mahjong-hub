/**
 * Shared startup / event contract with MahjongCoreGame (Cocos HubBridge).
 * Keep in sync with assets/scripts/bridge/HubProtocol.ts in the Cocos project.
 */

export type CocosGameId = 'connect' | 'table4p' | 'solitaire';

export type CocosQuality = 'low' | 'medium' | 'high';

export type CocosRewardPlacement = 'hint' | 'shuffle' | 'extra_time';

export interface CocosHubConfig {
  gameId: CocosGameId;
  slug: string;
  locale: string;
  quality: CocosQuality;
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
  gameId: CocosGameId;
  slug: string;
  build: string;
}

export interface CocosHubErrorPayload {
  code: string;
  message: string;
}

export interface CocosHubCompletePayload {
  slug: string;
  gameId: CocosGameId;
  score: number;
  durationMs: number;
  difficulty?: string;
  seed?: number;
}

export interface CocosRequestRewardPayload {
  placement: CocosRewardPlacement;
  slug: string;
  gameId: CocosGameId;
  roundId: string;
}

export interface CocosRewardResultPayload {
  ok: boolean;
  placement: CocosRewardPlacement;
  grant?: CocosRewardPlacement;
  reason?: string;
}

export interface CocosMahjongHubApi {
  configure?: (json: string | CocosHubConfig) => void;
  grantReward?: (json: string | CocosRewardResultPayload) => void;
  emit?: (event: CocosHubOutboundEvent, payload: unknown) => void;
  lastConfig?: CocosHubConfig;
}

export const COCOS_CONNECT_SRC =
  process.env.NEXT_PUBLIC_COCOS_CONNECT_SRC || '/cocos/connect/index.html';

export function isCocosConnectEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COCOS_CONNECT === '1' || process.env.NEXT_PUBLIC_COCOS_CONNECT === 'true';
}
