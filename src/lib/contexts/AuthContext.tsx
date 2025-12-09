"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface AuthContextType {
	user: User | null;
	profile: Profile | null;
	loading: boolean;
	signOut: () => Promise<void>;
	refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	profile: null,
	loading: true,
	signOut: async () => {},
	refreshProfile: async () => {},
});

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	// Use ref to ensure we only initialize once
	const initialized = useRef(false);
	// Get singleton supabase client
	const supabase = createClient();

	const fetchProfile = useCallback(
		async (userId: string): Promise<Profile | null> => {
			const { data } = await supabase
				.from("users")
				.select("*")
				.eq("id", userId)
				.single();
			return data;
		},
		[supabase],
	);

	const refreshProfile = useCallback(async () => {
		if (user) {
			const profile = await fetchProfile(user.id);
			setProfile(profile);
		}
	}, [user, fetchProfile]);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		setUser(null);
		setProfile(null);
	}, [supabase]);

	useEffect(() => {
		// Prevent double initialization (React StrictMode)
		if (initialized.current) return;
		initialized.current = true;

		// Initialize auth state
		const initAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (session?.user) {
				setUser(session.user);
				// Wait for profile to load before setting loading to false
				const profile = await fetchProfile(session.user.id);
				setProfile(profile);
			}

			setLoading(false);
		};

		initAuth();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			async (event: AuthChangeEvent, session: Session | null) => {
				// Skip initial session event since we handle it above
				if (event === "INITIAL_SESSION") return;

				if (session?.user) {
					setUser(session.user);
					const profile = await fetchProfile(session.user.id);
					setProfile(profile);
				} else {
					setUser(null);
					setProfile(null);
				}
			},
		);

		return () => subscription.unsubscribe();
	}, [supabase, fetchProfile]);

	return (
		<AuthContext.Provider
			value={{ user, profile, loading, signOut, refreshProfile }}
		>
			{children}
		</AuthContext.Provider>
	);
}
