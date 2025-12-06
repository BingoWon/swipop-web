import { type SidebarItem, SidebarItemType } from "./Sidebar";

/**
 * Sidebar items for Swipop navigation
 * 5 top-level pages with Create sub-pages as nested items
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
		icon: "solar:magic-stick-3-bold",
		title: "Create",
		type: SidebarItemType.Nest,
		items: [
			{
				key: "create-chat",
				href: "/create/chat",
				icon: "solar:chat-round-dots-bold",
				title: "Chat",
			},
			{
				key: "create-preview",
				href: "/create/preview",
				icon: "solar:play-bold",
				title: "Preview",
			},
			{
				key: "create-html",
				href: "/create/html",
				icon: "solar:code-bold",
				title: "HTML",
			},
			{
				key: "create-css",
				href: "/create/css",
				icon: "solar:palette-bold",
				title: "CSS",
			},
			{
				key: "create-js",
				href: "/create/js",
				icon: "solar:bolt-bold",
				title: "JavaScript",
			},
		],
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
