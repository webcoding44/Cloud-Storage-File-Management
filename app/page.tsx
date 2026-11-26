import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/src/auth/server";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main
          className="grid min-h-screen place-items-center text-sm text-zinc-500"
          aria-busy="true"
        >
          Loading...
        </main>
      }
    >
      <HomeRedirect />
    </Suspense>
  );
}

async function HomeRedirect() {
  const { data: session } = await getSession();
  redirect(session?.user ? "/dashboard" : "/signup");
  return null;
}
