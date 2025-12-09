"use client";

import {
	Avatar,
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	Spinner,
	Tab,
	Tabs,
	Textarea,
	useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import Link from "next/link";
import React from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { InteractionService } from "@/lib/services/interaction";
import { UserService } from "@/lib/services/user";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfileLink, Project } from "@/lib/types";

// Edit Profile Modal (matches iOS EditProfileView)
function EditProfileModal({
	profile,
	isOpen,
	onClose,
	onSave,
}: {
	profile: Profile;
	isOpen: boolean;
	onClose: () => void;
	onSave: (updated: Profile) => void;
}) {
	const [displayName, setDisplayName] = React.useState(profile.display_name || "");
	const [username, setUsername] = React.useState(profile.username || "");
	const [bio, setBio] = React.useState(profile.bio || "");
	const [links, setLinks] = React.useState<ProfileLink[]>(profile.links || []);
	const [isSaving, setIsSaving] = React.useState(false);

	const handleAddLink = () => {
		setLinks([...links, { title: "", url: "" }]);
	};

	const handleRemoveLink = (index: number) => {
		setLinks(links.filter((_, i) => i !== index));
	};

	const handleLinkChange = (index: number, field: "title" | "url", value: string) => {
		const updated = [...links];
		updated[index] = { ...updated[index], [field]: value };
		setLinks(updated);
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const validLinks = links.filter((l) => l.title && l.url);
			const updated = await UserService.updateProfile(profile.id, {
				display_name: displayName || null,
				username: username || null,
				bio: bio || null,
				links: validLinks,
			});
			if (updated) {
				onSave(updated);
				onClose();
			}
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
			<ModalContent>
				<ModalHeader>Edit Profile</ModalHeader>
				<ModalBody className="gap-4">
					<Input
						label="Display Name"
						placeholder="Your name"
						value={displayName}
						onValueChange={setDisplayName}
					/>
					<Input
						label="Username"
						placeholder="username"
						value={username}
						onValueChange={setUsername}
						startContent={<span className="text-default-400 text-sm">@</span>}
					/>
					<Textarea
						label="Bio"
						placeholder="Tell us about yourself"
						value={bio}
						onValueChange={setBio}
						minRows={2}
						maxRows={4}
					/>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Links</span>
							<Button size="sm" variant="flat" onPress={handleAddLink} startContent={<Icon icon="solar:add-circle-bold" />}>
								Add Link
							</Button>
						</div>
						{links.map((link, i) => (
							<div key={i} className="flex gap-2 items-start">
								<Input
									size="sm"
									placeholder="Title"
									value={link.title}
									onValueChange={(v) => handleLinkChange(i, "title", v)}
									className="flex-1"
								/>
								<Input
									size="sm"
									placeholder="https://..."
									value={link.url}
									onValueChange={(v) => handleLinkChange(i, "url", v)}
									className="flex-[2]"
								/>
								<Button
									isIconOnly
									size="sm"
									variant="light"
									color="danger"
									onPress={() => handleRemoveLink(i)}
								>
									<Icon icon="solar:trash-bin-trash-bold" />
								</Button>
							</div>
						))}
					</div>
				</ModalBody>
				<ModalFooter>
					<Button variant="flat" onPress={onClose}>
						Cancel
					</Button>
					<Button color="primary" onPress={handleSave} isLoading={isSaving}>
						Save
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

// Profile Header (matches iOS ProfileHeaderView)
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
			{/* Avatar + Name + Edit row */}
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

			{/* Bio */}
			{profile.bio && (
				<p className="text-sm text-default-600 line-clamp-3">{profile.bio}</p>
			)}

			{/* Links */}
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

// Stats Row (matches iOS ProfileStatsRow)
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

// Profile Project Cell (matches iOS ProfileProjectCell - cover only)
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
	// Own profile → edit, other profile → view details (matches iOS editProject behavior)
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

// True Masonry Grid using CSS multi-column layout for varying height items
function MasonryGrid({
	projects,
	showDraftBadges,
	isOwnProfile,
	minColumnWidth = 250,
	gap = 8,
}: {
	projects: Project[];
	showDraftBadges?: boolean;
	isOwnProfile?: boolean;
	minColumnWidth?: number;
	gap?: number;
}) {
	return (
		<div
			className="mt-4"
			style={{
				columnWidth: `${minColumnWidth}px`,
				columnGap: `${gap}px`,
			}}
		>
			{projects.map((project) => (
				<div
					key={project.id}
					style={{
						breakInside: "avoid",
						marginBottom: `${gap}px`,
					}}
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

// Empty State
function EmptyState({ icon, message }: { icon: string; message: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 gap-3">
			<Icon icon={icon} className="text-4xl text-default-300" />
			<p className="text-sm text-default-500">{message}</p>
		</div>
	);
}

// Follow Button (for other profiles)
function FollowButton({
	isFollowing,
	onPress,
}: {
	isFollowing: boolean;
	onPress: () => void;
}) {
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

export default function ProfilePage({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { user, refreshProfile } = useAuth();
	const [profile, setProfile] = React.useState<Profile | null>(null);
	const [projects, setProjects] = React.useState<Project[]>([]);
	const [likedProjects, setLikedProjects] = React.useState<Project[]>([]);
	const [collectedProjects, setCollectedProjects] = React.useState<Project[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [isFollowing, setIsFollowing] = React.useState(false);
	const [followerCount, setFollowerCount] = React.useState(0);
	const [followingCount, setFollowingCount] = React.useState(0);
	const [likeCount, setLikeCount] = React.useState(0);
	const [selectedTab, setSelectedTab] = React.useState("projects");

	const editModal = useDisclosure();

	React.useEffect(() => {
		async function loadData() {
			const { username } = await params;
			const supabase = createClient();

			// Step 1: Fetch profile first (needed for user ID)
			const { data: profileData, error: profileError } = await supabase
				.from("users")
				.select("*")
				.eq("username", username)
				.single();

			if (profileError || !profileData) {
				console.error("Error fetching profile:", profileError);
				setLoading(false);
				return;
			}

			setProfile(profileData);
			const isOwnProfile = user?.id === profileData.id;

			// Step 2: Fetch ALL remaining data in parallel
			// Build project query
			let projectQuery = supabase
				.from("projects")
				.select("*")
				.eq("user_id", profileData.id)
				.order("created_at", { ascending: false });
			if (!isOwnProfile) {
				projectQuery = projectQuery.eq("is_published", true);
			}

			// Run ALL queries in parallel
			const [
				projectsResult,
				followers,
				following,
				likes,
				liked,
				collected,
				isFollowingResult,
			] = await Promise.all([
				projectQuery,
				UserService.fetchFollowerCount(profileData.id),
				UserService.fetchFollowingCount(profileData.id),
				InteractionService.fetchLikeCount(profileData.id),
				isOwnProfile && user ? InteractionService.fetchLikedProjects(user.id) : Promise.resolve([]),
				isOwnProfile && user ? InteractionService.fetchCollectedProjects(user.id) : Promise.resolve([]),
				user && !isOwnProfile ? UserService.isFollowing(user.id, profileData.id) : Promise.resolve(false),
			]);

			// Apply results
			setProjects(projectsResult.data || []);
			setFollowerCount(followers);
			setFollowingCount(following);
			setLikeCount(likes);
			setLikedProjects(liked);
			setCollectedProjects(collected);
			setIsFollowing(isFollowingResult);

			setLoading(false);
		}

		loadData();
	}, [params, user]);

	const handleFollow = async () => {
		if (!user || !profile) return;
		const newIsFollowing = await UserService.toggleFollow(user.id, profile.id);
		setIsFollowing(newIsFollowing);
		setFollowerCount(newIsFollowing ? followerCount + 1 : followerCount - 1);
	};

	const handleProfileUpdate = (updated: Profile) => {
		setProfile(updated);
		refreshProfile(); // Update global auth context
	};

	if (loading) {
		return (
			<div className="p-4 md:p-6">
				<div className="flex items-center justify-center min-h-[60vh]">
					<Spinner size="lg" />
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="p-4 md:p-6">
				<div className="flex items-center justify-center min-h-[60vh]">
					<p className="text-default-500">User not found</p>
				</div>
			</div>
		);
	}

	const isOwnProfile = user?.id === profile.id;

	// Tab content
	const renderTabContent = () => {
		switch (selectedTab) {
			case "projects":
				return projects.length > 0 ? (
					<MasonryGrid projects={projects} showDraftBadges={isOwnProfile} isOwnProfile={isOwnProfile} />
				) : (
					<EmptyState icon="solar:code-bold" message="No projects created yet" />
				);
			case "likes":
				return likedProjects.length > 0 ? (
					<MasonryGrid projects={likedProjects} isOwnProfile={isOwnProfile} />
				) : (
					<EmptyState icon="solar:heart-bold" message="No liked projects yet" />
				);
			case "collected":
				return collectedProjects.length > 0 ? (
					<MasonryGrid projects={collectedProjects} isOwnProfile={isOwnProfile} />
				) : (
					<EmptyState icon="solar:bookmark-bold" message="No saved projects yet" />
				);
			default:
				return null;
		}
	};

	return (
		<div className="p-4 md:p-6">
			{/* Follow button for other profiles */}
			{!isOwnProfile && user && (
				<div className="flex justify-end mb-4">
					<FollowButton isFollowing={isFollowing} onPress={handleFollow} />
				</div>
			)}

			{/* Profile Header */}
			<ProfileHeader
				profile={profile}
				isOwnProfile={isOwnProfile}
				onEditTapped={editModal.onOpen}
			/>

			{/* Stats Row */}
			<ProfileStatsRow
				projectCount={projects.length}
				followerCount={followerCount}
				followingCount={followingCount}
				likeCount={likeCount}
			/>

			{/* Tabs (icon only, matches iOS) */}
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

			{/* Tab Content */}
			<div className="pb-4">{renderTabContent()}</div>

			{/* Edit Profile Modal */}
			{isOwnProfile && (
				<EditProfileModal
					profile={profile}
					isOpen={editModal.isOpen}
					onClose={editModal.onClose}
					onSave={handleProfileUpdate}
				/>
			)}
		</div>
	);
}
