import { config } from "../../package.json";
import { getString } from "../utils/locale";
import {
  refreshItemsFromDOI,
  showOperationError,
  type RefreshableItem,
} from "./metadataRefresh";

const MENU_IDS = {
  libraryItem: `zotero-itemmenu-${config.addonRef}-refresh`,
};

let registeredMenuID: string | false = false;

function getRefreshableItems(items?: Zotero.Item[]): RefreshableItem[] {
  return (items ?? []).filter((item): item is RefreshableItem => {
    return item.isRegularItem() && item.isEditable("edit");
  });
}

function triggerRefresh(items?: Zotero.Item[]) {
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
        onShowing: (_event, context) => {
          context.menuElem.setAttribute(
            "label",
            getString("menu-refresh-metadata"),
          );
          context.setVisible(getRefreshableItems(context.items).length > 0);
        },
        onCommand: (_event, context) => {
          triggerRefresh(context.items);
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
