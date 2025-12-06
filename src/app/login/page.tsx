"use client";

import { Button, Checkbox, Divider, Form, Input, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import React from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
	const [isVisible, setIsVisible] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();

	const toggleVisibility = () => setIsVisible(!isVisible);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
		} else {
			router.push("/");
			router.refresh();
		}
	};

	const handleOAuth = async (provider: "google" | "github" | "apple") => {
		setIsLoading(true);
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});
		if (error) {
			setError(error.message);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 p-2 sm:p-4 lg:p-8">
			<div className="rounded-large bg-content1 shadow-large flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
				{/* Logo */}
				<div className="flex items-center gap-2 pb-2">
					<div className="bg-primary text-primary-foreground rounded-lg p-1.5">
						<Icon icon="solar:code-bold" className="text-xl" />
					</div>
					<span className="text-lg font-bold">Swipop</span>
				</div>

				<p className="pb-2 text-xl font-medium">Log In</p>

				{error && (
					<div className="bg-danger-100 text-danger-600 rounded-medium px-4 py-2 text-sm">
						{error}
					</div>
				)}

				<Form
					className="flex flex-col gap-3"
					validationBehavior="native"
					onSubmit={handleSubmit}
				>
					<Input
						isRequired
						label="Email Address"
						name="email"
						placeholder="Enter your email"
						type="email"
						variant="bordered"
					/>
					<Input
						isRequired
						endContent={
							<button type="button" onClick={toggleVisibility}>
								{isVisible ? (
									<Icon
										className="text-default-400 pointer-events-none text-2xl"
										icon="solar:eye-closed-linear"
									/>
								) : (
									<Icon
										className="text-default-400 pointer-events-none text-2xl"
										icon="solar:eye-bold"
									/>
								)}
							</button>
						}
						label="Password"
						name="password"
						placeholder="Enter your password"
						type={isVisible ? "text" : "password"}
						variant="bordered"
					/>
					<div className="flex w-full items-center justify-between px-1 py-2">
						<Checkbox name="remember" size="sm">
							Remember me
						</Checkbox>
						<Link className="text-default-500" href="#" size="sm">
							Forgot password?
						</Link>
					</div>
					<Button
						className="w-full"
						color="primary"
						type="submit"
						isLoading={isLoading}
					>
						Log In
					</Button>
				</Form>

				<div className="flex items-center gap-4 py-2">
					<Divider className="flex-1" />
					<p className="text-tiny text-default-500 shrink-0">OR</p>
					<Divider className="flex-1" />
				</div>

				<div className="flex flex-col gap-2">
					<Button
						startContent={<Icon icon="ic:baseline-apple" width={24} />}
						variant="bordered"
						className="bg-black text-white dark:bg-white dark:text-black"
						onPress={() => handleOAuth("apple")}
						isDisabled={isLoading}
					>
						Continue with Apple
					</Button>
					<Button
						startContent={<Icon icon="flat-color-icons:google" width={24} />}
						variant="bordered"
						onPress={() => handleOAuth("google")}
						isDisabled={isLoading}
					>
						Continue with Google
					</Button>
					<Button
						startContent={
							<Icon className="text-default-500" icon="fe:github" width={24} />
						}
						variant="bordered"
						onPress={() => handleOAuth("github")}
						isDisabled={isLoading}
					>
						Continue with Github
					</Button>
				</div>

				<p className="text-small text-center">
					Need to create an account?&nbsp;
					<Link href="/signup" size="sm">
						Sign Up
					</Link>
				</p>
			</div>
		</div>
	);
}
