# Leonida Ledger — GTA VI trophy guide & tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/levikasep12/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/levikasep12/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and progress tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5, built for
[make.fun's GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **All 55 trophies** with the official name, description and grade, plus a guide written for this app.
- **Roadmap to the platinum** in six stages: story chapters, stranger strands, collectibles, activities,
  crime, then the 100% checklist. Every stage lists its trophies and its progress.
- **Missable flags** worked out from the official descriptions and cross-checked guides: Positive Mental
  Attitude is the one potentially missable trophy, because of the Chapter 1 balcony meditation.
- **Filters** by kind (story, missable, collectibles, activities, crime), by grade, a text search, and
  show-earned / show-missing toggles.
- **Spoiler mode** masks the name and description of every story trophy until you tick it.
- **Saved progress** in localStorage, with export to JSON and import back.
- **Cited guides**: every trophy names its sources as links (PowerPyx, PlanetGTA6, Output Lag, GTA-Zone,
  egamers.io, CryptoGames and GTA VI Vice City Hub). The app never fetches them; they open only when you click.
- **Fully offline**: every file is under `app/`, there is no build step and no network request at run time.

## Run it

Open `app/index.html` in a desktop browser, or serve the folder:

```sh
node serve.ts
```

## Build the hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's
`buildDossier`. It uses Node 22's standard library only and is deterministic: two runs write the same bytes.

## Layout

| Path | Job |
| --- | --- |
| `app/index.html` | The page shell: masthead, filters, checklist and roadmap sections. |
| `app/app.js` | Loads `data/trophies.json`, wires the controls, re-renders on change. |
| `app/tracker.js` | Owns the earned set: localStorage, export and import. |
| `app/filters.js` | Owns kind/grade/search/toggle state and the spoiler rule. |
| `app/roadmap.js` | Renders the roadmap stages and the cited platinum tips. |
| `app/trophy-list.js` | Renders each trophy card and its expandable guide. |
| `app/data/trophies.json` | The 55 trophies: official text, guide, sources, kind, flags, stage. |
| `main.ts` | Copies the entry to the output directory and writes `dossier.json`. |

Trophy names and descriptions are PlayStation's. Every guide is original prose written for this app and
cites where its facts come from. No Rockstar logo or official artwork is used; the look is original.

## License

MIT — see `LICENSE`.
