"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { FeedSection } from "@/components/feed/FeedSection";

export default function Home() {
  return (
    <SidebarLayout>
      <div className="min-h-screen">
        {/* Mobile Header - shown only on mobile */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-default-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
              <Icon icon="solar:code-bold" className="text-lg" />
            </div>
            <span className="font-bold">Swipop</span>
          </Link>
          <div className="flex gap-1">
            <Button as={Link} href="/search" isIconOnly variant="light" size="sm">
              <Icon icon="solar:magnifer-linear" />
            </Button>
            <Button as={Link} href="/inbox" isIconOnly variant="light" size="sm">
              <Icon icon="solar:bell-linear" />
            </Button>
          </div>
        </header>

        {/* Feed - directly showing projects like iOS app */}
        <FeedSection />
      </div>
    </SidebarLayout>
  );
}
