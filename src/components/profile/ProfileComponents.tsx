"use client";

import { Avatar, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type { Profile, Project } from "@/lib/types";

// ============================================================================
// Profile Header
// ============================================================================

interface ProfileHeaderProps {
	profile: Profile;
	isOwnProfile: boolean;
	onEditTapped?: () => void;
}

export function ProfileHeader({
	profile,
	isOwnProfile,
	onEditTapped,
}: ProfileHeaderProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<Avatar
					className="h-[72px] w-[72px] text-2xl shrink-0"
					showFallback
					name={(profile.display_name || profile.username || "U")
						.charAt(0)
						.toUpperCase()}
					src={profile.avatar_url || undefined}
				/>
				<div className="flex-1 min-w-0">
					<p className="text-xl font-bold truncate">
						{profile.display_name || profile.username || "User"}
					</p>
					<p className="text-sm text-default-500 truncate">
						@{profile.username}
					</p>
				</div>
				{isOwnProfile && onEditTapped && (
					<Button
						size="sm"
						variant="flat"
						className="shrink-0"
						onPress={onEditTapped}
					>
						Edit
					</Button>
				)}
			</div>

			{profile.bio && (
				<p className="text-sm text-default-600 line-clamp-3">{profile.bio}</p>
			)}

			{profile.links && profile.links.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{profile.links.map((link) => (
						<a
							key={link.url}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
						>
							<Icon icon="solar:link-bold" className="text-sm" />
							{link.title}
						</a>
					))}
				</div>
			)}
		</div>
	);
}

// ============================================================================
// Profile Stats Row
// ============================================================================

interface ProfileStatsRowProps {
	projectCount: number;
	followerCount: number;
	followingCount: number;
	likeCount: number;
}

export function ProfileStatsRow({
	projectCount,
	followerCount,
	followingCount,
	likeCount,
}: ProfileStatsRowProps) {
	const StatItem = ({ value, label }: { value: number; label: string }) => (
		<div className="flex-1 flex flex-col items-center py-3">
			<span className="text-base font-bold">{value}</span>
			<span className="text-[11px] text-default-500">{label}</span>
		</div>
	);

	return (
		<div className="flex mt-4 bg-default-100 rounded-xl divide-x divide-default-200">
			<StatItem value={projectCount} label="Projects" />
			<StatItem value={followerCount} label="Followers" />
			<StatItem value={followingCount} label="Following" />
			<StatItem value={likeCount} label="Likes" />
		</div>
	);
}

// ============================================================================
// Profile Project Grid & Cell
// ============================================================================

interface ProfileProjectCellProps {
	project: Project;
	showDraftBadge?: boolean;
	isOwnProfile?: boolean;
}

function ProfileProjectCell({
	project,
	showDraftBadge,
	isOwnProfile,
}: ProfileProjectCellProps) {
	const aspectRatio = project.thumbnail_aspect_ratio || 0.75;
	const href = isOwnProfile
		? `/create/${project.id}`
		: `/project/${project.id}`;

	return (
		<Link href={href} className="relative block group">
			<div
				className="relative w-full overflow-hidden rounded-lg bg-default-200"
				style={{ aspectRatio: String(aspectRatio) }}
			>
				{project.thumbnail_url ? (
					<img
						src={project.thumbnail_url}
						alt={project.title}
						className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-default-200 to-default-300">
						<Icon
							icon="solar:code-bold"
							className="text-2xl text-default-400"
						/>
					</div>
				)}
			</div>
			{showDraftBadge && (
				<span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-semibold text-black bg-orange-400 rounded">
					Draft
				</span>
			)}
		</Link>
	);
}

interface ProfileProjectGridProps {
	projects: Project[];
	showDraftBadges?: boolean;
	isOwnProfile?: boolean;
}

export function ProfileProjectGrid({
	projects,
	showDraftBadges,
	isOwnProfile,
}: ProfileProjectGridProps) {
	return (
		<div className="mt-4" style={{ columnWidth: "250px", columnGap: "8px" }}>
			{projects.map((project) => (
				<div
					key={project.id}
					style={{ breakInside: "avoid", marginBottom: "8px" }}
				>
					<ProfileProjectCell
						project={project}
						showDraftBadge={showDraftBadges && !project.is_published}
						isOwnProfile={isOwnProfile}
					/>
				</div>
			))}
		</div>
	);
}
