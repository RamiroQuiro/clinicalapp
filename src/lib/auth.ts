import db from "@/db";
import { sessions, users } from "@/db/schema";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

const adapter = new DrizzleSQLiteAdapter(db,sessions,users); // your adapter

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: import.meta.env.PROD
		}
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
	}
}