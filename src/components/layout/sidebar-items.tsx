import { type SidebarItem, SidebarItemType } from "./Sidebar";

/**
 * Sidebar items for Swipop navigation
 * Matches iOS app tabs: Home, Create (with sub-tabs), Inbox, Profile
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
                href: "/create?tab=chat",
                icon: "solar:chat-round-dots-bold",
                title: "Chat",
            },
            {
                key: "create-preview",
                href: "/create?tab=preview",
                icon: "solar:play-bold",
                title: "Preview",
            },
            {
                key: "create-html",
                href: "/create?tab=html",
                icon: "solar:code-bold",
                title: "HTML",
            },
            {
                key: "create-css",
                href: "/create?tab=css",
                icon: "solar:palette-bold",
                title: "CSS",
            },
            {
                key: "create-js",
                href: "/create?tab=js",
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
        // Badge handled dynamically in AppSidebar
    },
    {
        key: "profile",
        href: "/profile",
        icon: "solar:user-bold",
        title: "Profile",
        // Redirects to user's own profile via route handler
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
