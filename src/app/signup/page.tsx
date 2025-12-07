"use client";

import { Button, Checkbox, Divider, Input, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
	const [isVisible, setIsVisible] = React.useState(false);
	const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState(false);
	const _router = useRouter();
	const supabase = createClient();

	const toggleVisibility = () => setIsVisible(!isVisible);
	const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${window.location.origin}/auth/callback`,
			},
		});

		if (error) {
			setError(error.message);
			setIsLoading(false);
		} else {
			setSuccess(true);
			setIsLoading(false);
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

	if (success) {
		return (
			<div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 p-2 sm:p-4 lg:p-8">
				<div className="rounded-large bg-content1 shadow-large flex w-full max-w-sm flex-col gap-4 px-8 py-10 text-center">
					<Icon
						icon="solar:check-circle-bold"
						className="text-success text-6xl mx-auto"
					/>
					<h2 className="text-xl font-medium">Check your email</h2>
					<p className="text-default-500">
						We sent you a confirmation email. Please check your inbox and click
						the link to verify your account.
					</p>
					<Button as={Link} href="/login" variant="flat">
						Back to Login
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 p-2 sm:p-4 lg:p-8">
			<div className="rounded-large bg-content1 shadow-small flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
				{/* Header with Logo and Theme Toggle */}
				<div className="flex items-center justify-between pb-2">
					<div className="flex items-center gap-2">
						<div className="bg-primary text-primary-foreground rounded-lg p-1.5">
							<Icon icon="solar:code-bold" className="text-xl" />
						</div>
						<span className="text-lg font-bold">Swipop</span>
					</div>
					<ThemeToggle />
				</div>

				<p className="pb-2 text-xl font-medium">Sign Up</p>

				{error && (
					<div className="bg-danger-100 text-danger-600 rounded-medium px-4 py-2 text-sm">
						{error}
					</div>
				)}

				<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
					<Input
						isRequired
						endContent={
							<button type="button" onClick={toggleConfirmVisibility}>
								{isConfirmVisible ? (
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
						label="Confirm Password"
						name="confirmPassword"
						placeholder="Confirm your password"
						type={isConfirmVisible ? "text" : "password"}
						variant="bordered"
					/>
					<Checkbox isRequired className="py-4" size="sm">
						I agree with the&nbsp;
						<Link className="relative z-1" href="#" size="sm">
							Terms
						</Link>
						&nbsp; and&nbsp;
						<Link className="relative z-1" href="#" size="sm">
							Privacy Policy
						</Link>
					</Checkbox>
					<Button color="primary" type="submit" isLoading={isLoading}>
						Sign Up
					</Button>
				</form>

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
					Already have an account?&nbsp;
					<Link href="/login" size="sm">
						Log In
					</Link>
				</p>
			</div>
		</div>
	);
}
