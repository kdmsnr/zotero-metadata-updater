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

let registered = false;

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
  if (registered) {
    return;
  }

  ztoolkit.Menu.register("item", {
    tag: "menuitem",
    id: MENU_IDS.libraryItem,
    label: getString("menu-refresh-metadata"),
    commandListener: () => {
      triggerRefresh();
    },
  });
  registered = true;
}

export function unregisterLibraryMenus() {
  if (!registered) {
    return;
  }
  ztoolkit.unregisterAll();
  registered = false;
}
