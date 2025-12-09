"use client";

import { Spinner, Tab, Tabs, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import React from "react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import {
	ProfileHeader,
	ProfileProjectGrid,
	ProfileStatsRow,
} from "@/components/profile/ProfileComponents";
import { EmptyState } from "@/components/ui/EmptyState";
import { FollowButton } from "@/components/ui/FollowButton";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useProfileStore } from "@/lib/stores/profile";
import type { Profile } from "@/lib/types";

export default function ProfilePage({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { user, refreshProfile } = useAuth();
	const {
		profiles,
		loadingUsername,
		error,
		loadProfile,
		updateProfile,
		toggleFollow,
	} = useProfileStore();
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

	const {
		profile,
		projects,
		likedProjects,
		collectedProjects,
		isFollowing,
		followerCount,
		followingCount,
		likeCount,
	} = profileData;
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
					<ProfileProjectGrid
						projects={projects}
						showDraftBadges={isOwnProfile}
						isOwnProfile={isOwnProfile}
					/>
				) : (
					<EmptyState
						icon="solar:code-bold"
						message="No projects created yet"
					/>
				);
			case "likes":
				return likedProjects.length > 0 ? (
					<ProfileProjectGrid
						projects={likedProjects}
						isOwnProfile={isOwnProfile}
					/>
				) : (
					<EmptyState icon="solar:heart-bold" message="No liked projects yet" />
				);
			case "collected":
				return collectedProjects.length > 0 ? (
					<ProfileProjectGrid
						projects={collectedProjects}
						isOwnProfile={isOwnProfile}
					/>
				) : (
					<EmptyState
						icon="solar:bookmark-bold"
						message="No saved projects yet"
					/>
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

			<ProfileHeader
				profile={profile}
				isOwnProfile={isOwnProfile}
				onEditTapped={editModal.onOpen}
			/>

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
					<Tab
						key="projects"
						title={<Icon icon="solar:widget-2-bold" className="text-xl" />}
					/>
					<Tab
						key="likes"
						title={<Icon icon="solar:heart-bold" className="text-xl" />}
					/>
					<Tab
						key="collected"
						title={<Icon icon="solar:bookmark-bold" className="text-xl" />}
					/>
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
