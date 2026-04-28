# AGENTS.md

## Project summary

- Project name: **Metadata Updater**
- Target host: **Zotero 9 only**
- Purpose: refresh metadata on **existing Zotero items** from DOI

## Current product scope

- Initial release supports **DOI only**
- Target items are **selected, editable, top-level regular items**
- Entry point is the library item context menu:
  - **Update Metadata**
- DOI lookup order:
  1. item's `DOI` field
  2. DOI extracted from `Extra`

## Metadata retrieval

- Reuse Zotero's built-in lookup pipeline via `Zotero.Translate.Search`
- Do **not** call external APIs directly from plugin code for the current flow
- Translator lookup is performed with:
  - `translate.setIdentifier({ DOI })`
  - `translate.getTranslators()`
  - `translate.translate({ saveAttachments: false })`

## Merge behavior

- Create a temporary looked-up item from DOI metadata
- Merge the temporary item's bibliographic metadata into the selected item
- Delete the temporary item afterwards
- Use JSON-based merge (`toJSON()` / `fromJSON()`) rather than field-by-field manual sync

## Data preservation rules

These must **not** be overwritten by DOI refresh:

- `Extra`
- tags
- collections
- related items / relations
- notes
- attachments
- `inPublications`

Transient item identity fields must also not be copied:

- `itemID`
- `key`
- `libraryID`
- `version`
- `dateAdded`
- `dateModified`

## UX behavior

- Show progress and result feedback in a Zotero progress window
- If no eligible item is selected, show an error message
- If DOI is missing, fail with a user-facing message
- If only some items fail, report partial success

## Important constraints

- **Do not add Zotero 7 compatibility** unless explicitly requested
- **Do not expand identifier support** beyond DOI unless explicitly requested
- Preserve user-authored local data even when bibliographic metadata is overwritten

## Important files

- `src/modules/menu.ts`: context menu registration
- `src/modules/metadataRefresh.ts`: DOI lookup + merge logic
- `src/hooks.ts`: startup/shutdown wiring
- `addon/manifest.json`: Zotero 9 compatibility bounds
- `README.md`: user-facing summary

## Development workflow

- Install deps: `npm install`
- Lint: `npm run lint:check`
- Build: `npm run build`
- Dev mode: `npm start`
- Runtime tests: `npm test`
- `.env` is only required for `npm start` / `npm test`, not for `npm run build`

Important build outputs:

- `.scaffold/build/metadata-updater-<version>.xpi`
- `.scaffold/build/update.json`
- `.scaffold/build/update-beta.json`
- `./metadata-updater-<version>.xpi`

## Release automation

- Pushing a tag like `v0.1.0` runs `.github/workflows/release.yml`
- The workflow builds on GitHub Actions and uploads:
  - `metadata-updater-<version>.xpi`
  - `update.json`
  - `update-beta.json`
    to the GitHub Release for that tag

## Local test caveat

- `npm test` requires a local Zotero binary/profile configured via `.env`
- In the current environment, runtime tests were blocked because no local Zotero binary was available

## Current codebase note

- `src/modules/examples.ts` and `src/modules/preferenceScript.ts` are leftover template files and are currently excluded from TypeScript compilation in `tsconfig.json`
