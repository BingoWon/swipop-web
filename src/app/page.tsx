"use client";

import { MainNavbar } from "@/components/layout/Navbar";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { FeedSection } from "@/components/feed/FeedSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Swipe Through{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Live Code
            </span>
          </h1>
          <p className="text-xl text-default-500 max-w-2xl mx-auto mb-8">
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
              Explore Projects
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 py-12">
          <FeatureCard
            icon="solar:code-bold"
            title="No Camera Required"
            description="Express yourself through code, not video. Share your frontend creations without showing your face."
          />
          <FeatureCard
            icon="solar:cursor-bold"
            title="Interactive Content"
            description="Projects are not just viewed — they can be experienced and interacted with in real-time."
          />
          <FeatureCard
            icon="solar:magic-stick-3-bold"
            title="AI-Assisted Creation"
            description="Leverage vibe coding to bring ideas to life without deep technical expertise."
          />
        </section>

        {/* Feed Section */}
        <section className="py-12">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-default-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                <Icon icon="solar:code-bold" className="text-lg" />
              </div>
              <span className="font-bold">Swipop</span>
            </div>
            <div className="flex gap-6 text-small text-default-500">
              <Link href="#" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Help
              </Link>
            </div>
            <p className="text-small text-default-400">
              © 2024 Swipop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
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
      <p className="text-default-500">{description}</p>
    </div>
  );
}
