# Metadata Updater

Metadata Updater is a **Zotero 9-only** plugin that updates metadata on selected existing items from their DOI.

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

## Development

1. Copy `.env.example` to `.env`
2. Point it at a local Zotero 9 binary and development profile
3. Install dependencies with `npm install`
4. Use `npm start` for live development or `npm run build` to create an XPI

## Notes

- This repository started from `windingwind/zotero-plugin-template`
- The first release intentionally supports **DOI only**
- Zotero 7 compatibility is out of scope
