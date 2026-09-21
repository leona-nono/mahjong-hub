/**
 * Ad placement reserved for a future network (AdMob / mediation).
 * Until live ads ship, render nothing — empty dashed boxes with bilingual
 * placeholder copy hurt game pages and leak onto English SSR HTML.
 */
export default function AdSlot() {
  return null;
}
