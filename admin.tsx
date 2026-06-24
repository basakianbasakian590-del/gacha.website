import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useListUsers, useCreateUser, useUpdateUser, useDeleteUser, useAdjustBalance,
  useListChests, useCreateChest, useUpdateChest, useDeleteChest,
  useListItems, useCreateItem, useUpdateItem, useDeleteItem,
  useGetGachaStats, useGetSettings, useUpdateSettings,
  getListUsersQueryKey, getListChestsQueryKey, getListItemsQueryKey,
  getGetGachaStatsQueryKey, getGetSettingsQueryKey,
  useLogout, getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Users, Package, Sparkles, Settings, BarChart3, Plus, Pencil, Trash2, Check, X,
  ShieldOff, Shield, Calendar, Loader2, LogOut, Crown, Star,
} from "lucide-react";
import { useLocation } from "wouter";

const TABS = [
  { id: "stats",    label: "Dashboard",  icon: BarChart3  },
  { id: "users",    label: "Member",     icon: Users      },
  { id: "chests",   label: "Chest",      icon: Package    },
  { id: "items",    label: "Item",       icon: Sparkles   },
  { id: "settings", label: "Pengaturan", icon: Settings   },
];

/* ───── Stats ─────────────────────────────────────────────────────────── */
function StatsTab() {
  const { data: s } = useGetGachaStats({ query: { queryKey: getGetGachaStatsQueryKey() } });
  if (!s) return <div className="text-muted-foreground font-mono text-sm text-center py-16 animate-pulse">Memuat...</div>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Pull", v: s.totalPulls.toLocaleString(), c: "text-primary", b: "border-primary/20" },
          { l: "Total Member", v: s.totalUsers.toLocaleString(), c: "text-secondary", b: "border-secondary/20" },
          { l: "Member Aktif", v: s.activeUsers.toLocaleString(), c: "text-green-400", b: "border-green-500/20" },
          { l: "Saldo Beredar", v: formatIDR(s.totalBalanceCirculating), c: "text-accent", b: "border-accent/20" },
        ].map((x, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
            className={`glass border ${x.b} rounded-xl p-4`}>
            <div className="text-muted-foreground font-mono text-xs mb-2">{x.l}</div>
            <div className={`text-2xl font-black ${x.c} text-glow`}>{x.v}</div>
          </motion.div>
        ))}
      </div>
      {s.topItems.length > 0 && (
        <div className="glass border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-black mb-3 text-sm">🏆 Top 5 Item Sering Keluar</h3>
          {s.topItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-accent font-black text-sm w-5">{i + 1}</span>
                <span className="text-white font-mono text-sm">{item.itemName}</span>
              </div>
              <span className="text-primary font-bold text-sm">{item.pullCount}x</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Users ─────────────────────────────────────────────────────────── */
function UsersTab() {
  const { data: users } = useListUsers({ query: { queryKey: getListUsersQueryKey() } });
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const adjustBalance = useAdjustBalance();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: "", password: "", balance: "0", expiresAt: "" });
  const [bf, setBf] = useState<Record<number, { amount: string; mode: string }>>({});

  const inv = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
  const F = (u: (p: typeof form) => typeof form) => setForm(f => u(f));

  const handleCreate = () => {
    createUser.mutate({ data: { username: form.username, password: form.password, role: "member", balance: Number(form.balance), expiresAt: form.expiresAt || null } }, {
      onSuccess: () => { inv(); setAdding(false); setForm({ username: "", password: "", balance: "0", expiresAt: "" }); toast({ title: "✓ Member dibuat" }); },
      onError: (e: any) => toast({ variant: "destructive", title: "Gagal", description: e?.data?.error ?? e?.message }),
    });
  };

  const toggleBlock = (id: number, blocked: boolean) =>
    updateUser.mutate({ id, data: { isBlocked: !blocked } }, { onSuccess: () => { inv(); toast({ title: blocked ? "Member di-unblock" : "Member diblokir" }); } });

  const handleDelete = (id: number) => {
    if (!confirm("Hapus member ini?")) return;
    deleteUser.mutate({ id }, { onSuccess: () => { inv(); toast({ title: "Member dihapus" }); } });
  };

  const handleAdjust = (id: number) => {
    const b = bf[id] || { amount: "0", mode: "add" };
    adjustBalance.mutate({ id, data: { amount: Number(b.amount), mode: b.mode as "add" | "set" } }, {
      onSuccess: () => { inv(); toast({ title: "✓ Saldo diupdate" }); },
      onError: (e: any) => toast({ variant: "destructive", title: "Gagal", description: e?.data?.error }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-black text-sm">MEMBER ({users?.length ?? 0})</h3>
        <Button onClick={() => setAdding(true)} size="sm" className="bg-primary text-black font-bold h-8 text-xs"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
      </div>

      {adding && (
        <div className="glass border border-primary/40 rounded-xl p-4 space-y-3">
          <h4 className="text-primary font-black text-sm">Buat Akun Baru</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Username", key: "username", type: "text" },
              { label: "Password", key: "password", type: "password" },
              { label: "Saldo Awal (IDR)", key: "balance", type: "number" },
              { label: "Expired (opsional)", key: "expiresAt", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">{f.label}</Label>
                <Input type={f.type} value={(form as any)[f.key]} onChange={e => F(p => ({ ...p, [f.key]: e.target.value }))}
                  className="glass border-white/15 text-white h-8 text-sm" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={createUser.isPending} size="sm" className="bg-primary text-black font-bold h-8">
              {createUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Buat</>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="h-8"><X className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {users?.map(u => (
          <div key={u.id} className={`glass border rounded-xl p-4 ${u.isBlocked ? "border-destructive/40" : "border-white/8"}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-black text-sm">{u.username}</span>
                  {u.role === "admin" && <span className="bg-accent/20 text-accent text-[9px] px-2 py-0.5 rounded-full font-black border border-accent/30">ADMIN</span>}
                  {u.isBlocked && <span className="bg-destructive/20 text-destructive text-[9px] px-2 py-0.5 rounded-full font-black border border-destructive/30">BLOKIR</span>}
                </div>
                <div className="text-primary font-bold text-sm mt-0.5">{formatIDR(u.balance)}</div>
                <div className="text-muted-foreground font-mono text-[10px] mt-0.5">
                  Expired: {u.expiresAt ? new Date(u.expiresAt).toLocaleDateString("id-ID") : "—"} · Attempts: {u.failedAttempts}/3
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => toggleBlock(u.id, u.isBlocked)} className="h-7 w-7 p-0" title={u.isBlocked ? "Unblock" : "Blokir"}>
                  {u.isBlocked ? <Shield className="w-3.5 h-3.5 text-green-400" /> : <ShieldOff className="w-3.5 h-3.5 text-destructive" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditId(editId === u.id ? null : u.id)} className="h-7 w-7 p-0">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)} className="h-7 w-7 p-0">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </div>

            {editId === u.id && (
              <div className="mb-3 pb-3 border-b border-white/8">
                <Label className="text-[10px] text-muted-foreground uppercase block mb-1">Ubah Tanggal Expired</Label>
                <div className="flex gap-2">
                  <Input type="date" defaultValue={u.expiresAt ? u.expiresAt.split("T")[0] : ""} id={`exp-${u.id}`}
                    className="glass border-white/15 text-white h-8 text-sm flex-1" />
                  <Button size="sm" onClick={() => {
                    const v = (document.getElementById(`exp-${u.id}`) as HTMLInputElement)?.value;
                    updateUser.mutate({ id: u.id, data: { expiresAt: v || null } }, { onSuccess: () => { inv(); setEditId(null); toast({ title: "✓ Expired diupdate" }); } });
                  }} className="bg-secondary text-white font-bold h-8 text-xs px-3">Simpan</Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 items-center">
              <select value={bf[u.id]?.mode ?? "add"} onChange={e => setBf(p => ({ ...p, [u.id]: { ...p[u.id], mode: e.target.value } }))}
                className="glass border border-white/15 text-white h-8 px-2 rounded-lg text-xs bg-transparent">
                <option value="add">+ Tambah</option><option value="set">= Set ke</option>
              </select>
              <Input type="number" placeholder="Jumlah IDR" value={bf[u.id]?.amount ?? ""}
                onChange={e => setBf(p => ({ ...p, [u.id]: { ...p[u.id], amount: e.target.value } }))}
                className="glass border-white/15 text-white h-8 text-xs flex-1" />
              <Button size="sm" onClick={() => handleAdjust(u.id)} className="bg-green-600 hover:bg-green-500 text-white font-bold h-8 px-3 text-xs whitespace-nowrap">
                Update Saldo
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── Chests ────────────────────────────────────────────────────────── */
function ChestsTab() {
  const { data: chests } = useListChests({ query: { queryKey: getListChestsQueryKey() } });
  const createChest = useCreateChest();
  const updateChest = useUpdateChest();
  const deleteChest = useDeleteChest();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", type: "basic" as "basic"|"rare"|"mythic", cost: "10000", imageUrl: "", active: true });

  const inv = () => qc.invalidateQueries({ queryKey: getListChestsQueryKey() });

  const handleCreate = () => {
    createChest.mutate({ data: { name: form.name, type: form.type, costPerPull: Number(form.cost), imageUrl: form.imageUrl || undefined, isActive: form.active } }, {
      onSuccess: () => { inv(); setAdding(false); setForm({ name: "", type: "basic", cost: "10000", imageUrl: "", active: true }); toast({ title: "✓ Chest dibuat" }); },
      onError: (e: any) => toast({ variant: "destructive", title: "Gagal", description: e?.data?.error }),
    });
  };

  const TypeIcon = { basic: Package, rare: Star, mythic: Crown };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-black text-sm">KELOLA CHEST ({chests?.length ?? 0})</h3>
        <Button onClick={() => setAdding(true)} size="sm" className="bg-primary text-black font-bold h-8 text-xs"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
      </div>

      {adding && (
        <div className="glass border border-primary/40 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Nama Chest</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="glass border-white/15 text-white h-8 text-sm" /></div>
            <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Tipe</Label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="w-full glass border border-white/15 text-white h-8 px-2 rounded-lg text-sm bg-transparent">
                <option value="basic">Basic</option><option value="rare">Rare</option><option value="mythic">Mythic</option>
              </select></div>
            <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Biaya/Pull (IDR)</Label>
              <Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="glass border-white/15 text-white h-8 text-sm" /></div>
            <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">URL Gambar</Label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="glass border-white/15 text-white h-8 text-sm" placeholder="https://..." /></div>
          </div>
          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />Aktif
          </label>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={createChest.isPending} size="sm" className="bg-primary text-black font-bold h-8">
              {createChest.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Buat</>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="h-8"><X className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {chests?.map(c => {
          const Icon = TypeIcon[c.type as keyof typeof TypeIcon] ?? Package;
          if (editId === c.id) {
            return (
              <EditChestInline key={c.id} chest={c}
                onSave={(d) => updateChest.mutate({ id: c.id, data: d }, { onSuccess: () => { inv(); setEditId(null); toast({ title: "✓ Chest diupdate" }); } })}
                onCancel={() => setEditId(null)} />
            );
          }
          return (
            <div key={c.id} className="glass border border-white/8 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <div className="text-white font-black text-sm">{c.name} <span className="text-muted-foreground text-[10px] uppercase">[{c.type}]</span></div>
                  <div className="text-primary font-mono text-xs">{formatIDR(c.costPerPull)}/pull · {c.itemCount} item · {c.isActive ? "✓ Aktif" : "✗ Nonaktif"}</div>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditId(c.id)} className="h-7 w-7 p-0"><Pencil className="w-3 h-3 text-secondary" /></Button>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm("Hapus chest?")) deleteChest.mutate({ id: c.id }, { onSuccess: inv }); }} className="h-7 w-7 p-0"><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditChestInline({ chest, onSave, onCancel }: { chest: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(chest.name);
  const [type, setType] = useState(chest.type);
  const [cost, setCost] = useState(String(chest.costPerPull));
  const [imageUrl, setImageUrl] = useState(chest.imageUrl ?? "");
  const [isActive, setIsActive] = useState(chest.isActive);
  return (
    <div className="glass border border-secondary/40 rounded-xl p-4 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-[10px] text-muted-foreground block mb-1">Nama</Label><Input value={name} onChange={e => setName(e.target.value)} className="glass border-white/15 text-white h-8 text-sm" /></div>
        <div><Label className="text-[10px] text-muted-foreground block mb-1">Tipe</Label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full glass border border-white/15 text-white h-8 px-2 rounded-lg text-sm bg-transparent">
            <option value="basic">Basic</option><option value="rare">Rare</option><option value="mythic">Mythic</option>
          </select></div>
        <div><Label className="text-[10px] text-muted-foreground block mb-1">Biaya/Pull</Label><Input type="number" value={cost} onChange={e => setCost(e.target.value)} className="glass border-white/15 text-white h-8 text-sm" /></div>
        <div><Label className="text-[10px] text-muted-foreground block mb-1">URL Gambar</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="glass border-white/15 text-white h-8 text-sm" /></div>
      </div>
      <label className="flex items-center gap-2 text-xs text-white cursor-pointer"><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />Aktif</label>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ name, type, costPerPull: Number(cost), imageUrl: imageUrl || undefined, isActive })} className="bg-primary text-black font-bold h-7 text-xs"><Check className="w-3 h-3 mr-1" />Simpan</Button>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7"><X className="w-3 h-3" /></Button>
      </div>
    </div>
  );
}

/* ───── Items ─────────────────────────────────────────────────────────── */
function ItemsTab() {
  const { data: chests } = useListChests({ query: { queryKey: getListChestsQueryKey() } });
  const [cid, setCid] = useState<number | null>(null);
  const { data: items } = useListItems({ chest_id: cid ?? undefined }, { query: { enabled: !!cid, queryKey: getListItemsQueryKey({ chest_id: cid ?? undefined }) } });
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", imageUrl: "", chance: "10", rarity: "common" as "common"|"rare"|"legendary" });

  const inv = () => cid && qc.invalidateQueries({ queryKey: getListItemsQueryKey({ chest_id: cid }) });

  const handleCreate = () => {
    if (!cid) return;
    createItem.mutate({ data: { chestId: cid, name: form.name, imageUrl: form.imageUrl || undefined, chance: Number(form.chance), rarity: form.rarity } }, {
      onSuccess: () => { inv(); setAdding(false); setForm({ name: "", imageUrl: "", chance: "10", rarity: "common" }); toast({ title: "✓ Item dibuat" }); },
      onError: (e: any) => toast({ variant: "destructive", title: "Gagal", description: e?.data?.error }),
    });
  };

  const rarityBadge: Record<string, string> = {
    common: "bg-white/10 text-white border-white/20",
    rare: "bg-primary/20 text-primary border-primary/30",
    legendary: "bg-accent/20 text-accent border-accent/30",
  };

  const totalChance = items?.reduce((s, i) => s + i.chance, 0) ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">Pilih Chest</Label>
        <select value={cid ?? ""} onChange={e => { setCid(e.target.value ? Number(e.target.value) : null); setAdding(false); setEditId(null); }}
          className="glass border border-white/15 text-white h-9 px-3 rounded-xl text-sm w-full max-w-sm bg-transparent">
          <option value="">— Pilih Chest —</option>
          {chests?.map(c => <option key={c.id} value={c.id}>{c.name} [{c.type}]</option>)}
        </select>
      </div>

      {cid && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white font-black text-sm">ITEM DALAM CHEST ({items?.length ?? 0})</h3>
              <div className="text-xs font-mono mt-0.5">
                <span className={`${totalChance > 100 ? "text-destructive" : totalChance === 100 ? "text-green-400" : "text-accent"}`}>
                  Total chance: {totalChance.toFixed(1)}%
                </span>
                {totalChance !== 100 && <span className="text-muted-foreground ml-2">(sebaiknya 100%)</span>}
              </div>
            </div>
            <Button onClick={() => setAdding(true)} size="sm" className="bg-primary text-black font-bold h-8 text-xs"><Plus className="w-3 h-3 mr-1" />Tambah</Button>
          </div>

          {adding && (
            <div className="glass border border-primary/40 rounded-xl p-4 space-y-3">
              <h4 className="text-primary font-black text-xs">Tambah Item Baru</h4>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Nama Item</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="glass border-white/15 text-white h-8 text-sm" /></div>
                <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">URL Gambar</Label>
                  <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="glass border-white/15 text-white h-8 text-sm" placeholder="https://..." /></div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Chance % (0-100)</Label>
                  <div className="flex gap-2 items-center">
                    <Input type="number" min="0" max="100" step="0.1" value={form.chance}
                      onChange={e => setForm(f => ({ ...f, chance: e.target.value }))} className="glass border-white/15 text-white h-8 text-sm flex-1" />
                    <span className="text-muted-foreground text-xs font-mono">%</span>
                  </div>
                </div>
                <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Rarity</Label>
                  <select value={form.rarity} onChange={e => setForm(f => ({ ...f, rarity: e.target.value as any }))}
                    className="w-full glass border border-white/15 text-white h-8 px-2 rounded-lg text-sm bg-transparent">
                    <option value="common">Common</option><option value="rare">Rare</option><option value="legendary">Legendary</option>
                  </select></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={createItem.isPending} size="sm" className="bg-primary text-black font-bold h-8">
                  {createItem.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Check className="w-3 h-3 mr-1" />Tambah</>}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setAdding(false)} className="h-8"><X className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {items?.map(item => {
              if (editId === item.id) {
                return (
                  <EditItemInline key={item.id} item={item}
                    onSave={(d) => updateItem.mutate({ id: item.id, data: d }, { onSuccess: () => { inv(); setEditId(null); toast({ title: "✓ Item diupdate" }); } })}
                    onCancel={() => setEditId(null)} />
                );
              }
              return (
                <div key={item.id} className="glass border border-white/8 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <Sparkles className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm truncate">{item.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${rarityBadge[item.rarity] ?? rarityBadge.common}`}>{item.rarity.toUpperCase()}</span>
                      <span className="text-primary font-mono text-xs font-bold">{item.chance}%</span>
                      {/* Visual chance bar */}
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-20">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(item.chance, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditId(item.id)} className="h-7 w-7 p-0"><Pencil className="w-3 h-3 text-secondary" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { if (confirm("Hapus item?")) deleteItem.mutate({ id: item.id }, { onSuccess: inv }); }} className="h-7 w-7 p-0"><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function EditItemInline({ item, onSave, onCancel }: { item: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(item.name);
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [chance, setChance] = useState(String(item.chance));
  const [rarity, setRarity] = useState(item.rarity);
  return (
    <div className="glass border border-secondary/40 rounded-xl p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-[10px] text-muted-foreground block mb-1">Nama</Label><Input value={name} onChange={e => setName(e.target.value)} className="glass border-white/15 text-white h-8 text-sm" /></div>
        <div><Label className="text-[10px] text-muted-foreground block mb-1">URL Gambar</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="glass border-white/15 text-white h-8 text-sm" /></div>
        <div>
          <Label className="text-[10px] text-muted-foreground block mb-1">Chance %</Label>
          <div className="flex gap-1 items-center">
            <Input type="number" min="0" max="100" step="0.1" value={chance} onChange={e => setChance(e.target.value)} className="glass border-white/15 text-white h-8 text-sm flex-1" />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div><Label className="text-[10px] text-muted-foreground block mb-1">Rarity</Label>
          <select value={rarity} onChange={e => setRarity(e.target.value)} className="w-full glass border border-white/15 text-white h-8 px-2 rounded-lg text-sm bg-transparent">
            <option value="common">Common</option><option value="rare">Rare</option><option value="legendary">Legendary</option>
          </select></div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ name, imageUrl: imageUrl || undefined, chance: Number(chance), rarity })} className="bg-primary text-black font-bold h-7 text-xs"><Check className="w-3 h-3 mr-1" />Simpan</Button>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7"><X className="w-3 h-3" /></Button>
      </div>
    </div>
  );
}

/* ───── Settings ──────────────────────────────────────────────────────── */
function SettingsTab() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const updateSettings = useUpdateSettings();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    siteName: "", renewalCostPerDay: "", primaryColor: "#00D4FF",
    maintenanceMode: false, bgType: "particles", bgValue: "",
    themeMode: "dark", musicUrl: "", customLabels: "{}",
  });
  const [inited, setInited] = useState(false);
  const [labelsText, setLabelsText] = useState("{}");
  const [labelsError, setLabelsError] = useState(false);

  if (settings && !inited) {
    setForm({
      siteName: settings.siteName,
      renewalCostPerDay: String(settings.renewalCostPerDay),
      primaryColor: settings.primaryColor,
      maintenanceMode: settings.maintenanceMode,
      bgType: (settings as any).bgType ?? "particles",
      bgValue: (settings as any).bgValue ?? "",
      themeMode: (settings as any).themeMode ?? "dark",
      musicUrl: (settings as any).musicUrl ?? "",
      customLabels: (settings as any).customLabels ?? "{}",
    });
    setLabelsText((settings as any).customLabels ?? "{}");
    setInited(true);
  }

  const F = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    let parsedLabels = "{}";
    try { JSON.parse(labelsText); parsedLabels = labelsText; setLabelsError(false); }
    catch { setLabelsError(true); toast({ variant: "destructive", title: "JSON Label tidak valid" }); return; }

    updateSettings.mutate({
      data: {
        siteName: form.siteName,
        renewalCostPerDay: Number(form.renewalCostPerDay),
        primaryColor: form.primaryColor,
        maintenanceMode: form.maintenanceMode,
        bgType: form.bgType as any,
        bgValue: form.bgValue,
        themeMode: form.themeMode as any,
        musicUrl: form.musicUrl,
        customLabels: parsedLabels,
      } as any
    }, {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getGetSettingsQueryKey() }); toast({ title: "✓ Pengaturan disimpan" }); },
      onError: () => toast({ variant: "destructive", title: "Gagal menyimpan" }),
    });
  };

  const EXAMPLE_LABELS = {
    welcomeMsg: "SELAMAT DATANG KEMBALI",
    gacha: "Gacha Terminal",
    gachaDesc: "Buka chest & dapatkan item",
    transfer: "Transfer Saldo",
    transferDesc: "Kirim saldo ke member lain",
    renew: "Perpanjang Akun",
    renewDesc: "Perpanjang masa berlaku",
    balanceLabel: "SALDO IDR",
    expiryLabel: "MASA BERLAKU",
    menuTitle: "// MENU UTAMA",
  };

  return (
    <div className="space-y-5 max-w-xl">
      {/* General */}
      <div className="glass border border-white/10 rounded-xl p-4 space-y-3">
        <h4 className="text-white font-black text-xs tracking-wider">⚙ UMUM</h4>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Nama Website</Label>
            <Input value={form.siteName} onChange={e => F("siteName", e.target.value)} className="glass border-white/15 text-white h-9" /></div>
          <div><Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Biaya Perpanjang/Hari</Label>
            <Input type="number" value={form.renewalCostPerDay} onChange={e => F("renewalCostPerDay", e.target.value)} className="glass border-white/15 text-white h-9" /></div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
            <input type="checkbox" checked={form.maintenanceMode} onChange={e => F("maintenanceMode", e.target.checked)} />
            Mode Maintenance
          </label>
        </div>
      </div>

      {/* Theme */}
      <div className="glass border border-white/10 rounded-xl p-4 space-y-3">
        <h4 className="text-white font-black text-xs tracking-wider">🎨 TEMA & TAMPILAN</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Mode Warna</Label>
            <div className="flex gap-2">
              {["dark", "light"].map(m => (
                <button key={m} onClick={() => F("themeMode", m)}
                  className={`flex-1 h-9 rounded-lg border font-bold text-xs capitalize transition-all ${form.themeMode === m ? "bg-primary text-black border-primary" : "border-white/20 text-muted-foreground hover:border-white/40"}`}>
                  {m === "dark" ? "🌙 Dark" : "☀️ Light"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Warna Primer</Label>
            <div className="flex gap-2">
              <Input value={form.primaryColor} onChange={e => F("primaryColor", e.target.value)} className="glass border-white/15 text-white h-9 flex-1 text-sm" placeholder="#00D4FF" />
              <input type="color" value={form.primaryColor} onChange={e => F("primaryColor", e.target.value)} className="h-9 w-10 rounded-lg cursor-pointer border border-white/20 bg-transparent" />
            </div>
          </div>
        </div>
        <div>
          <Label className="text-[10px] text-muted-foreground uppercase mb-1 block">Tipe Background</Label>
          <div className="flex gap-2 flex-wrap">
            {[
              { v: "particles", l: "✨ Partikel" },
              { v: "gradient", l: "🌈 Gradient" },
              { v: "image", l: "🖼 Gambar" },
              { v: "color", l: "🎨 Warna" },
            ].map(({ v, l }) => (
              <button key={v} onClick={() => F("bgType", v)}
                className={`px-3 h-8 rounded-lg border font-bold text-xs transition-all ${form.bgType === v ? "bg-secondary text-white border-secondary" : "border-white/20 text-muted-foreground hover:border-white/40"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {form.bgType !== "particles" && (
          <div>
            <Label className="text-[10px] text-muted-foreground uppercase mb-1 block">
              {form.bgType === "image" ? "URL Gambar Background" : form.bgType === "gradient" ? "CSS Gradient (contoh: linear-gradient(135deg,#00D4FF,#8B00FF))" : "Warna (hex/rgb)"}
            </Label>
            <Input value={form.bgValue} onChange={e => F("bgValue", e.target.value)} className="glass border-white/15 text-white h-9 text-sm"
              placeholder={form.bgType === "image" ? "https://..." : form.bgType === "gradient" ? "linear-gradient(...)" : "#0A0A1A"} />
          </div>
        )}
        <div>
          <Label className="text-[10px] text-muted-foreground uppercase mb-1 block">URL Musik Background (opsional)</Label>
          <Input value={form.musicUrl} onChange={e => F("musicUrl", e.target.value)} className="glass border-white/15 text-white h-9 text-sm" placeholder="https://..." />
        </div>
      </div>

      {/* Custom Labels */}
      <div className="glass border border-white/10 rounded-xl p-4 space-y-3">
        <h4 className="text-white font-black text-xs tracking-wider">✏ KUSTOM TEKS UI</h4>
        <p className="text-muted-foreground text-xs font-mono">Edit teks yang tampil di website. Format JSON.</p>
        <div className="glass border border-white/8 rounded-lg p-2 text-[10px] font-mono text-muted-foreground space-y-0.5">
          <div className="text-white/40 mb-1">// Contoh key yang tersedia:</div>
          {Object.entries(EXAMPLE_LABELS).map(([k, v]) => (
            <div key={k}><span className="text-primary">"{k}"</span>: <span className="text-accent">"{v}"</span></div>
          ))}
        </div>
        <textarea
          value={labelsText}
          onChange={e => setLabelsText(e.target.value)}
          rows={8}
          className={`w-full glass border rounded-lg p-3 text-white font-mono text-xs resize-none focus:outline-none focus:border-primary transition-colors ${labelsError ? "border-destructive" : "border-white/15"}`}
          placeholder='{"gacha": "Nama Gacha Kamu", "welcomeMsg": "HALO BRO"}'
          spellCheck={false}
        />
        {labelsError && <p className="text-destructive text-xs">JSON tidak valid. Periksa format!</p>}
      </div>

      <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full bg-primary text-black font-black h-11 tracking-wider glow-blue">
        {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "💾 SIMPAN SEMUA PENGATURAN"}
      </Button>
    </div>
  );
}

/* ───── Main ──────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("stats");
  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setUser(null);
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      }
    });
  };

  if (!user || user.role !== "admin") return null;

  const TabContent = { stats: StatsTab, users: UsersTab, chests: ChestsTab, items: ItemsTab, settings: SettingsTab }[activeTab];

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-20">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border border-secondary/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div className="text-muted-foreground font-mono text-xs tracking-widest mb-1">ADMIN CONTROL PANEL</div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">
            {user.username.toUpperCase()}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")} className="border-primary/50 text-primary hover:bg-primary hover:text-black font-bold h-8 text-xs">
            Dashboard
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout} className="font-bold h-8 text-xs">
            <LogOut className="w-3 h-3 mr-1" />LOGOUT
          </Button>
        </div>
      </motion.header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all shrink-0 ${
                activeTab === t.id ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "glass border border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              }`}>
              <Icon className="w-3.5 h-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      <div className="glass border border-white/8 rounded-2xl p-5 min-h-96">
        {TabContent && <TabContent />}
      </div>
    </div>
  );
}
