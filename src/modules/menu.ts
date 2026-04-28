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

let menuWindow: any = null;

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
  // This is called from onStartup which doesn't have window context yet
  // Menu registration will be done in onMainWindowLoad
}

export function registerMenusInWindow(window: any) {
  if (menuWindow === window) {
    return;
  }

  try {
    const contextMenu = window.document.getElementById("zotero-items-contextmenu");
    
    if (!contextMenu) {
      // Fallback: try to find the menu and create if needed
      return;
    }

    // Remove old menu item if exists
    const oldMenuItem = window.document.getElementById(MENU_IDS.libraryItem);
    if (oldMenuItem) {
      oldMenuItem.remove();
    }

    // Create menu item
    const menuitem = window.document.createXULElement("menuitem");
    menuitem.id = MENU_IDS.libraryItem;
    menuitem.setAttribute("label", getString("menu-refresh-metadata"));
    menuitem.addEventListener("command", () => {
      triggerRefresh();
    });

    contextMenu.appendChild(menuitem);
    menuWindow = window;
  } catch (e) {
    // silently fail
  }
}

export function unregisterLibraryMenus() {
  if (menuWindow) {
    try {
      const menuitem = menuWindow.document.getElementById(MENU_IDS.libraryItem);
      if (menuitem) {
        menuitem.remove();
      }
    } catch (e) {
      // ignore
    }
    menuWindow = null;
  }
}
