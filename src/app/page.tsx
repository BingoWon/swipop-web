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
        <header className="md:hidden flex items-center justify-between p-4 border-b border-default-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
              <Icon icon="solar:code-bold" className="text-lg" />
            </div>
            <span className="font-bold">Swipop</span>
          </Link>
          <div className="flex gap-2">
            <Button as={Link} href="/search" isIconOnly variant="light">
              <Icon icon="solar:magnifer-linear" />
            </Button>
            <Button as={Link} href="/inbox" isIconOnly variant="light">
              <Icon icon="solar:bell-linear" />
            </Button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="text-center py-12 md:py-20">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Swipe Through{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Live Code
              </span>
            </h1>
            <p className="text-lg text-default-500 max-w-2xl mx-auto mb-8">
              A platform where anyone can showcase interactive web-based projects.
              TikTok for Frontend Creations — no camera required.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                as={Link}
                href="/create"
                color="primary"
                size="lg"
                endContent={<Icon icon="solar:arrow-right-linear" />}
              >
                Start Creating
              </Button>
              <Button
                as={Link}
                href="/search"
                variant="bordered"
                size="lg"
                startContent={<Icon icon="solar:magnifer-linear" />}
              >
                Explore
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-6 py-12">
            <FeatureCard
              icon="solar:code-bold"
              title="No Camera Required"
              description="Express yourself through code, not video. Share your frontend creations."
            />
            <FeatureCard
              icon="solar:cursor-bold"
              title="Interactive Content"
              description="Projects are experienced and interacted with in real-time."
            />
            <FeatureCard
              icon="solar:magic-stick-3-bold"
              title="AI-Assisted Creation"
              description="Leverage vibe coding to bring ideas to life easily."
            />
          </section>

          {/* Feed Section */}
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Discover</h2>
              <Button
                as={Link}
                href="/search"
                variant="light"
                endContent={<Icon icon="solar:arrow-right-linear" />}
              >
                View All
              </Button>
            </div>
            <FeedSection />
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-content1 rounded-2xl p-6 border border-default-200 hover:border-primary/50 transition-colors">
      <div className="bg-primary/10 text-primary rounded-xl w-12 h-12 flex items-center justify-center mb-4">
        <Icon icon={icon} className="text-2xl" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-default-500 text-sm">{description}</p>
    </div>
  );
}
