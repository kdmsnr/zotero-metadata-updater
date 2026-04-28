# Metadata Updater

Metadata Updater is a **Zotero 9-only** plugin that updates metadata on selected existing items from their DOI.

## Installation

1. Open the repository's **GitHub Releases**
2. Download the `.xpi` asset from the desired release
3. In Zotero, open **Tools -> Plugins**
4. Drag the `.xpi` into the Plugins window, or use **Install Add-On From File...**

## Current scope

- Targets **existing top-level items**
- Reads DOI from the item's `DOI` field first, then falls back to `Extra`
- Reuses Zotero's built-in DOI lookup/translator pipeline
- Overwrites bibliographic metadata on the selected item
- Preserves `Extra`, tags, collections, related items, notes, and attachments

## Usage

1. Select one or more items in the Zotero library view
2. Open the item context menu
3. Click **Update Metadata**

The plugin creates a temporary lookup item through Zotero's translation APIs, merges the resulting bibliographic metadata into the selected item, and deletes the temporary item afterwards.

## Preserved data

The DOI update does **not** overwrite:

- `Extra`
- tags
- collections
- related items
- notes
- attachments

## Development

1. Install dependencies with `npm install`
2. Use `npm run build` to generate release files in `.scaffold/build/`

Important build outputs:

- `.scaffold/build/metadata-updater-<version>.xpi`
- `.scaffold/build/update.json`
- `.scaffold/build/update-beta.json`
- `./metadata-updater-<version>.xpi`

## GitHub Release automation

Pushing a tag such as `v0.1.0` triggers `.github/workflows/release.yml`, which:

1. installs dependencies on GitHub Actions
2. runs `npm run build`
3. uploads `metadata-updater-<version>.xpi` to the GitHub Release for that tag
4. creates or updates a separate `release` GitHub Release that hosts `update.json` and `update-beta.json`

## Releasing

1. Bump the version in `package.json` and `package-lock.json` (for example, `npm version 0.1.2 --no-git-tag-version`)
2. Run `npm run lint:check`
3. Run `npm run build`
4. Commit the release changes
5. Create a tag named `v<version>` and push the commit and tag

When the tag is pushed, GitHub Actions publishes the versioned `.xpi` to the matching tag release and refreshes the `release` channel's `update.json` and `update-beta.json`, which Zotero uses for **Check for Updates**.

## Notes

- This repository started from `windingwind/zotero-plugin-template`
- The first release intentionally supports **DOI only**
- Zotero 7 compatibility is out of scope
