import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useListChests,
  useListItems,
  usePullGacha,
  useListGachaHistory,
  getListGachaHistoryQueryKey,
  getGetMeQueryKey,
  getListItemsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Sparkles, Star, Crown, ChevronRight, Clock, Loader2, Zap, X } from "lucide-react";
import { Link } from "wouter";

const RARITY = {
  common:    { label: "COMMON",    color: "text-white",   border: "border-white/30",   glow: "",            bg: "bg-white/10",   shine: "#ffffff" },
  rare:      { label: "RARE",      color: "text-primary",  border: "border-primary",    glow: "glow-blue",   bg: "bg-primary/20", shine: "#00D4FF" },
  legendary: { label: "LEGENDARY", color: "text-accent",   border: "border-accent",     glow: "glow-yellow", bg: "bg-accent/20",  shine: "#FFD700" },
};

const CHEST_CFG = {
  basic:  { label: "BASIC",  icon: Package, clr: "text-white",   border: "border-white/20",  glow: "",            accent: "#cccccc", gradient: "from-white/5 to-white/10" },
  rare:   { label: "RARE",   icon: Star,    clr: "text-primary",  border: "border-primary/60", glow: "glow-blue",   accent: "#00D4FF", gradient: "from-primary/10 to-primary/5" },
  mythic: { label: "MYTHIC", icon: Crown,   clr: "text-accent",   border: "border-accent/60",  glow: "glow-yellow", accent: "#FFD700", gradient: "from-accent/10 to-accent/5" },
};

function Particle({ x, y, color, angle }: { x: number; y: number; color: string; angle: number }) {
  const dist = 80 + Math.random() * 80;
  const tx = Math.cos(angle) * dist;
  const ty = Math.sin(angle) * dist;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full pointer-events-none"
      style={{ left: x - 4, top: y - 4, background: color }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
      transition={{ duration: 0.8 + Math.random() * 0.4, ease: "easeOut" }}
    />
  );
}

