"use client";

import type { User } from "@supabase/supabase-js";
import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
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
	signOut: async () => { },
	refreshProfile: async () => { },
});

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	const supabase = createClient();

	const fetchProfile = useCallback(
		async (userId: string) => {
			const { data } = await supabase
				.from("users")
				.select("*")
				.eq("id", userId)
				.single();

			setProfile(data);
		},
		[supabase],
	);

	const refreshProfile = useCallback(async () => {
		if (user) {
			await fetchProfile(user.id);
		}
	}, [user, fetchProfile]);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		setUser(null);
		setProfile(null);
	}, [supabase]);

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				fetchProfile(session.user.id);
			}
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				await fetchProfile(session.user.id);
			} else {
				setProfile(null);
			}
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, [fetchProfile, supabase]);

	return (
		<AuthContext.Provider
			value={{
				user,
				profile,
				loading,
				signOut,
				refreshProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
