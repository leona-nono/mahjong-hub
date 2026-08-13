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
- Strict WRC decision (2026-08-12): no abortive draws; the fourth Kan continues but a fifth is illegal; exhaustive draws apply tenpai renchan and a 3,000-point noten payment; the hanchan ends after South 4 on dealer change, with +15/+5/-5/-15 Uma split on ties.

Primary reference: World Riichi Championship Rules 2025.
Product reference: Mahjongo Riichi, observed only for visible table interaction and information hierarchy.

## Implemented in this pass

- WRC starting scores and one-winner head-bump.
- Riichi declaration, legal discard candidates, highlighting, and stick deposit.
- Yaku gate for Tsumo/Ron and closed-hand Tsumo handling.
- Dedicated landscape table presentation reused from project-owned four-player table code.
- Approved How to Play and Strategy Tips copy.
- Deterministic engine regression tests.
- Strict WRC no-abortive-draw flow: fourth Kan continues, fifth Kan is blocked, and exhaustive draw applies tenpai renchan plus the 3,000-point noten payment.
- South 4 match completion, retained Riichi deposits, tie-split +15/+5/-5/-15 Uma and per-player hanchan result display.
- Full WRC ordinary-yaku catalogue with closed/open values, special Renhou handling, complete yakuman catalogue, genuine yakuman stacking and counted-yakuman separation.
- Fu evaluation for seven pairs, closed Ron, Tsumo, pair value, open/closed triplets and quads, edge/closed/pair waits, open-pinfu minimum and double-wind pair handling.
- Multi-decomposition selection for Riichi scoring, using the best ordinary Han then fu outcome rather than the first decomposition found.

## Deferred before tournament-complete status

- Responsibility payment (pao) attribution and payment splitting for Big Three Dragons, Big Four Winds and Four Kans.
- Browser acceptance of the end-of-hanchan result screen on desktop, mobile portrait and mobile landscape.
- Hong Kong fan catalogue, Kong settlement and responsibility rules remain intentionally separate from the WRC scorer and require their own approved product brief.

