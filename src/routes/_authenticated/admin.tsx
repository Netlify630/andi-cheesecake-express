import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeImageUrl, looksLikeImageUrl } from "@/lib/image-url";
import { isStoredPhoto, resolveFlavorPhoto, uploadFlavorPhoto } from "@/lib/flavor-photo";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import logoUrl from "@/assets/andielicious-logo.png";
import { Trash2, LogOut, Eye, Cookie, Mail, Star, Users, BarChart3 } from "lucide-react";
import { listSignInEvents, type SignInEvent } from "@/lib/admin.functions";
import { site } from "@/content/site";


export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard · Andielicious" },
      { name: "description", content: "Owner-only dashboard for Andielicious Cheesecake." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Flavor = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  category: "staple" | "weekly" | "vote_option";
  week_label: string | null;
  position: number;
  active: boolean;
  sold_out: boolean;
};

type Subscriber = { id: string; email: string; created_at: string };
type Review = { id: string; name: string; rating: number; comment: string; public_consent: boolean; created_at: string };

function AdminPage() {
  const navigate = useNavigate();
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [tab, setTab] = useState<"overview" | "flavors" | "votes" | "signins" | "subscribers" | "reviews">("overview");

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return navigate({ to: "/auth" });
      setEmail(userData.user.email ?? "");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setIsAdmin(admin);
      setCheckingRole(false);
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (checkingRole) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-3xl border border-border bg-card p-10 text-center">
          <h1 className="font-display text-3xl">Owner access only</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You're signed in as <strong>{email}</strong>, but this page is only for the shop owner.
            If this is your shop, sign in with <em>andieliciouscheesecake@gmail.com</em>.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={signOut}
              className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary"
            >
              Sign out
            </button>
            <a
              href="/"
              className="rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground"
            >
              Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <header className="border-b border-border bg-cream/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <img src={logoUrl} alt="" className="h-10 w-10 rounded-full ring-2 ring-berry/40" />
            <div className="leading-tight">
              <p className="font-display text-lg text-accent">Andielicious</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sage">Owner dashboard</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">{email}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-1">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "flavors", label: "Flavors", icon: Cookie },
            { id: "votes", label: "Votes", icon: BarChart3 },
            { id: "signins", label: "Sign-ins", icon: Users },
            { id: "subscribers", label: "Subscribers", icon: Mail },
            { id: "reviews", label: "Reviews", icon: Star },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`inline-flex items-center gap-2 rounded-t-lg px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  active ? "border-b-2 border-accent bg-background text-accent" : "text-muted-foreground hover:text-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {tab === "overview" && <OverviewTab />}
        {tab === "flavors" && <FlavorsTab />}
        {tab === "votes" && <VotesTab />}
        {tab === "signins" && <SignInsTab />}
        {tab === "subscribers" && <SubscribersTab />}
        {tab === "reviews" && <ReviewsTab />}
      </main>
    </div>
  );
}

// ---------------- Overview ----------------
function OverviewTab() {
  const [stats, setStats] = useState<{
    total: number;
    last7: number;
    last30: number;
    perPath: Array<{ path: string; count: number }>;
    loading: boolean;
  }>({ total: 0, last7: 0, last30: 0, perPath: [], loading: true });

  useEffect(() => {
    (async () => {
      const now = new Date();
      const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
      const [totalRes, last7Res, last30Res, pathsRes] = await Promise.all([
        supabase.from("page_views").select("*", { count: "exact", head: true }),
        supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", d7),
        supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", d30),
        supabase.from("page_views").select("path").gte("created_at", d30).limit(5000),
      ]);
      const tally: Record<string, number> = {};
      (pathsRes.data ?? []).forEach((r) => {
        tally[r.path] = (tally[r.path] ?? 0) + 1;
      });
      const perPath = Object.entries(tally)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count);
      setStats({
        total: totalRes.count ?? 0,
        last7: last7Res.count ?? 0,
        last30: last30Res.count ?? 0,
        perPath,
        loading: false,
      });
    })();
  }, []);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-3xl">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">Simple page-view counter for your site.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total visits" value={stats.loading ? "…" : stats.total} />
        <StatCard label="Last 7 days" value={stats.loading ? "…" : stats.last7} accent />
        <StatCard label="Last 30 days" value={stats.loading ? "…" : stats.last30} />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6">
        <h3 className="font-display text-xl">Top pages (last 30 days)</h3>
        {stats.loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : stats.perPath.length === 0 ? (
          <p className="mt-4 text-sm italic text-muted-foreground">No visits recorded yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {stats.perPath.slice(0, 10).map((r) => (
              <li key={r.path} className="flex items-center justify-between py-3 text-sm">
                <code className="text-muted-foreground">{r.path}</code>
                <span className="font-display text-lg">{r.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border p-6 ${accent ? "border-accent/40 bg-accent/5" : "border-border bg-card"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-5xl text-accent">{value}</p>
    </div>
  );
}

// ---------------- Flavors ----------------
function FlavorsTab() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Flavor | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("flavors")
      .select("*")
      .order("category", { ascending: true })
      .order("position", { ascending: true });
    if (error) toast.error(error.message);
    setFlavors((data as Flavor[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function toggleActive(f: Flavor) {
    const { error } = await supabase.from("flavors").update({ active: !f.active }).eq("id", f.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function toggleSoldOut(f: Flavor) {
    const { error } = await supabase.from("flavors").update({ sold_out: !f.sold_out }).eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success(!f.sold_out ? `${f.name} marked sold out` : `${f.name} back in stock`);
    load();
  }

  async function remove(f: Flavor) {
    if (!confirm(`Delete "${f.name}"?`)) return;
    const { error } = await supabase.from("flavors").delete().eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success("Flavor deleted");
    load();
  }

  const grouped = {
    staple: flavors.filter((f) => f.category === "staple"),
    weekly: flavors.filter((f) => f.category === "weekly"),
    vote_option: flavors.filter((f) => f.category === "vote_option"),
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl">Flavors</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Staples always show. Weekly is the rotating spotlight. Vote options are what people vote on.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground hover:bg-primary"
        >
          + New flavor
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {(["staple", "weekly", "vote_option"] as const).map((cat) => (
            <section key={cat} className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-xl capitalize">
                {cat === "vote_option" ? "Vote options" : cat === "weekly" ? "Flavor of the week" : "Staples"}
              </h3>
              <div className="mt-4 grid gap-3">
                {grouped[cat].length === 0 && (
                  <p className="text-sm italic text-muted-foreground">None yet.</p>
                )}
                {grouped[cat].map((f) => (
                  <div
                    key={f.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${
                      f.active ? "border-border bg-background" : "border-border bg-secondary/40 opacity-70"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-lg">{f.name}</p>
                        {f.category !== "vote_option" && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${
                              f.sold_out
                                ? "bg-ink/10 text-ink"
                                : "bg-sage/15 text-sage"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${f.sold_out ? "bg-berry" : "bg-sage"}`} />
                            {f.sold_out ? "Sold out" : "In stock"}
                          </span>
                        )}
                      </div>
                      {f.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {f.category !== "vote_option" && (
                        <button
                          onClick={() => toggleSoldOut(f)}
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                            f.sold_out
                              ? "bg-sage text-cream hover:bg-sage/90"
                              : "bg-berry text-cream hover:bg-berry/90"
                          }`}
                        >
                          {f.sold_out ? "Mark in stock" : "Mark sold out"}
                        </button>
                      )}

                      <button
                        onClick={() => toggleActive(f)}
                        className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest hover:bg-secondary"
                      >
                        {f.active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => setEditing(f)}
                        className="rounded-full bg-sage/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-sage hover:bg-sage/30"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(f)}
                        className="rounded-full border border-destructive/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {(editing || creating) && (
        <FlavorEditor
          flavor={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function FlavorEditor({
  flavor,
  onClose,
  onSaved,
}: {
  flavor: Flavor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !flavor;
  const [name, setName] = useState(flavor?.name ?? "");
  const [slug, setSlug] = useState(flavor?.slug ?? "");
  const [description, setDescription] = useState(flavor?.description ?? "");
  const [imageUrl, setImageUrl] = useState(flavor?.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Flavor["category"]>(flavor?.category ?? "staple");
  const [weekLabel, setWeekLabel] = useState(flavor?.week_label ?? "This week only");
  const [position, setPosition] = useState(flavor?.position ?? 0);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    let savedImageUrl = normalizeImageUrl(imageUrl) || null;
    if (imageFile) {
      try {
        savedImageUrl = await uploadFlavorPhoto(imageFile);
      } catch (error) {
        setBusy(false);
        toast.error(error instanceof Error ? error.message : "Photo upload failed");
        return;
      }
    }
    const payload = {
      name: name.trim(),
      slug: (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: description.trim(),
      image_url: savedImageUrl,
      category,
      week_label: category === "weekly" ? weekLabel.trim() || null : null,
      position: Number(position) || 0,
    };
    const { error } = isNew
      ? await supabase.from("flavors").insert(payload)
      : await supabase.from("flavors").update(payload).eq("id", flavor!.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Flavor created" : "Flavor updated");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[90vh] w-full max-w-lg gap-4 overflow-y-auto rounded-3xl bg-card p-8"
      >
        <h3 className="font-display text-2xl">{isNew ? "New flavor" : "Edit flavor"}</h3>

        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value as Flavor["category"])} className={inputCls}>
            <option value="staple">Staple (always on menu)</option>
            <option value="weekly">Flavor of the week</option>
            <option value="vote_option">Vote option</option>
          </select>
        </Field>
        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
        </Field>
        <Field label="Upload a photo">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (file && file.size > 10 * 1024 * 1024) {
                toast.error("Please choose an image smaller than 10 MB.");
                e.currentTarget.value = "";
                setImageFile(null);
                return;
              }
              setImageFile(file);
            }}
            className="block w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold"
          />
          {imageFile ? (
            <div className="mt-2 flex items-center gap-3">
              <img src={URL.createObjectURL(imageFile)} alt="Selected flavor preview" className="h-16 w-16 rounded-lg border border-border object-cover" />
              <p className="text-xs text-muted-foreground">This photo will be uploaded when you save.</p>
            </div>
          ) : isStoredPhoto(imageUrl) ? (
            <StoredPhotoPreview value={imageUrl} />
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Choose a JPG, PNG, WEBP, or GIF up to 10 MB.</p>
          )}
        </Field>
        <Field label="Or paste an image URL (optional)">
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" className={inputCls} />
          <ImageUrlPreview value={imageUrl} />
        </Field>
        {category === "weekly" && (
          <Field label='Week label (e.g. "This week only")'>
            <input value={weekLabel} onChange={(e) => setWeekLabel(e.target.value)} className={inputCls} />
          </Field>
        )}
        <Field label="Sort order (lower = first)">
          <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} className={inputCls} />
        </Field>
        {isNew && (
          <Field label="Slug (auto if empty)">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="classic-vanilla" className={inputCls} />
          </Field>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-widest">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

// ---------------- Subscribers ----------------
function SubscribersTab() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setSubs((data as Subscriber[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(s: Subscriber) {
    if (!confirm(`Remove ${s.email}?`)) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    load();
  }

  function exportCsv() {
    const rows = [["email", "subscribed_at"], ...subs.map((s) => [s.email, s.created_at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `andielicious-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyAll() {
    const emails = subs.map((s) => s.email).join(", ");
    navigator.clipboard.writeText(emails);
    toast.success("Copied all emails to clipboard");
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Newsletter subscribers</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Export the list to send from Mailchimp, Brevo, or your own email app. Bulk newsletter sending
            isn't wired directly into the site — this keeps your list clean and out of spam folders.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyAll}
            disabled={subs.length === 0}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary disabled:opacity-40"
          >
            Copy all
          </button>
          <button
            onClick={exportCsv}
            disabled={subs.length === 0}
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-accent-foreground disabled:opacity-40"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : subs.length === 0 ? (
          <p className="p-6 text-sm italic text-muted-foreground">No subscribers yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm">{s.email}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => remove(s)}
                  className="rounded-full border border-destructive/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-destructive hover:bg-destructive/10"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------------- Reviews ----------------
function ReviewsTab() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    // Admins can see all reviews via public policy (public_consent=true) — private ones
    // require a broader admin policy; we surface only what's readable to keep this scoped.
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Review[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const okToShare = items.filter((r) => r.public_consent).length;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-3xl">Reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every review lands here. The badge shows who ticked the "okay to share publicly" box —
          only those are safe to feature on the site or socials.
        </p>
        {!loading && items.length > 0 && (
          <p className="mt-3 inline-flex rounded-full bg-sage/15 px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-sage">
            {okToShare} of {items.length} okay to share publicly
          </p>
        )}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg">{r.name}</p>
                <span className="text-xs text-accent">{"★".repeat(r.rating)}</span>
              </div>
              <p className="mt-2 text-sm italic text-muted-foreground">"{r.comment}"</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-widest ${
                    r.public_consent ? "bg-sage/15 text-sage" : "bg-ink/10 text-ink"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${r.public_consent ? "bg-sage" : "bg-berry"}`} />
                  {r.public_consent ? "Okay to share publicly" : "Private — do not share"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Sign-ins ----------------
function SignInsTab() {
  const [events, setEvents] = useState<SignInEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSignInEvents({ data: { days: 45 } })
      .then((rows) => setEvents(rows))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Couldn't load sign-ins."))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-display text-3xl">Sign-ins</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Every sign-in from the past 45 days, newest first. If someone signs in more than once,
          each time is listed separately.
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-card">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="p-6 text-sm text-destructive">{error}</p>
        ) : events.length === 0 ? (
          <p className="p-6 text-sm italic text-muted-foreground">No sign-ins recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {events.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm">{e.email}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    via {e.provider}
                  </p>
                </div>
                <span className="text-right text-[11px] text-muted-foreground">
                  <span className="block text-[10px] uppercase tracking-widest">Signed in</span>
                  {fmt(e.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}



// ---------------- Votes (permanent monthly archive) ----------------
type VoteRow = { flavor_slug: string; created_at: string };

function VotesTab() {
  const [rows, setRows] = useState<VoteRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: votes }, { data: flavors }] = await Promise.all([
        supabase.from("flavor_votes").select("flavor_slug, created_at").order("created_at", { ascending: false }),
        supabase.from("flavors").select("slug, name"),
      ]);
      const map: Record<string, string> = {};
      site.voteFlavors.forEach((f) => (map[f.slug] = f.label));
      (flavors ?? []).forEach((f: { slug: string; name: string }) => (map[f.slug] = f.name));
      setNames(map);
      setRows((votes ?? []) as VoteRow[]);
      setLoading(false);
    })();
  }, []);

  // Group by calendar month — nothing is ever deleted here.
  const months = new Map<string, { label: string; total: number; tally: Record<string, number> }>();
  rows.forEach((r) => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    const entry = months.get(key) ?? { label, total: 0, tally: {} };
    entry.total += 1;
    entry.tally[r.flavor_slug] = (entry.tally[r.flavor_slug] ?? 0) + 1;
    months.set(key, entry);
  });
  const ordered = [...months.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));

  if (loading) return <p className="text-sm text-muted-foreground">Loading votes…</p>;

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Every month's results are kept here forever. Neighbors get a fresh vote at the
        start of each new month — this archive is never reset.
      </p>

      {ordered.length === 0 && <p className="text-sm text-muted-foreground">No votes yet.</p>}

      {ordered.map(([key, m]) => {
        const sorted = Object.entries(m.tally).sort((a, b) => b[1] - a[1]);
        return (
          <section key={key} className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl text-accent">{m.label} votes</h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {m.total} {m.total === 1 ? "vote" : "votes"}
              </span>
            </div>
            <ul className="space-y-3">
              {sorted.map(([slug, count], i) => {
                const pct = m.total ? Math.round((count / m.total) * 100) : 0;
                return (
                  <li key={slug}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {i === 0 && "🏆 "}
                        {names[slug] ?? slug}
                      </span>
                      <span className="text-muted-foreground">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function StoredPhotoPreview({ value }: { value: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    resolveFlavorPhoto(value).then((resolved) => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [value]);

  return url ? (
    <div className="mt-2 flex items-center gap-3">
      <img src={url} alt="Current flavor photo" className="h-16 w-16 rounded-lg border border-border object-cover" />
      <p className="text-xs text-muted-foreground">Current uploaded photo. Choose a new file to replace it.</p>
    </div>
  ) : (
    <p className="mt-2 text-xs text-muted-foreground">Current uploaded photo is being loaded…</p>
  );
}

function ImageUrlPreview({ value }: { value: string }) {
  const url = normalizeImageUrl(value);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  useEffect(() => {
    setStatus("idle");
  }, [url]);

  if (!url) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Paste a direct link to an image file (ends in .jpg, .png, .webp). Leave blank to use the default photo.
      </p>
    );
  }

  if (!looksLikeImageUrl(url)) {
    return (
      <p className="mt-2 text-xs font-medium text-destructive">
        That link points to a web page, not an image file. Open the photo itself, right-click it, and choose
        “Copy image address”.
      </p>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-3">
      <img
        src={url}
        alt="Preview"
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
        className="h-16 w-16 rounded-lg border border-border object-cover"
      />
      <p className={`text-xs ${status === "error" ? "font-medium text-destructive" : "text-muted-foreground"}`}>
        {status === "ok"
          ? "Looks good — this photo will show on the website."
          : status === "error"
            ? "This link won’t load as an image (it may be private or blocked). Try uploading the photo somewhere public and pasting that link."
            : "Checking the link…"}
      </p>
    </div>
  );
}
