"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { authClient } from "@/src/auth/client";
import { cn } from "@/lib/cn";

interface AccountMenuProps {
  userName: string;
  userEmail: string;
  userImage?: string | null;
}

export function AccountMenu({ userName, userEmail, userImage }: AccountMenuProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userName);
  const [image, setImage] = useState(userImage || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  async function selectProfileImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file to use as your profile photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Choose an image smaller than 10 MB.");
      return;
    }
    setMessage("");
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image preview is unavailable.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      setImage(canvas.toDataURL("image/jpeg", 0.82));
    } catch {
      setMessage("We could not read that image. Try another photo.");
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);
    try {
      const result = await authClient.updateUser({ name: name.trim(), image: image || null });
      if (result.error) {
        setMessage(result.error.message || "Could not update your profile.");
        return;
      }
      setEditing(false);
      setMenuOpen(false);
      router.refresh();
    } catch {
      setMessage("Could not update your profile. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <div ref={accountRef} className="relative z-50">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => { setMenuOpen((value) => !value); setEditing(false); }}
        className="flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 motion-reduce:transform-none motion-reduce:transition-none"
      >
        <Avatar name={userName} image={userImage} className="size-8 text-[10px]" />
        <span className="hidden max-w-32 truncate text-sm font-semibold text-zinc-700 sm:block">{userName}</span>
        <ChevronDown className={cn("size-4 text-zinc-400 transition-transform duration-200", menuOpen && "rotate-180")} />
      </button>

      {menuOpen && (
        <div className="account-menu-panel absolute right-0 top-[calc(100%+10px)] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 text-zinc-800 shadow-xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
          {editing ? (
            <form onSubmit={saveProfile} className="space-y-3 p-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Account profile</span>
                <button type="button" aria-label="Close profile editor" onClick={() => { setEditing(false); setMessage(""); }} className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"><X className="size-4" /></button>
              </div>
              <div className="flex items-center gap-3 py-1">
                <Avatar name={name || userName} image={image} className="size-14 text-base" />
                <div className="min-w-0 flex-1">
                  <label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-xs font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                    Change photo
                    <input className="sr-only" type="file" accept="image/*" onChange={(event) => void selectProfileImage(event.target.files?.[0])} />
                  </label>
                  {image && <button type="button" onClick={() => setImage("")} className="ml-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Remove</button>}
                  <p className="mt-1 text-[11px] text-zinc-500">JPG, PNG or WEBP · up to 10 MB</p>
                </div>
              </div>
              <label className="block text-xs text-zinc-500">Username
                <input autoFocus required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-brand-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
              </label>
              {message && <p role="alert" className="text-xs text-rose-500">{message}</p>}
              <button disabled={pending} className="h-9 w-full rounded-lg bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-60">{pending ? "Saving…" : "Save changes"}</button>
            </form>
          ) : (
            <>
              <div className="border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
                <p className="truncate text-sm font-semibold">{userName}</p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">{userEmail}</p>
              </div>
              <button type="button" onClick={() => { setName(userName); setImage(userImage || ""); setEditing(true); setMessage(""); }} className="mt-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <UserRound className="size-4 text-zinc-500" /> Edit profile
              </button>
              <button type="button" onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10">
                <LogOut className="size-4" /> Log out
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
