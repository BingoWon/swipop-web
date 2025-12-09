/**
 * Icon Setup - Bundle only used icons locally for instant display
 *
 * This file registers only the specific icons used in the project,
 * keeping bundle size minimal (~43KB, ~10KB gzipped) while eliminating
 * icon flash/delay completely.
 *
 * To regenerate icon data: node scripts/extract-icons.mjs
 */
import { addIcon } from "@iconify/react";
import { iconData } from "./icons-data";

/**
 * Register all used icons from the pre-extracted data.
 * Icons are immediately available after this function runs.
 */
export function setupIcons(): void {
    for (const [name, data] of Object.entries(iconData.icons)) {
        const [prefix, iconName] = name.split(":");
        addIcon(name, {
            body: data.body,
            width: data.width,
            height: data.height,
        });
    }
}
