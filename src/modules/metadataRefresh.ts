import { config } from "../../package.json";
import { getString } from "../utils/locale";

type ItemJSON = Record<string, unknown>;

export type RefreshableItem = Zotero.Item & {
  isRegularItem(): true;
};

type RefreshFailure = {
  item: RefreshableItem;
  message: string;
};

const PRESERVED_JSON_KEYS = [
  "attachments",
  "collections",
  "deleted",
  "extra",
  "inPublications",
  "notes",
  "relations",
  "tags",
];

const TRANSIENT_JSON_KEYS = [
  "dateAdded",
  "dateModified",
  "itemID",
  "key",
  "libraryID",
  "version",
];

function getItemTitle(item: Zotero.Item) {
  return (
    item.getField("title") ||
    item.getDisplayTitle() ||
    getString("untitled-item")
  );
}

function getPopupWindow() {
  return new ztoolkit.ProgressWindow(config.addonName, {
    closeOnClick: true,
    closeTime: -1,
  });
}

function showStatusMessage(
  text: string,
  type = "default",
  details: string[] = [],
) {
  const popup = getPopupWindow()
    .createLine({
      text,
      type,
      progress: 100,
    })
    .show();

  details.forEach((detail, index) => {
    popup.createLine({
      text: detail,
      type: "default",
      idx: index + 1,
    });
  });

  popup.startCloseTimer(8000);
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

function getDOIFromItem(item: Zotero.Item) {
  const doiField = Zotero.Utilities.cleanDOI(item.getField("DOI"));
  if (doiField) {
    return doiField;
  }

  const identifiers = Zotero.Utilities.extractIdentifiers(
    item.getField("extra"),
  );
  const doiIdentifier = identifiers.find(
    (identifier): identifier is { DOI: string } => "DOI" in identifier,
  );

  return doiIdentifier?.DOI || null;
}

async function lookupTemporaryItemForDOI(item: RefreshableItem, doi: string) {
  const translate = new Zotero.Translate.Search();
  translate.setIdentifier({ DOI: doi });

  const translators = await translate.getTranslators();
  if (!translators.length) {
    throw new Error(getString("refresh-no-translator", { args: { doi } }));
  }

  translate.setTranslator(translators);

  const translatedItems = await translate.translate({
    libraryID: item.libraryID,
    collections: false,
    saveAttachments: false,
  });

  if (!translatedItems.length) {
    throw new Error(getString("refresh-lookup-failed", { args: { doi } }));
  }

  return translatedItems[0] as Zotero.Item;
}

function buildMergedItemJSON(
  targetItem: RefreshableItem,
  sourceItem: Zotero.Item,
) {
  const targetJSON = targetItem.toJSON() as ItemJSON;
  const sourceJSON = sourceItem.toJSON() as ItemJSON;
  const mergedJSON: ItemJSON = { ...sourceJSON };

  TRANSIENT_JSON_KEYS.forEach((key) => {
    delete mergedJSON[key];
  });

  PRESERVED_JSON_KEYS.forEach((key) => {
    if (key in targetJSON) {
      mergedJSON[key] = targetJSON[key];
    }
  });

  return mergedJSON;
}

async function refreshSingleItem(item: RefreshableItem) {
  const doi = getDOIFromItem(item);
  if (!doi) {
    throw new Error(getString("refresh-no-doi"));
  }

  let temporaryItem: Zotero.Item | undefined;
  try {
    temporaryItem = await lookupTemporaryItemForDOI(item, doi);
    item.fromJSON(buildMergedItemJSON(item, temporaryItem), { strict: false });
    await item.saveTx();
  } finally {
    if (temporaryItem) {
      await temporaryItem.eraseTx();
    }
  }
}

export async function refreshItemsFromDOI(items: RefreshableItem[]) {
  if (!items.length) {
    showStatusMessage(getString("refresh-no-selection"), "error");
    return;
  }

  const progressWindow = getPopupWindow()
    .createLine({
      text: getString("refresh-start", { args: { count: items.length } }),
      progress: 0,
    })
    .show();

  let successCount = 0;
  const failures: RefreshFailure[] = [];

  for (const [index, item] of items.entries()) {
    progressWindow.changeLine({
      text: getString("refresh-progress", {
        args: {
          current: index + 1,
          total: items.length,
          title: getItemTitle(item),
        },
      }),
      progress: Math.round((index / items.length) * 100),
    });

    try {
      await refreshSingleItem(item);
      successCount += 1;
    } catch (error) {
      const normalized = normalizeError(error);
      failures.push({
        item,
        message: normalized.message,
      });
      Zotero.logError(normalized);
    }
  }

  if (!failures.length) {
    progressWindow.changeLine({
      text: getString("refresh-success", { args: { count: successCount } }),
      type: "success",
      progress: 100,
    });
    progressWindow.startCloseTimer(5000);
    return;
  }

  const detailLines = failures.slice(0, 3).map((failure) => {
    return getString("refresh-failure-detail", {
      args: {
        title: getItemTitle(failure.item),
        message: failure.message,
      },
    });
  });

  progressWindow.changeLine({
    text:
      successCount > 0
        ? getString("refresh-partial", {
            args: {
              successCount,
              failureCount: failures.length,
            },
          })
        : getString("refresh-failure", {
            args: { failureCount: failures.length },
          }),
    type: successCount > 0 ? "default" : "error",
    progress: 100,
  });

  detailLines.forEach((detail, index) => {
    progressWindow.createLine({
      text: detail,
      type: "default",
      idx: index + 1,
    });
  });

  progressWindow.startCloseTimer(10000);
}

export function showOperationError(error: unknown) {
  const normalized = normalizeError(error);
  Zotero.logError(normalized);
  showStatusMessage(getString("refresh-unknown-error"), "error", [
    normalized.message,
  ]);
}
