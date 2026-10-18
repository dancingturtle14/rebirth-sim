# Portal readiness checklist: Rebirth Roulette (輪迴局) · DRAFT, nothing submitted

Checked 2026-10-18 (HKT) against the portals' public docs:
- CrazyGames: docs.crazygames.com, pages /requirements/intro, /technical, /gameplay, /ads, /sdk/intro
- Poki: developers.poki.com/guide, pages requirements-quality, content-player-safety, sdk-html5, sdk-overview

Build measured: v4.2 (EN + 繁中).
- Size: about 1.1 MB total. 400 KB of that is the Cubic 11 CJK font; the EN-only payload is about 0.6 MB.
- File count: 40 files. No external requests.

Legend: ✅ pass · ⚠️ partial / needs work · ❌ fail · — not applicable

## 1. CrazyGames

| Requirement (source) | Status | Notes / what's needed |
|---|---|---|
| Two-step launch: Basic Launch (SDK optional, no monetisation) → Full Launch (SDK required) (intro) | ⚠️ | We can submit for **Basic Launch without the SDK**. Full Launch needs the SDK branch below. |
| Initial download ≤ 50 MB; ≤ 20 MB for the mobile homepage; total ≤ 250 MB; ≤ 1,500 files (technical) | ✅ | About 1.1 MB, 40 files. |
| Relative paths only (technical) | ⚠️ | Game files are relative. The EN build in `en/` loads shared files via `../`. A portal zip needs a **flattened single-folder build** (`dist-portal/`, EN `index.html` at the root, zh as an option). Script not written yet. |
| Works in Chrome/Edge; Safari OK; Chromebook with 4 GB RAM (technical) | ⚠️ | Tested in headless Chrome only. Need manual tests on Safari iOS and a low-end Chromebook/Android. |
| Mouse, keyboard and touch supported (technical) | ✅ | Tap/click UI. No keyboard needed. |
| Playable in landscape on desktop; portrait games allowed with side bars (technical) | ⚠️ | The UI is a phone-first portrait column (max-width layout), so it shows with side bars in a 16:9 iframe. Need checks at 907×510, 821×462 and 800×450 (mobile landscape): the text-heavy screens scroll inside the iframe. Consider a landscape two-column layout for desktop. |
| `user-select:none` on body for mobile (technical) | ❌ | Add to the portal CSS. Keep the textarea in "reflect" selectable. |
| Safe-area padding in the CrazyGames app (technical) | ⚠️ | Add `env(safe-area-inset-*)` padding. |
| Mute audio when the tab is hidden or an ad plays (technical/ads) | ⚠️ | WebAudio SFX/music exist (js/sfx.js). Need a mute hook: suspend the AudioContext on `adStarted` and visibilitychange. |
| Readable at devicePixelRatio 1 at listed iframe sizes (gameplay) | ⚠️ | Pixelify Sans at 13–16 px reads fine at DPR 2. Re-check at DPR 1 / 800×450. Small 11–12 px footnotes may need +1 px. |
| **Must have English localisation**; translations high quality; pick language from SDK `systemInfo.locale`, fallback English (gameplay) | ✅ / ⚠️ | EN done (native rewrite, not machine translation). Today the language comes from `navigator.language`. The SDK build should read `SDK.user.systemInfo.locale` and fall back to EN. |
| Originality (gameplay) | ✅ | Original name, text, art and code. Inspired by the "random birth" genre; no copied assets. |
| No custom fullscreen button (gameplay) | ✅ | None. |
| No cross-promotion / no links to a playable web version (gameplay) | ❌ | Remove from the portal build: (1) the share card prints `dancingturtle14.github.io/rebirth-sim/?seed=…`; (2) the about page mentions the GitHub repo. Keep the data-source citations (plain text). |
| PEGI 12 suitable; audience 13+ (gameplay) | ⚠️ **highest risk** | See §3 Content. Likely OK as historical/educational **if** the portal build defaults to gentle mode and tones down a few events. Today the game says "15+". |
| Full Launch: land in gameplay immediately or within 1 click (gameplay) | ✅ | The start screen has one primary button, "▶ Be born" (default era preselected). |
| Ads only via the SDK; no external ads; must work with AdBlock (ads) | ✅ | No ads today. |
| Midgame ads only at natural breaks, never on navigation buttons; game paused + muted; handle `adError` (ads) | — / plan | Proposed: one `requestAd('midgame')` when the player taps "↻ Be reborn again" after the ending screen (a "level transition"). Never during a life or on Home/Settings. |
| Rewarded ads optional, never gating (ads) | — | Not planned for v1. Possible later: optional "What if… replay" bonus, but that is a core feature, so better left free. |
| SDK `gameplayStart`/`gameplayStop`; `loadingStart`/`loadingStop` (sdk) | ❌ (main) / plan | See §4 sandbox plan. |
| Progress saved (data module recommended for Full Launch) | ⚠️ | localStorage now (wrapped in try/catch as of v4.2). Full Launch: mirror to `SDK.data`. |
| Metadata: description, controls, covers/thumbnails (intro) | ❌ | Need EN description, a "how to play" blurb and cover art at the portal's sizes. |

