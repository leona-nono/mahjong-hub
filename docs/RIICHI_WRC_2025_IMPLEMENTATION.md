# Japanese Riichi Mahjong ? WRC 2025 implementation record

Approved by the user on 2026-08-10. Local acceptance is required before commit or publication.

## Baseline

- Four players; 136 tiles; no flowers and no red fives.
- 30,000 starting points and East/South match structure.
- Four sets plus a pair, Seven Pairs, and Thirteen Orphans.
- At least one yaku is required. Dora is not a yaku.
- Closed tenpai may declare Riichi with a 1,000-point stick.
- WRC 2025 head-bump: only the first Ron claimant in turn order wins.
- Fourteen-tile dead wall and replacement draws after Kan.

Primary reference: World Riichi Championship Rules 2025.
Product reference: Mahjongo Riichi, observed only for visible table interaction and information hierarchy.

## Implemented in this pass

- WRC starting scores and one-winner head-bump.
- Riichi declaration, legal discard candidates, highlighting, and stick deposit.
- Yaku gate for Tsumo/Ron and closed-hand Tsumo handling.
- Dedicated landscape table presentation reused from project-owned four-player table code.
- Approved How to Play and Strategy Tips copy.
- Deterministic engine regression tests.

## Deferred before tournament-complete status