function GachaResultModal({ result, onClose }: { result: any; onClose: () => void }) {
  const rarity = result.item.rarity as keyof typeof RARITY;
  const r = RARITY[rarity] || RARITY.common;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * Math.PI * 2,
    color: r.shine,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      >
        {/* Burst particles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {particles.map((p, i) => (
            <Particle key={i} x={0} y={0} color={p.color} angle={p.angle} />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.1, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0.5 }}
          className={`relative w-full max-w-sm mx-4 ${r.bg} border-2 ${r.border} rounded-3xl p-8 text-center ${r.glow}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Rotating shine ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${r.shine}33 25%, transparent 50%, ${r.shine}22 75%, transparent 100%)`,
            }}
          />

          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.7 }}
            className={`w-36 h-36 mx-auto mb-5 rounded-2xl ${r.bg} border-2 ${r.border} flex items-center justify-center overflow-hidden relative`}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {result.item.imageUrl ? (
                <img src={result.item.imageUrl} alt={result.item.name} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className={`w-16 h-16 ${r.color}`} />
              )}
            </motion.div>
          </motion.div>

          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-widest mb-3 ${r.bg} ${r.color} border ${r.border} ${r.glow}`}
            >
              ✦ {r.label} ✦
            </motion.span>
            <h2 className={`text-3xl font-black mb-2 ${r.color} text-glow`}>{result.item.name}</h2>
            <p className="text-white/50 font-mono text-sm mb-1">dari {result.chest.name}</p>
            <p className="text-white/30 font-mono text-xs mb-6">Saldo: {formatIDR(result.remainingBalance)}</p>
            <Button onClick={onClose} className="w-full h-12 font-black tracking-wider text-black bg-primary hover:bg-primary/90 glow-blue">
              CLAIM ITEM ✓
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PullingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
    >
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.15, 1] }}
        transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" }, scale: { duration: 0.6, repeat: Infinity } }}
        className="w-24 h-24 rounded-full border-4 border-t-primary border-r-secondary border-b-accent border-l-transparent mb-6"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="text-primary font-black text-xl tracking-widest"
      >
        MEMBUKA...
      </motion.div>
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function GachaPage() {
  const { user, setUser } = useAuth();
  const { data: chests, isLoading: chestsLoading } = useListChests();
  const [selectedChestId, setSelectedChestId] = useState<number | null>(null);
  const [pullResult, setPullResult] = useState<any>(null);
  const [isPulling, setIsPulling] = useState(false);
  const { data: history } = useListGachaHistory();
  const pullMutation = usePullGacha();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: items } = useListItems(
    { chest_id: selectedChestId ?? undefined },
    { query: { enabled: !!selectedChestId, queryKey: getListItemsQueryKey({ chest_id: selectedChestId ?? undefined }) } }
  );

  const activeChests = chests?.filter(c => c.isActive) ?? [];

  const handlePull = (chestId: number) => {
    const chest = chests?.find(c => c.id === chestId);
    if (!chest || !user) return;
    if ((user.balance ?? 0) < chest.costPerPull) {
      toast({ variant: "destructive", title: "Saldo Tidak Cukup", description: `Butuh ${formatIDR(chest.costPerPull)}, saldo kamu ${formatIDR(user.balance ?? 0)}` });
      return;
    }
    setIsPulling(true);
    pullMutation.mutate({ data: { chestId } }, {
      onSuccess: (result) => {
        setIsPulling(false);
        setPullResult(result);
        // Update user balance directly from pull result
        if (user && result.remainingBalance !== undefined) {
          setUser({ ...user, balance: result.remainingBalance });
        }
        qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        qc.invalidateQueries({ queryKey: getListGachaHistoryQueryKey() });
      },
      onError: (err: any) => {
        setIsPulling(false);
        const msg = err?.data?.error ?? err?.message ?? "Pull gagal, coba lagi";
        toast({ variant: "destructive", title: "Gagal Pull", description: msg });
      }
    });
  };

  if (chestsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-primary border-r-secondary border-b-accent border-l-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AnimatePresence>{isPulling && <PullingOverlay />}</AnimatePresence>
      {pullResult && <GachaResultModal result={pullResult} onClose={() => setPullResult(null)} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-muted-foreground hover:text-white h-10 w-10 p-0 rounded-xl border border-white/10 hover:border-white/30">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent via-primary to-secondary">
            ⚡ GACHA TERMINAL
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-xs text-muted-foreground">SALDO KAMU:</span>
            <span className="font-black text-primary text-sm">{formatIDR(user?.balance ?? 0)}</span>
          </div>
        </div>
      </div>

      {/* Chests */}
      {activeChests.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-mono">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Belum ada chest tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeChests.map((chest, i) => {
            const cfg = CHEST_CFG[chest.type as keyof typeof CHEST_CFG] ?? CHEST_CFG.basic;
            const Icon = cfg.icon;
            const canAfford = (user?.balance ?? 0) >= chest.costPerPull;
            const isSelected = selectedChestId === chest.id;

            return (
              <motion.div
                key={chest.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.12, type: "spring", bounce: 0.3 }}
                className={`relative bg-gradient-to-b ${cfg.gradient} border-2 ${isSelected ? cfg.border : "border-white/10"} rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${isSelected ? cfg.glow : ""} group`}
                onClick={() => setSelectedChestId(isSelected ? null : chest.id)}
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative p-5 flex flex-col h-full">
                  {/* Chest header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-black/40 border ${cfg.border} flex items-center justify-center overflow-hidden shrink-0`}>
                      {chest.imageUrl ? (
                        <img src={chest.imageUrl} alt={chest.name} className="w-full h-full object-cover" />
                      ) : (
                        <motion.div
                          animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                        >
                          <Icon className={`w-8 h-8 ${cfg.clr}`} />
                        </motion.div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[10px] font-black tracking-widest ${cfg.clr} opacity-60`}>✦ {cfg.label} CHEST</div>
                      <div className="text-white font-black text-lg leading-tight truncate">{chest.name}</div>
                      <div className="text-white/40 font-mono text-xs">{chest.itemCount} item</div>
                    </div>
                  </div>

                  {/* Price + button */}
                  <div className="mt-auto">
                    <div className={`text-3xl font-black mb-3 ${cfg.clr}`}>
                      {formatIDR(chest.costPerPull)}
                      <span className="text-sm font-normal text-white/40 ml-1">/pull</span>
                    </div>
                    <Button
                      className={`w-full h-11 font-black tracking-widest text-sm transition-all ${canAfford ? cfg.glow : "opacity-40 cursor-not-allowed"}`}
                      style={{ background: canAfford ? cfg.accent : undefined, color: "#000" }}
                      onClick={(e) => { e.stopPropagation(); handlePull(chest.id); }}
                      disabled={!canAfford || isPulling}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      {canAfford ? "BUKA CHEST" : "SALDO KURANG"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Item list for selected chest */}
      <AnimatePresence>
        {selectedChestId && items && items.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-accent" />
                <h3 className="text-white font-black text-sm tracking-wider">DAFTAR ITEM DALAM CHEST</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map(item => {
                  const r = RARITY[item.rarity as keyof typeof RARITY] ?? RARITY.common;
                  return (
                    <div key={item.id} className={`${r.bg} border ${r.border} rounded-xl p-3 flex flex-col items-center text-center ${r.glow} group hover:scale-105 transition-transform`}>
                      <div className={`w-12 h-12 rounded-lg ${r.bg} border ${r.border} flex items-center justify-center mb-2 overflow-hidden`}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Sparkles className={`w-6 h-6 ${r.color}`} />
                        )}
                      </div>
                      <div className="text-white font-bold text-xs mb-1 leading-tight">{item.name}</div>
                      <div className={`text-[10px] font-mono ${r.color}`}>{item.chance}%</div>
                      <div className={`text-[9px] font-bold tracking-widest ${r.color} opacity-70 mt-0.5`}>{r.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history && history.length > 0 && (
        <div className="glass border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-white font-black text-sm tracking-wider">RIWAYAT PULL KAMU</h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {history.map((h, idx) => {
              const r = RARITY[h.itemRarity as keyof typeof RARITY] ?? RARITY.common;
              return (
                <motion.div
                  key={h.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${r.bg} border ${r.border} flex items-center justify-center overflow-hidden shrink-0`}>
                      {h.itemImageUrl ? (
                        <img src={h.itemImageUrl} alt={h.itemName} className="w-full h-full object-cover" />
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${r.color}`} />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{h.itemName}</div>
                      <div className="text-muted-foreground font-mono text-xs">{h.chestName}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-black ${r.color} ${r.glow}`}>{r.label}</div>
                    <div className="text-muted-foreground font-mono text-[10px] mt-0.5">
                      {new Date(h.pulledAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