## 2. Poki

| Requirement (source) | Status | Notes / what's needed |
|---|---|---|
| Curated: upload to Poki for Developers → content moderation → playtests (adding-your-game) | ⚠️ | Not invite-only, but highly curated. Text-heavy sims are a niche on Poki; acceptance is uncertain. |
| Desktop, mobile **and** tablet; full screen on mobile (requirements) | ⚠️ | Mobile portrait is good. Desktop shows a narrow column; Poki wants the game to fill the canvas. Needs a responsive 16:9 layout (two columns). |
| **16:9, scales to 640×360 / 836×470 / 1031×580** (requirements) | ❌ | The biggest technical gap. The portrait scroll UI doesn't fit a 640×360 canvas without heavy scrolling. Needs a landscape layout: scene + stats left, feed/choices right, ending as paged cards. |
| Incognito: wrap localStorage in try/catch, stay playable (requirements) | ✅ | All reads were already wrapped; writes wrapped in v4.2. |
| No external requests; bundle fonts/assets (requirements) | ✅ | Fonts are vendored (Cubic 11, Pixelify Sans). No CDNs. |
| No branding splash, no outgoing links, no other ad systems (requirements) | ❌ | Same as CrazyGames: remove the GitHub URL from the share card and the about-page repo mention in the portal build. The share-card PNG download is fine. |
| No ad-block prevention (requirements) | ✅ | None. |
| SDK: `gameLoadingFinished` → `gameplayStart` on first input; `gameplayStop` on any interruption; no double events; `commercialBreak` only when heading back into gameplay (requirements, sdk-overview) | ❌ / plan | Mapping: loading finished on DOMContentLoaded; `gameplayStart` on "Be born"; `gameplayStop` at death/ending, settings, codex; `commercialBreak()` → `gameplayStart` on "Be reborn again" and on "What if" / "Legacy" continue. |
| Mute + disable input during ads (sdk-html5) | ⚠️ | Same audio hook as CrazyGames. |
| Clean build: no debug/test code (requirements) | ⚠️ | Strip `?auto`, `?hold`, `?seed`, `?year`, `?reg` QA params from the portal build (or keep them inert). |
| Save system or tell players progress isn't saved (requirements) | ✅ | localStorage saves past lives, codex, achievements and lineage. |
| Small initial download; loads in under 10 s (requirements) | ✅ | About 0.6 MB for EN. |
| Localization recommended for text-heavy games (requirements) | ✅ | EN + 繁中. |
| **Content & player safety: audience includes kids; out of scope: abuse, stereotypes, graphic violence, sustained scary themes, gambling, alcohol, tobacco** (content-player-safety) | ❌ **likely reject as-is** | Our "vice" choices (opium, gin, dice/gambling, cigarettes), the slavery mechanic, genocide/famine history cards (e.g. cannibalism mention, massacres) and frequent child death are all outside Poki's "all ages" bar. A Poki edition would need: vice events removed, gentle mode forced, the slavery capture event turned into a non-playable history card, and atrocity cards removed. That strips the game's core historical honesty, so **Poki is not recommended** unless David accepts a "family edition". |

## 3. Content policy: slavery, war, death

- **CrazyGames (PEGI 12, 13+):**
  - PEGI 12 allows non-graphic violence toward humans and mild bad language.
  - Our content is text-only and non-graphic: pixel figures, no blood. It is framed as history, with sources.
  - Risk areas and mitigations:

