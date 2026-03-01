import {
	type AppUserRow,
	getSupabaseAdmin,
	isSupabaseConfigured,
	toLegacyUser,
} from "../../_shared/supabase";

type RouteContext = {
	params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
	if (!isSupabaseConfigured()) {
		return Response.json(
			{
				error:
					"Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
			},
			{ status: 503 },
		);
	}

	try {
		const { id } = await context.params;
		const userId = String(id ?? "");
		if (!userId) {
			return Response.json({ error: "user id is required." }, { status: 400 });
		}

		const supabase = getSupabaseAdmin();
		const { data: user, error: userError } = await supabase
			.from("app_users")
			.select("id,is_read_only")
			.eq("id", userId)
			.maybeSingle();
		if (userError) throw userError;
		if (!user) {
			return Response.json({ error: "User not found." }, { status: 404 });
		}
		if (user.is_read_only) {
			return Response.json(
				{ error: "このユーザーは削除できません。" },
				{ status: 400 },
			);
		}

		const { error: deleteDecksError } = await supabase
			.from("decks")
			.delete()
			.eq("owner_id", userId);
		if (deleteDecksError) throw deleteDecksError;

		const { error: deleteUserError } = await supabase
			.from("app_users")
			.delete()
			.eq("id", userId);
		if (deleteUserError) throw deleteUserError;

		const { data: users, error: usersError } = await supabase
			.from("app_users")
			.select("*")
			.order("created_at", { ascending: true });
		if (usersError) throw usersError;

		return Response.json((users as AppUserRow[]).map(toLegacyUser));
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to delete user.";
		return Response.json({ error: message }, { status: 500 });
	}
}
