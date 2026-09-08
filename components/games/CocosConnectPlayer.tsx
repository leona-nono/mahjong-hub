'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  markRewardedShown,
  playRewardedAd,
  rewardedCooldownRemaining
} from '@/lib/ads/rewarded';
import {
  COCOS_CONNECT_SRC,
  type CocosHubCompletePayload,
  type CocosHubConfig,
  type CocosHubErrorPayload,
  type CocosHubOutboundEvent,
  type CocosHubReadyPayload,
  type CocosMahjongHubApi,
  type CocosRequestRewardPayload,
  type CocosRewardResultPayload
} from '@/lib/cocos/hub-protocol';
import { trackMahjongEvent } from '@/lib/mahjong/telemetry';
import type { ConnectDifficulty } from './MahjongConnect';

type HubWindow = Window & { MahjongHub?: CocosMahjongHubApi };

export interface CocosConnectPlayerProps {
  slug: string;
  locale?: string;
  difficulty?: ConnectDifficulty;
  onWin?: (points: number) => void;
}

/**
 * Same-origin iframe player for the Cocos web-mobile Connect build.
 * Wires MahjongHub emit/configure/grantReward for ready/complete + rewarded props.
 */
export default function CocosConnectPlayer({
  slug,
  locale = 'en',
  difficulty = 'classic',
  onWin
}: CocosConnectPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'complete' | 'error' | 'reward'>('loading');
  const [lastEvent, setLastEvent] = useState<string>('waiting for iframe…');
  const wiredRef = useRef(false);
  const rewardingRef = useRef(false);

  const grantToGame = useCallback((result: CocosRewardResultPayload) => {
    const win = iframeRef.current?.contentWindow as HubWindow | null;
    if (!win?.MahjongHub) return;
    if (typeof win.MahjongHub.grantReward === 'function') {
      win.MahjongHub.grantReward(result);
    }
  }, []);

  const handleRequestReward = useCallback(
    async (payload: CocosRequestRewardPayload) => {
      if (rewardingRef.current) {
        grantToGame({
          ok: false,
          placement: payload.placement,
          reason: 'busy'
        });
        return;
      }
      const cool = rewardedCooldownRemaining();
      if (cool > 0) {
        grantToGame({
          ok: false,
          placement: payload.placement,
          reason: `cooldown_${Math.ceil(cool / 1000)}s`
        });
        return;
      }

      rewardingRef.current = true;
      setPhase('reward');
      setLastEvent(`request_reward ${payload.placement}`);

      try {
        const ad = await playRewardedAd(payload.placement);
        if (!ad.ok) {
          grantToGame({
            ok: false,
            placement: payload.placement,
            reason: ad.reason
          });
          setLastEvent(`reward denied ${ad.reason}`);
          return;
        }

        // Real networks: POST /api/reward/verify with ad.token before grant.
        // Mock path grants directly so Connect props work without login/SDK.
        markRewardedShown();
        grantToGame({
          ok: true,
          placement: payload.placement,
          grant: payload.placement,
          reason: ad.provider === 'mock' ? 'mock' : 'verified'
        });
        setLastEvent(`reward_ok ${payload.placement} (${ad.provider})`);
      } finally {
        rewardingRef.current = false;
        setPhase('ready');
      }
    },
    [grantToGame, slug]
  );

  const handleEmit = useCallback(
    (event: CocosHubOutboundEvent, payload: unknown) => {
      const line = `[MahjongHub] ${event}`;
      console.log(line, payload);
      setLastEvent(`${event} ${JSON.stringify(payload)}`);

      if (event === 'ready') {
        setPhase('ready');
        const p = payload as CocosHubReadyPayload;
        trackMahjongEvent('mahjong_game_started', {
          game: slug,
          engine: 'cocos',
          gameId: p?.gameId ?? 'connect'
        });
        return;
      }

      if (event === 'complete') {
        setPhase('complete');
        const p = payload as CocosHubCompletePayload;
        const points = Math.min(Math.max(Math.round((p?.score ?? 0) / 10) || 1, 1), 50);
        onWin?.(points);
        return;
      }

      if (event === 'request_reward') {
        void handleRequestReward(payload as CocosRequestRewardPayload);
        return;
      }

      if (event === 'error') {
        setPhase('error');
        const p = payload as CocosHubErrorPayload;
        setLastEvent(`error ${p?.code}: ${p?.message}`);
      }
    },
    [handleRequestReward, onWin, slug]
  );

  const wireFrame = useCallback(() => {
    const win = iframeRef.current?.contentWindow as HubWindow | null;
    if (!win) return;

    win.MahjongHub = win.MahjongHub || {};
    win.MahjongHub.emit = handleEmit;

    const config: CocosHubConfig = {
      gameId: 'connect',
      slug,
      locale,
      quality: 'medium',
      autoStart: true,
      difficulty
    };

    let tries = 0;
    const pushConfig = () => {
      tries += 1;
      if (typeof win.MahjongHub?.configure === 'function') {
        win.MahjongHub.configure(config);
        win.MahjongHub.lastConfig = config;
        wiredRef.current = true;
        setLastEvent(`configure sent (try ${tries})`);
        return;
      }
      if (tries < 80) {
        window.setTimeout(pushConfig, 150);
      } else {
        setPhase('error');
        setLastEvent('HubBridge.configure not found — set start scene to Connect and rebuild');
      }
    };
    pushConfig();
  }, [difficulty, handleEmit, locale, slug]);

  useEffect(() => {
    wiredRef.current = false;
    setPhase('loading');
    setLastEvent('waiting for iframe…');
  }, [slug, difficulty, locale]);

  return (
    <div className="overflow-hidden rounded-2xl border border-portal-border bg-black">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
        <span>
          Cocos pathway · <strong className="text-emerald-400">{phase}</strong>
        </span>
        <span className="truncate font-mono text-[11px] text-zinc-500" title={lastEvent}>
          {lastEvent}
        </span>
      </div>
      <iframe
        ref={iframeRef}
        title="Mahjong Connect (Cocos)"
        src={COCOS_CONNECT_SRC}
        className="block h-[min(78vh,720px)] w-full bg-black"
        allow="autoplay; fullscreen; gamepad"
        onLoad={wireFrame}
      />
    </div>
  );
}
