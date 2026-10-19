# Random Birth / 隨機投胎 — SEO & GEO plan

**Owner:** 金志垣 · **Date:** 2026-10-19 (HKT) · **Repo:** `dancingturtle14/rebirth-sim`  
**Working site:** https://dancingturtle14.github.io/rebirth-sim/  
**Custom domain:** not live yet (知珉 buys + wires later). Do **not** assume randombirth.com is live.

## Brand
| Layer | Current | Soft SEO name (now) | Research preferred (alt) |
|---|---|---|---|
| Product / title·meta | Rebirth Roulette / 輪迴局 | **Random Birth** / **隨機投胎** | **Born Into History** / 歷史投胎模擬器 → `bornintohistory.com` |
| On-screen H1 | Rebirth Roulette / 輪迴局 | **leave as-is** until 知珉 renames UI | — |
| Subtitle | pixel rebirth simulator | Soft “Random Birth · history life simulator” in `.sub` only | — |

Do **not** force a full UI rename beyond title/meta/subtitle. Full brand pick is 知珉’s call (`research/naming-domain.md`).

## Keyword research (light, 2026-10-19)
**EN intent (priority):** educational curiosity + “birth lottery / where would I be born / random birth simulator / history life simulator / born in 1800 simulator”.

| Source | Signal (paraphrased) |
|---|---|
| Web search | “birth lottery” used by charity explainers; “life simulator” crowded (BitLife-like apps, mortality toys). History-weighted rebirth is a thinner niche → own with “random birth” + “history” + era language. |
| naming-domain.md clash scan | BitLife, 1in8B, Life Restart, “If You Were Born”, Life Spinner — use those **phrases as keywords in copy**, never as brand. |
| Product fit | Era picker + population-weighted birth → matches “where would I be born” / “born in 1800” better than modern-only life sims. |

**ZH (zh-Hant pages; keep):** 投胎模擬器、人生模擬器、隨機投胎、如果我生喺古代（粵語口語 OK on ZH landing).

**TH:** **skip** for now — no clear high-volume Thai head-term in a quick check; revisit later if traffic appears.

## Title / meta proposals
### EN landing
- **Title (≤60):** `Random Birth — Where Would I Be Born? | Simulator` (52)
- **Meta (≤155):** `Random birth simulator: pick an era, then a birth lottery draws where, class and gender from historical population estimates. Educational, ages 15+.` (~145)

### ZH landing
- **Title:** `隨機投胎｜投胎模擬器 · 輪迴局`
- **Meta:** `隨機投胎模擬器：揀年代，然後用歷史人口估算抽出身世、階級同性別，過一世。教育向，建議 15 歲以上。`

### EN about
- **Title:** `Random Birth · Data Sources & Methods`
- **Meta:** `How Random Birth estimates historical population, mortality and events. Sources, calibration notes and limits. Educational simulator.`

### ZH about
- **Title:** `隨機投胎 · 資料來源與方法`
- **Meta:** `隨機投胎點樣估算歷史人口、死亡率同事件。資料來源、校準說明同限制。教育向模擬器。`

## Landing H2 / FAQ outline (GEO)
Visible block **before** the ages-15+ note. Educational tone; **no gambling claims**.

Suggested H2: `FAQ — Random birth & history life simulator` / `常見問題 — 隨機投胎同人生模擬`

1. What is Random Birth?  
2. How does the birth lottery decide where I am born?  
3. Is this like BitLife or Life Restart?  
4. Can I simulate being born in 1800 (or another era)?  
5. Are the numbers historically accurate?  
6. Is this a gambling or fortune game?  
7. Who is it for (age)?  
8. Where do the data sources live?

## Schema
- `WebApplication` (name Random Birth, url github.io for now, applicationCategory GameApplication / EducationalApplication, offers free, inLanguage en + zh-Hant).  
- `FAQPage` matching visible H3s.  
- `Organization` optional later (skip until domain + brand locked).

## llms.txt
Root `llms.txt`: product one-liner, languages, how it works, age note, link to about/sources, canonical github.io URLs, note that custom domain may change.

## Canonical strategy
| Phase | Canonical / hreflang |
|---|---|
| **A (now)** | Absolute `https://dancingturtle14.github.io/rebirth-sim/...` ; hreflang `en` ↔ `zh-Hant` (+ `x-default` → EN) |
| **B (domain live)** | Switch all canonical / OG / sitemap / llms.txt / share-card strings to `https://randombirth.com` **or** whatever 知珉 registers (research prefers bornintohistory.com). Keep github.io 301 via GitHub Pages custom domain. |
| **C** | GEO satellites (era landings, “born in 1800”, compare vs BitLife explainer) — later, after domain + brand lock. |

## Clash-avoid copy rules
OK in body as **keywords**: birth lottery, where would I be born, BitLife, Life Restart, If You Were Born, 人生重開模擬器.  
**Not** as product name / logo / H1 brand.

## Phased work
| Phase | What | Who |
|---|---|---|
| **A — now** | On-page: title/meta/canonical/hreflang/OG, FAQ+JSON-LD, robots, sitemap, llms.txt, soft subtitle | 金志垣 (this pass) |
| **B — after domain** | Swap canonicals, CNAME/DNS, share-card hardcodes, Search Console | 知珉 (+ 金志垣 URL pass) |
| **C — later** | Content/GEO satellites, optional Organization schema, richer OG art | 金志垣 / 員瑛 for art |

## Pending (not this pass)
- [ ] 知珉: buy domain (bornintohistory.com vs randombirth.com), DNS, Pages custom domain, HTTPS enforce  
- [ ] 知珉: push / Pages deploy if this agent cannot auth `git push`  
- [ ] Update share-card hardcodes that still say github.io once domain is live  
- [ ] H1 rename Rebirth Roulette / 輪迴局 → final brand  
- [ ] 員瑛: optional dedicated OG share image (screenshots OK for now)  
- [ ] GSC / Bing property on final domain  
- [ ] Phase C satellites  

## QA timing (李賢瑞)
Run a visual + mobile pulse **after** GitHub Pages reflects Phase A (typically minutes after push). Check: title in tab, FAQ block before age note, EN↔ZH lang switch, about meta, `/robots.txt` `/sitemap.xml` `/llms.txt` under `/rebirth-sim/`.
