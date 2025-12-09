"use client";

import { Avatar, Button, Spinner, Tab, Tabs, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import React from "react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useProfileStore } from "@/lib/stores/profile";
import type { Profile, Project } from "@/lib/types";

// ============================================================================
// Sub-Components
// ============================================================================

function ProfileHeader({
	profile,
	isOwnProfile,
	onEditTapped,
}: {
	profile: Profile;
	isOwnProfile: boolean;
	onEditTapped?: () => void;
}) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-4">
				<Avatar
					className="h-[72px] w-[72px] text-2xl shrink-0"
					showFallback
					name={(profile.display_name || profile.username || "U").charAt(0).toUpperCase()}
					src={profile.avatar_url || undefined}
				/>
				<div className="flex-1 min-w-0">
					<p className="text-xl font-bold truncate">
						{profile.display_name || profile.username || "User"}
					</p>
					<p className="text-sm text-default-500 truncate">@{profile.username}</p>
				</div>
				{isOwnProfile && onEditTapped && (
					<Button size="sm" variant="flat" className="shrink-0" onPress={onEditTapped}>
						Edit
					</Button>
				)}
			</div>

			{profile.bio && <p className="text-sm text-default-600 line-clamp-3">{profile.bio}</p>}

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

function ProfileStatsRow({
	projectCount,
	followerCount,
	followingCount,
	likeCount,
}: {
	projectCount: number;
	followerCount: number;
	followingCount: number;
	likeCount: number;
}) {
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

function ProfileProjectCell({
	project,
	showDraftBadge,
	isOwnProfile,
}: {
	project: Project;
	showDraftBadge?: boolean;
	isOwnProfile?: boolean;
}) {
	const aspectRatio = project.thumbnail_aspect_ratio || 0.75;
	const href = isOwnProfile ? `/create/${project.id}` : `/project/${project.id}`;

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
						<Icon icon="solar:code-bold" className="text-2xl text-default-400" />
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

function ProjectGrid({
	projects,
	showDraftBadges,
	isOwnProfile,
}: {
	projects: Project[];
	showDraftBadges?: boolean;
	isOwnProfile?: boolean;
}) {
	return (
		<div
			className="mt-4"
			style={{ columnWidth: "250px", columnGap: "8px" }}
		>
			{projects.map((project) => (
				<div key={project.id} style={{ breakInside: "avoid", marginBottom: "8px" }}>
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

function EmptyState({ icon, message }: { icon: string; message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 gap-3">
			<Icon icon={icon} className="text-4xl text-default-300" />
			<p className="text-sm text-default-500">{message}</p>
		</div>
	);
}

function FollowButton({ isFollowing, onPress }: { isFollowing: boolean; onPress: () => void }) {
	return (
		<Button
			size="sm"
			color={isFollowing ? "default" : "primary"}
			variant={isFollowing ? "bordered" : "solid"}
			onPress={onPress}
			className="shrink-0"
		>
			{isFollowing ? "Following" : "Follow"}
		</Button>
	);
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
	const { user, refreshProfile } = useAuth();
	const { profiles, loadingUsername, error, loadProfile, updateProfile, toggleFollow } = useProfileStore();
	const [selectedTab, setSelectedTab] = React.useState("projects");
	const [username, setUsername] = React.useState<string | null>(null);
	const editModal = useDisclosure();

	// Resolve params and load profile
	React.useEffect(() => {
		params.then(({ username: u }) => {
			setUsername(u);
			loadProfile(u, user?.id);
		});
	}, [params, user?.id, loadProfile]);

	const profileData = username ? profiles[username] : null;
	const isLoading = loadingUsername === username;

	if (isLoading && !profileData) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error && !profileData) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-default-500">{error}</p>
			</div>
		);
	}

	if (!profileData || !username) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<p className="text-default-500">User not found</p>
			</div>
		);
	}

	const { profile, projects, likedProjects, collectedProjects, isFollowing, followerCount, followingCount, likeCount } = profileData;
	const isOwnProfile = user?.id === profile.id;

	const handleFollow = () => {
		if (user) toggleFollow(username, user.id);
	};

	const handleProfileUpdate = (updated: Profile) => {
		updateProfile(username, updated);
		refreshProfile();
	};

	const renderTabContent = () => {
		switch (selectedTab) {
			case "projects":
				return projects.length > 0 ? (
					<ProjectGrid projects={projects} showDraftBadges={isOwnProfile} isOwnProfile={isOwnProfile} />
				) : (
					<EmptyState icon="solar:code-bold" message="No projects created yet" />
				);
			case "likes":
				return likedProjects.length > 0 ? (
					<ProjectGrid projects={likedProjects} isOwnProfile={isOwnProfile} />
				) : (
					<EmptyState icon="solar:heart-bold" message="No liked projects yet" />
				);
			case "collected":
				return collectedProjects.length > 0 ? (
					<ProjectGrid projects={collectedProjects} isOwnProfile={isOwnProfile} />
				) : (
					<EmptyState icon="solar:bookmark-bold" message="No saved projects yet" />
				);
			default:
				return null;
		}
	};

	return (
		<>
			{!isOwnProfile && user && (
				<div className="flex justify-end mb-4">
					<FollowButton isFollowing={isFollowing} onPress={handleFollow} />
				</div>
			)}

			<ProfileHeader profile={profile} isOwnProfile={isOwnProfile} onEditTapped={editModal.onOpen} />

			<ProfileStatsRow
				projectCount={projects.length}
				followerCount={followerCount}
				followingCount={followingCount}
				likeCount={likeCount}
			/>

			<div className="mt-6">
				<Tabs
					selectedKey={selectedTab}
					onSelectionChange={(key) => setSelectedTab(key as string)}
					fullWidth
					variant="underlined"
					classNames={{
						tabList: "gap-0 border-b border-divider",
						tab: "h-12",
						cursor: "bg-primary",
					}}
				>
					<Tab key="projects" title={<Icon icon="solar:widget-2-bold" className="text-xl" />} />
					<Tab key="likes" title={<Icon icon="solar:heart-bold" className="text-xl" />} />
					<Tab key="collected" title={<Icon icon="solar:bookmark-bold" className="text-xl" />} />
				</Tabs>
			</div>

			<div className="pb-4">{renderTabContent()}</div>

			{isOwnProfile && (
				<EditProfileModal
					profile={profile}
					isOpen={editModal.isOpen}
					onClose={editModal.onClose}
					onSave={handleProfileUpdate}
				/>
			)}
		</>
	);
}
