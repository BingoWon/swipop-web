"use client";

import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button isIconOnly variant="light" aria-label="Toggle theme">
                <Icon icon="solar:sun-bold" className="text-default-500 text-xl" />
            </Button>
        );
    }

    return (
        <Button
            isIconOnly
            variant="light"
            aria-label="Toggle theme"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? (
                <Icon icon="solar:sun-bold" className="text-default-500 text-xl" />
            ) : (
                <Icon icon="solar:moon-bold" className="text-default-500 text-xl" />
            )}
        </Button>
    );
}
