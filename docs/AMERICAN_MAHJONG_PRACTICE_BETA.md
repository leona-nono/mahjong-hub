# American Mahjong practice beta

## Product contract

- **Card**: Mahjong Hub original, versioned practice cards. They are not NMJL annual cards and do not reproduce an NMJL card.
- **Tile set**: 152 tiles — 136 standard tiles, 8 Flowers and 8 Jokers.
- **Deal and opening**: all players receive 13 tiles; East receives the first extra tile after Charleston and discards first.
- **Charleston**: three mandatory simultaneous passes of exactly three tiles: right, across, then left. The engine also supports an optional second Charleston and Courtesy Pass configuration.
- **Jokers**: displayed as distinct American Joker tiles. The original practice-card instructions state the rule boundary: only in groups of three or more, never in a pair/single.

## Current scope

This is a **public-beta rules foundation**, not an official rules-complete NMJL implementation. It uses one physical 152-tile wall, four concealed hands, simultaneous Charleston exchanges and deterministic bot decisions. The table now presents a guided opening rail: mandatory first Charleston, opt-in second Charleston, configurable Courtesy Pass, then East's draw/discard turn. Each guided stage explains its direction and selection count.

## Original-card registry

\`lib/mahjong/american.ts\` owns the versioned card registry: Garden Ladder, Bamboo Bridge, Four Winds and Pair Parade. Every line has an exact 14-tile matcher, difficulty and points. A Joker can complete only a defined group of three or more; it cannot fill flowers, a pair or a single. Never alter a released card id: create a new card id/version so historical games can be replayed and audited.

Any future NMJL adapter must remain licensed and separate from this registry; it cannot add annual-card material without the corresponding rights.

The beta includes card selection, exact original-card declaration, exposed pung/kong claims with Mah Jongg > kong > pung priority, a confirmable Joker exchange panel, deterministic settlement, winner reveal and replay log. A Joker exchange only enables when the player holds the exposed group's matching natural tile; the panel explains that condition before it changes state.

Still outside this beta: official NMJL annual-card support, NMJL-specific scoring/payment exceptions, sophisticated opponent strategy, and a full multi-round match ledger. Those require a licensed annual card and a separately approved rules contract.

## Verification plan

1. Start a new game and select exactly three tiles.
2. Complete three first-Charleston passes, choose the optional second round, and verify the directional guide changes correctly.
3. Exercise Courtesy Pass with zero and three tiles; East must receive the first draw only after opening is complete.
4. Claim an exposed Joker only when holding the matching natural tile; an unavailable exchange must remain disabled.
5. Discard repeatedly; hand must remain at 14 after each replacement draw. Confirm declaration reveals every hand and replay log.
6. Verify Joker and Flower presentation on desktop plus narrow mobile viewport.
