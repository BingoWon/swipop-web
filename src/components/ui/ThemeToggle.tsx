"use client";

import { useTheme } from "next-themes";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

const themeOptions = [
    { key: "system", label: "跟随系统", icon: "solar:monitor-bold" },
    { key: "light", label: "浅色", icon: "solar:sun-bold" },
    { key: "dark", label: "深色", icon: "solar:moon-bold" },
];

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentIcon = () => {
        if (!mounted) return "solar:monitor-bold";
        switch (theme) {
            case "light": return "solar:sun-bold";
            case "dark": return "solar:moon-bold";
            default: return "solar:monitor-bold";
        }
    };

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button isIconOnly variant="light" aria-label="切换主题">
                    <Icon icon={currentIcon()} className="text-default-500 text-xl" />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="主题选择"
                selectionMode="single"
                selectedKeys={new Set([theme || "system"])}
                onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setTheme(selected);
                }}
            >
                {themeOptions.map((option) => (
                    <DropdownItem
                        key={option.key}
                        startContent={<Icon icon={option.icon} className="text-lg" />}
                    >
                        {option.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}
