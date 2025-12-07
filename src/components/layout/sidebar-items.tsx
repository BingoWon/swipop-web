import { type SidebarItem, SidebarItemType } from "./Sidebar";

/**
 * Sidebar items for Swipop navigation
 * Simple flat structure - Create is now a single unified page
 */
export const sidebarItems: SidebarItem[] = [
	{
		key: "home",
		href: "/",
		icon: "solar:home-2-bold",
		title: "Home",
	},
	{
		key: "create",
		href: "/create",
		icon: "solar:magic-stick-3-bold",
		title: "Create",
	},
	{
		key: "inbox",
		href: "/inbox",
		icon: "solar:bell-bold",
		title: "Inbox",
	},
	{
		key: "profile",
		href: "/profile",
		icon: "solar:user-bold",
		title: "Profile",
	},
];

/**
 * Secondary sidebar items
 */
export const secondarySidebarItems: SidebarItem[] = [
	{
		key: "search",
		href: "/search",
		icon: "solar:magnifer-bold",
		title: "Search",
	},
	{
		key: "settings",
		href: "/settings",
		icon: "solar:settings-bold",
		title: "Settings",
	},
];