| Risk area | Mitigation |
|---|---|
| Being captured and enslaved (playable outcome in West/Central Africa 1500–1850) | Keep, but make sure the text stays factual and respectful (it currently is), and add a one-line content note on the start screen: "Includes the history of war, slavery, famine and death." |
| Gambling, alcohol, tobacco and opium choices | PEGI 12 tolerates references to alcohol/tobacco. Gambling **simulation** pushes to PEGI 12+, though ours is a single text choice with no betting mechanic. Recommend dropping the dice/gambling variant in the portal build, keeping alcohol and tobacco as cautionary choices. |
| Massacre / genocide / cannibalism wording in history cards | Default the portal build to gentle mode, which already rewrites many terms. Extend it to cover "cannibalism", "massacre" and "genocide" card bodies. |
| Child mortality | Core to the data; non-graphic. Keep. |

- **Poki (all ages incl. kids):** see the last row of §2. Fails without heavy changes.
- Current in-game note says 15+. For CrazyGames, set the portal age rating to 13+ / PEGI 12 only after the mitigations above. Otherwise flag the game as mature in the submission. CrazyGames docs don't describe a mature flag for general games, so verify with their support.

## 4. Sandbox plan: CrazyGames SDK test (not on main)

1. **Branch:** create `sandbox/crazygames-sdk` from `main`.
   - The Pages workflow only deploys on `main` (`on.push.branches: [main]`), so the branch never goes live on GitHub Pages.
   - Never merge the SDK into `main`. Port shared fixes main → sandbox by rebase/merge only in that direction.
2. **Portal build script** `tools/portal/build.py`, outputting `dist-crazygames/` (git-ignored on main):
   - Flatten `en/` + shared assets into one folder with `index.html` at the root. zh is an option via `?lang=zh` or SDK locale.
   - Inject `<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>` in `<head>`. This is CrazyGames' own CDN; it's allowed there.
   - Portal CSS: `user-select:none` on body (but not textarea), safe-area padding, gentle mode default ON.
   - Remove the share-card URL line and the GitHub mention. Make QA URL params inert.
3. **Adapter** `js/portal-cg.js`, about 60 lines: a no-op wrapper so the game never calls the SDK directly.
   - `await CrazyGames.SDK.init()` wrapped in try. If `SDK.environment==='disabled'`, every method is a no-op.
   - Language: `SDK.user.systemInfo.locale` → zh if it starts with `zh`, else en.
   - `loadingStart()` at boot; `loadingStop()` + `gameplayStart()` when "Be born" is tapped (first playable state).
   - `gameplayStop()` on death/ending screen, codex, settings and about. `gameplayStart()` when a new life begins.
   - Midgame ad when the player taps "↻ Be reborn again":
     - Block the UI (spinner) and call `requestAd('midgame', {adStarted: mute, adFinished/adError: unmute + continue})`.
     - Mute only on `adStarted`. Always continue on `adError`.
   - Optional: mirror the localStorage keys to `SDK.data`.
4. **Local test:**
   - Serve `dist-crazygames/` on `http://localhost:8833` (SDK local mode shows an ad overlay and console logs; append `?useLocalSdk=true` on other hosts).
   - Run the existing QA (`/workspace/rebirth-qa/qa.js`, pointed at the dist) for 0 JS errors with the SDK both present and blocked (adblock simulation: block sdk.crazygames.com, game must still play).
   - Verify there are no double `gameplayStart` calls, via the console log.
5. **Portal preview:** zip `dist-crazygames/`, create the game in the CrazyGames Developer Portal and test in its **Preview/QA tool**. This needs David's account and approval. **Not done; nothing uploaded or submitted.**
6. **Go/no-go:** submit for **Basic Launch** first. It doesn't need the SDK, but could use the same flattened build without the SDK script. Keep the SDK branch ready for Full Launch.

## 5. Summary: what we pass / fail

**Pass:**
- File size and count.
- No external requests or ads.
- English localisation.
- One-click start.
- Original content.
- Incognito-safe storage.
- Touch and mouse support.

**Fail / must do before any submission:**
1. Flattened single-folder portal build.
2. Remove the GitHub/website URL from the share card and the about page in the portal build.
3. `user-select:none` + safe-area CSS.
4. Audio mute hook.
5. Landscape/16:9 check at the CrazyGames iframe sizes. A real responsive landscape layout is needed for Poki.
6. Content mitigations: content note, gentle default, drop gambling variant.
7. Cover art and metadata.
8. SDK integration for CrazyGames Full Launch (sandbox branch).

**Recommendation:**
- CrazyGames Basic Launch is realistic after items 1–4, 6 and 7.
- Poki is unlikely to accept the game because of its all-ages content bar and its 16:9 canvas requirement.
