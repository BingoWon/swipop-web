"use client";

import {
	Avatar,
	Button,
	Card,
	CardBody,
	Chip,
	ScrollShadow,
	Spinner,
	Tab,
	Tabs,
	Textarea,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useAuth } from "@/lib/contexts/AuthContext";
import { CommentService } from "@/lib/services/comment";
import { InteractionService } from "@/lib/services/interaction";
import { UserService } from "@/lib/services/user";
import { createClient } from "@/lib/supabase/client";
import type { Comment, Profile, Project } from "@/lib/types";

type CodeLanguage = "html" | "css" | "js";

export default function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { user } = useAuth();
	const [project, setProject] = React.useState<
		(Project & { creator?: Profile }) | null
	>(null);
	const [comments, setComments] = React.useState<
		(Comment & { profile?: Profile })[]
	>([]);
	const [loading, setLoading] = React.useState(true);
	const [isLiked, setIsLiked] = React.useState(false);
	const [isCollected, setIsCollected] = React.useState(false);
	const [isFollowing, setIsFollowing] = React.useState(false);
	const [newComment, setNewComment] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [selectedLang, setSelectedLang] = React.useState<CodeLanguage>("html");

	React.useEffect(() => {
		async function loadProject() {
			const { id } = await params;
			const supabase = createClient();

			const { data: projectData, error } = await supabase
				.from("projects")
				.select(`*, creator:users (id, username, display_name, avatar_url)`)
				.eq("id", id)
				.single();

			if (error) {
				setLoading(false);
				return;
			}

			setProject(projectData);
			const commentsData = await CommentService.fetchComments(id);
			setComments(commentsData);

			if (user) {
				const [liked, collected] = await Promise.all([
					InteractionService.isLiked(id, user.id),
					InteractionService.isCollected(id, user.id),
				]);
				setIsLiked(liked);
				setIsCollected(collected);
				if (projectData.creator) {
					setIsFollowing(
						await UserService.isFollowing(user.id, projectData.creator.id),
					);
				}
			}
			setLoading(false);
		}
		loadProject();
	}, [params, user]);

	const handleLike = async () => {
		if (!user || !project) return;
		const newIsLiked = await InteractionService.toggleLike(project.id, user.id);
		setIsLiked(newIsLiked);
		setProject({
			...project,
			like_count: project.like_count + (newIsLiked ? 1 : -1),
		});
	};

	const handleCollect = async () => {
		if (!user || !project) return;
		const newIsCollected = await InteractionService.toggleCollect(
			project.id,
			user.id,
		);
		setIsCollected(newIsCollected);
		setProject({
			...project,
			collect_count: project.collect_count + (newIsCollected ? 1 : -1),
		});
	};

	const handleFollow = async () => {
		if (!user || !project?.creator) return;
		setIsFollowing(await UserService.toggleFollow(user.id, project.creator.id));
	};

	const handleSubmitComment = async () => {
		if (!user || !project || !newComment.trim()) return;
		setIsSubmitting(true);
		const comment = await CommentService.createComment(
			project.id,
			user.id,
			newComment,
		);
		if (comment) {
			setComments([comment, ...comments]);
			setNewComment("");
			setProject({ ...project, comment_count: project.comment_count + 1 });
		}
		setIsSubmitting(false);
	};

	if (loading) {
		return (
			<SidebarLayout noPadding>
				<div className="flex items-center justify-center h-screen">
					<Spinner size="lg" />
				</div>
			</SidebarLayout>
		);
	}

	if (!project) {
		return (
			<SidebarLayout noPadding>
				<div className="flex items-center justify-center h-screen">
					<p className="text-default-500">Project not found</p>
				</div>
			</SidebarLayout>
		);
	}

	const previewSrcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${project.css_content || ""}</style></head><body style="margin:0">${project.html_content || ""}<script>${project.js_content || ""}</script></body></html>`;

	const codeContent: Record<CodeLanguage, string> = {
		html: project.html_content || "<!-- No HTML content -->",
		css: project.css_content || "/* No CSS content */",
		js: project.js_content || "// No JavaScript content",
	};

	const creatorAvatar = project.creator?.avatar_url;
	const creatorInitial =
		project.creator?.display_name?.[0] ||
		project.creator?.username?.[0] ||
		"U";

	return (
		<SidebarLayout noPadding>
			{/* Desktop: side by side 1:1, Mobile: stacked full height each */}
			<div className="flex flex-col lg:flex-row h-screen">
				{/* Left: Preview - full viewport height on mobile, 50% width on desktop */}
				<div className="h-screen lg:h-auto lg:flex-1 bg-black shrink-0">
					<iframe
						srcDoc={previewSrcDoc}
						sandbox="allow-scripts"
						className="w-full h-full border-0"
						title={project.title || "Project Preview"}
					/>
				</div>

				{/* Right: Details & Comments - full viewport height on mobile, 50% width on desktop */}
				<div className="h-screen lg:h-auto lg:flex-1 border-t lg:border-t-0 lg:border-l border-divider bg-content1 flex flex-col">
					<ScrollShadow className="flex-1 overflow-auto">
						<div className="p-6 space-y-5">
							{/* Creator Section with Avatar */}
							<div className="flex items-center gap-3">
								<Link href={`/profile/${project.creator?.username}`}>
									<Avatar
										size="md"
										showFallback
										name={creatorInitial}
										src={creatorAvatar || undefined}
										imgProps={{
											referrerPolicy: "no-referrer",
										}}
									/>
								</Link>
								<div className="flex-1 min-w-0">
									<Link
										href={`/profile/${project.creator?.username}`}
										className="font-medium hover:underline truncate block"
									>
										{project.creator?.display_name || project.creator?.username}
									</Link>
									<p className="text-small text-default-400 truncate">
										@{project.creator?.username}
									</p>
								</div>
								{user && project.creator && user.id !== project.creator.id && (
									<Button
										color={isFollowing ? "default" : "primary"}
										variant={isFollowing ? "bordered" : "solid"}
										size="sm"
										onPress={handleFollow}
									>
										{isFollowing ? "Following" : "Follow"}
									</Button>
								)}
							</div>

							{/* Title & Description */}
							<div>
								<h1 className="text-xl font-bold">
									{project.title || "Untitled"}
								</h1>
								{project.description && (
									<p className="text-default-500 text-small mt-1">
										{project.description}
									</p>
								)}
							</div>

							{/* Tags */}
							{project.tags && project.tags.length > 0 && (
								<div className="flex flex-wrap gap-1">
									{project.tags.map((tag) => (
										<Chip key={tag} size="sm" variant="flat">
											#{tag}
										</Chip>
									))}
								</div>
							)}

							{/* Stats Row */}
							<div className="grid grid-cols-5 gap-1 py-2">
								<StatTile icon="solar:eye-bold" count={project.view_count} />
								<StatTile
									icon={isLiked ? "solar:heart-bold" : "solar:heart-linear"}
									count={project.like_count}
									color={isLiked ? "text-danger" : undefined}
									onClick={user ? handleLike : undefined}
								/>
								<StatTile
									icon="solar:chat-round-dots-bold"
									count={project.comment_count}
								/>
								<StatTile
									icon={
										isCollected
											? "solar:bookmark-bold"
											: "solar:bookmark-linear"
									}
									count={project.collect_count}
									color={isCollected ? "text-warning" : undefined}
									onClick={user ? handleCollect : undefined}
								/>
								<StatTile icon="solar:share-bold" count={project.share_count} />
							</div>

							{/* Source Code Tabs */}
							<div className="border-t border-divider pt-4">
								<Tabs
									selectedKey={selectedLang}
									onSelectionChange={(key) =>
										setSelectedLang(key as CodeLanguage)
									}
									size="sm"
									classNames={{ tabList: "mb-2" }}
								>
									<Tab key="html" title="HTML" />
									<Tab key="css" title="CSS" />
									<Tab key="js" title="JavaScript" />
								</Tabs>
								<Card className="shadow-none border border-divider">
									<CardBody className="p-0">
										<pre className="p-3 text-xs overflow-auto max-h-40 bg-content2 font-mono">
											<code>{codeContent[selectedLang]}</code>
										</pre>
									</CardBody>
								</Card>
							</div>

							{/* Comment Input */}
							{user && (
								<div className="space-y-2 border-t border-divider pt-4">
									<Textarea
										placeholder="Add a comment..."
										value={newComment}
										onValueChange={setNewComment}
										minRows={2}
										size="sm"
									/>
									<div className="flex justify-end">
										<Button
											color="primary"
											size="sm"
											onPress={handleSubmitComment}
											isLoading={isSubmitting}
											isDisabled={!newComment.trim()}
										>
											Post
										</Button>
									</div>
								</div>
							)}

							{/* Comments List */}
							<div className="border-t border-divider pt-4">
								<h3 className="font-medium text-small mb-3">
									Comments ({comments.length})
								</h3>
								{comments.length > 0 ? (
									<div className="space-y-3">
										{comments.map((comment) => (
											<div key={comment.id} className="flex gap-2">
												<Avatar
													size="sm"
													showFallback
													name={comment.profile?.display_name?.[0] || "U"}
													src={comment.profile?.avatar_url || undefined}
												/>
												<div className="flex-1 min-w-0">
													<Link
														href={`/profile/${comment.profile?.username}`}
														className="text-small font-medium hover:underline"
													>
														{comment.profile?.display_name ||
															comment.profile?.username}
													</Link>
													<p className="text-small text-default-500 break-words">
														{comment.content}
													</p>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-small text-default-400">No comments yet</p>
								)}
							</div>
						</div>
					</ScrollShadow>
				</div>
			</div>
		</SidebarLayout>
	);
}

/** Stat tile matching iOS StatActionTile */
function StatTile({
	icon,
	count,
	color,
	onClick,
}: {
	icon: string;
	count: number;
	color?: string;
	onClick?: () => void;
}) {
	const content = (
		<div className="flex flex-col items-center gap-0.5">
			<Icon icon={icon} className={`text-xl ${color || "text-default-500"}`} />
			<span className="text-tiny text-default-400">{count}</span>
		</div>
	);
	return onClick ? (
		<button
			type="button"
			onClick={onClick}
			className="hover:opacity-70 transition-opacity"
		>
			{content}
		</button>
	) : (
		content
	);
}
