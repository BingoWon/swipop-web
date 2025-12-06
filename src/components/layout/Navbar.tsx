"use client";

import React from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Link,
    Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function MainNavbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <Navbar
            classNames={{
                base: "border-b border-default-200/50 bg-background/70 backdrop-blur-lg",
                wrapper: "w-full max-w-7xl",
                item: "hidden md:flex",
            }}
            height="64px"
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
        >
            {/* Left: Brand */}
            <NavbarBrand>
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                        <Icon icon="solar:code-bold" className="text-xl" />
                    </div>
                    <span className="text-lg font-bold text-foreground">Swipop</span>
                </Link>
            </NavbarBrand>

            {/* Center: Navigation */}
            <NavbarContent justify="center">
                <NavbarItem>
                    <Link href="/" className="text-foreground font-medium">
                        Discover
                    </Link>
                </NavbarItem>
                <NavbarItem>
                    <Link href="/create" className="text-default-500">
                        Create
                    </Link>
                </NavbarItem>
            </NavbarContent>

            {/* Right: Actions */}
            <NavbarContent justify="end">
                <NavbarItem className="hidden md:flex">
                    <ThemeToggle />
                </NavbarItem>
                <NavbarItem className="hidden md:flex gap-2">
                    <Button as={Link} href="/login" variant="light">
                        Login
                    </Button>
                    <Button
                        as={Link}
                        href="/signup"
                        color="primary"
                        endContent={<Icon icon="solar:arrow-right-linear" />}
                    >
                        Get Started
                    </Button>
                </NavbarItem>
            </NavbarContent>

            {/* Mobile Menu Toggle */}
            <NavbarMenuToggle className="text-default-400 md:hidden" />

            {/* Mobile Menu */}
            <NavbarMenu className="bg-background/95 backdrop-blur-lg pt-6 pb-6">
                <NavbarMenuItem>
                    <Link href="/" className="text-foreground w-full text-lg py-2">
                        Discover
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Link href="/create" className="text-default-500 w-full text-lg py-2">
                        Create
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem className="mt-4">
                    <Button as={Link} href="/login" variant="flat" fullWidth>
                        Login
                    </Button>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <Button as={Link} href="/signup" color="primary" fullWidth>
                        Get Started
                    </Button>
                </NavbarMenuItem>
                <NavbarMenuItem className="mt-4 flex justify-center">
                    <ThemeToggle />
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}
