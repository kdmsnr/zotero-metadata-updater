import { config } from "../../package.json";
import {
  refreshItemsFromDOI,
  showOperationError,
  type RefreshableItem,
} from "./metadataRefresh";
import { getString } from "../utils/locale";

const MENU_IDS = {
  libraryItem: `zotero-itemmenu-${config.addonRef}-refresh`,
};

let registeredMenuID: string | false = false;

function getRefreshableItems(items?: Zotero.Item[]): RefreshableItem[] {
  return (items ?? []).filter((item): item is RefreshableItem => {
    return item.isRegularItem() && item.isEditable("edit");
  });
}

function triggerRefresh() {
  const items = ztoolkit.getGlobal("ZoteroPane").getSelectedItems();
  void refreshItemsFromDOI(getRefreshableItems(items)).catch((error) => {
    showOperationError(error);
  });
}

export function registerLibraryMenus() {
  if (registeredMenuID) {
    return;
  }

  registeredMenuID = Zotero.MenuManager.registerMenu({
    menuID: MENU_IDS.libraryItem,
    pluginID: config.addonID,
    target: "main/library/item",
    menus: [
      {
        menuType: "menuitem",
        l10nID: getString("menu-refresh-metadata"),
        onCommand: () => {
          triggerRefresh();
        },
      },
    ],
  });
}

export function unregisterLibraryMenus() {
  if (!registeredMenuID) {
    return;
  }
  Zotero.MenuManager.unregisterMenu(MENU_IDS.libraryItem);
  registeredMenuID = false;
}
