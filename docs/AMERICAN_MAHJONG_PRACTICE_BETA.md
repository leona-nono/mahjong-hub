# American Mahjong practice beta

## Product contract

- **Card**: Mahjong Hub original practice card. It is not an NMJL annual card and does not reproduce an NMJL card.
- **Tile set**: 152 tiles — 136 standard tiles, 8 Flowers and 8 Jokers.
- **Deal and opening**: all players receive 13 tiles; East receives the first extra tile after Charleston and discards first.
- **Charleston in this beta**: three mandatory passes of exactly three tiles: right, across, then left. The UI shows each pass and blocks progress until exactly three tiles are selected.
- **Jokers**: displayed as distinct American Joker tiles. The original practice-card instructions state the rule boundary: only in groups of three or more, never in a pair/single.

## Current scope

This is a **public-beta flow prototype**, not an official rules-complete NMJL implementation. It has a playable Charleston and draw/discard loop, a visible original practice-card target, responsive desktop/mobile table presentation, and no licensed annual card.

Not yet implemented: card-line solver, exposed-call priority, Joker exchange, second Charleston/courtesy pass configuration, bot card selection, exact Mah Jongg declaration and settlement. Those remain clearly disclosed in the on-page guide.

## Verification plan

1. Start a new game and select exactly three tiles.
2. Complete three Charleston passes and verify the 14-tile East hand.
3. Discard repeatedly; hand must remain at 14 after each replacement draw.
4. Verify Joker and Flower presentation on desktop plus narrow mobile viewport.
5. Before release, add deterministic fixtures for each pass, Joker restriction, card-line matching and every call/settlement action.
