import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl) {
  throw new Error("NEON_AUTH_BASE_URL is required to initialize Neon Auth.");
}

if (!cookieSecret) {
  throw new Error("NEON_AUTH_COOKIE_SECRET is required to initialize Neon Auth.");
}

if (cookieSecret.length < 32) {
  throw new Error("NEON_AUTH_COOKIE_SECRET must be at least 32 characters long.");
}

export const auth = createNeonAuth({
  baseUrl,
  cookies: { secret: cookieSecret },
});

export async function getSession() {
  "use cache: private";
  return auth.getSession();
}

export async function getAuthenticatedUser() {
  const { data: session, error } = await auth.getSession();

  if (error) {
    return {
      user: null,
      response: Response.json(
        { error: "Unable to verify your session. Please try again." },
        { status: 503 },
      ),
    } as const;
  }

  if (!session?.user) {
    return {
      user: null,
      response: Response.json({ error: "Sign in to manage your files." }, { status: 401 }),
    } as const;
  }

  return { user: session.user, response: null } as const;
}
