"use client";

import { useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PRIMARY_NAV, isNavItemActive } from "@/constants/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { authClient } from "@/src/auth/client";
import { Brand } from "./Brand";
import { SidebarNavItem } from "./SidebarNavItem";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userImage?: string | null;
}

export function Sidebar({ open, onClose, userName, userEmail, userImage }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(userName);
  const [image, setImage] = useState(userImage || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

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
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] shrink-0 flex-col bg-sidebar px-4 py-6 transition-transform duration-200",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Brand />

        <nav aria-label="Main navigation" className="mt-10 flex flex-1 flex-col gap-1.5">
          {PRIMARY_NAV.map((item) => (
            <SidebarNavItem key={item.href} item={item} active={isNavItemActive(item, pathname)} onNavigate={onClose} />
          ))}
        </nav>

        <div className="relative mt-auto border-t border-white/10 pt-4">
          {menuOpen && (
            <div className="absolute inset-x-0 bottom-[calc(100%+12px)] z-[60] overflow-hidden rounded-xl border border-white/10 bg-[#222229] p-2 shadow-2xl shadow-black/40">
              {editing ? (
                <form onSubmit={saveProfile} className="space-y-3 p-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-white">
                    <span>Account profile</span>
                    <button type="button" aria-label="Close profile editor" onClick={() => { setEditing(false); setMessage(""); }} className="rounded-md p-1 text-zinc-400 hover:bg-white/10 hover:text-white"><X className="size-4" /></button>
                  </div>
                  <div className="flex items-center gap-3 py-1">
                    <Avatar name={name || userName} image={image} className="size-14 text-base" />
                    <div className="min-w-0 flex-1">
                      <label className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-200 transition hover:bg-white/5">
                        Change photo
                        <input className="sr-only" type="file" accept="image/*" onChange={(event) => void selectProfileImage(event.target.files?.[0])} />
                      </label>
                      {image && <button type="button" onClick={() => setImage("")} className="ml-2 text-xs text-zinc-400 hover:text-white">Remove</button>}
                      <p className="mt-1 text-[11px] text-zinc-500">JPG, PNG or WEBP · up to 10 MB</p>
                    </div>
                  </div>
                  <label className="block text-xs text-zinc-400">Username
                    <input autoFocus required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-brand-400" />
                  </label>
                  {message && <p role="alert" className="text-xs text-rose-300">{message}</p>}
                  <button disabled={pending} className="h-9 w-full rounded-lg bg-brand-600 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60">{pending ? "Saving…" : "Save changes"}</button>
                </form>
              ) : (
                <>
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-white">{userName}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-400">{userEmail}</p>
                  </div>
                  <button type="button" onClick={() => { setName(userName); setImage(userImage || ""); setEditing(true); setMessage(""); }} className="mt-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-zinc-200 hover:bg-white/5">
                    <UserRound className="size-4 text-zinc-400" /> Edit profile
                  </button>
                  <button type="button" onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-rose-300 hover:bg-rose-500/10">
                    <LogOut className="size-4" /> Log out
                  </button>
                </>
              )}
            </div>
          )}
          <button type="button" aria-expanded={menuOpen} onClick={() => { setMenuOpen((value) => !value); setEditing(false); }} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.07]">
            <Avatar name={userName} image={userImage} className="size-10 text-xs" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{userName}</span>
              <span className="block truncate text-xs text-zinc-400">{userEmail}</span>
            </span>
            <ChevronDown className={cn("size-4 text-zinc-400 transition-transform", menuOpen && "rotate-180")} />
          </button>
        </div>
      </aside>
    </>
  );
}
