import { useAuth } from "@/hooks/use-auth";
import { useGetSettings, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { LogOut, Wallet, CalendarClock, ArrowRight, Settings, Package, Send, RefreshCcw } from "lucide-react";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";

function parseLabels(raw?: string): Record<string, string> {
  try { return JSON.parse(raw ?? "{}"); } catch { return {}; }
}

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const { data: settings } = useGetSettings();
  const labels = parseLabels(settings?.customLabels);
  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setUser(null);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      }
    });
  };

  const daysRemaining = user.expiresAt
    ? differenceInDays(new Date(user.expiresAt), new Date())
    : null;

  const expiryColor = daysRemaining === null ? "text-white/40" : daysRemaining <= 3 ? "text-destructive" : daysRemaining <= 7 ? "text-accent" : "text-green-400";

  const QUICK_LINKS = [
    { href: "/gacha", label: labels.gacha ?? "Gacha Terminal", desc: labels.gachaDesc ?? "Buka chest & dapatkan item", icon: Package, color: "accent", border: "border-accent/30 hover:border-accent/60", bg: "from-accent/10 to-accent/5" },
    { href: "/transfer", label: labels.transfer ?? "Transfer Saldo", desc: labels.transferDesc ?? "Kirim saldo ke member lain", icon: Send, color: "primary", border: "border-primary/30 hover:border-primary/60", bg: "from-primary/10 to-primary/5" },
    { href: "/renew", label: labels.renew ?? "Perpanjang Akun", desc: labels.renewDesc ?? "Perpanjang masa berlaku", icon: RefreshCcw, color: "secondary", border: "border-secondary/30 hover:border-secondary/60", bg: "from-secondary/10 to-secondary/5" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border border-white/10 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div className="text-muted-foreground font-mono text-xs tracking-widest mb-1">
            {labels.welcomeMsg ?? "SELAMAT DATANG KEMBALI"}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            {user.username.toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-white/30 uppercase">{user.role}</span>
            {user.isBlocked && <span className="text-[10px] bg-destructive/20 text-destructive border border-destructive/30 px-2 py-0.5 rounded-full font-bold">DIBLOKIR</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {user.role === "admin" && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-secondary/50 text-secondary hover:bg-secondary hover:text-white font-bold h-9">
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                ADMIN
              </Button>
            </Link>
          )}
          <Button variant="destructive" size="sm" onClick={handleLogout} className="font-bold h-9">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            KELUAR
          </Button>
        </div>
      </motion.header>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass border border-primary/20 rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center glow-blue">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-muted-foreground font-mono text-xs">{labels.balanceLabel ?? "SALDO IDR"}</div>
              <div className="text-3xl font-black text-primary text-glow">{formatIDR(user.balance)}</div>
            </div>
          </div>
          <div className="text-muted-foreground font-mono text-xs">
            {labels.balanceHint ?? "Gunakan untuk pull gacha & transfer"}
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="glass border border-secondary/20 rounded-2xl p-5 relative overflow-hidden group"
        >
          <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center glow-purple">
              <CalendarClock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-muted-foreground font-mono text-xs">{labels.expiryLabel ?? "MASA BERLAKU"}</div>
              {daysRemaining !== null ? (
                <div className={`text-3xl font-black ${expiryColor}`}>
                  {daysRemaining > 0 ? `${daysRemaining} hari` : "EXPIRED"}
                </div>
              ) : (
                <div className="text-white/30 font-mono text-lg">Tidak ada</div>
              )}
            </div>
          </div>
          <div className="text-muted-foreground font-mono text-xs">
            {user.expiresAt
              ? `Expired: ${new Date(user.expiresAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`
              : labels.noExpiryHint ?? "Akun tidak memiliki batas waktu"}
          </div>
        </motion.div>
      </div>

      {/* Quick nav */}
      <div>
        <div className="text-muted-foreground font-mono text-xs tracking-widest mb-3 px-1">
          {labels.menuTitle ?? "// MENU UTAMA"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_LINKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link href={item.href}>
                  <div className={`glass bg-gradient-to-b ${item.bg} border ${item.border} rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] group relative overflow-hidden`}>
                    <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-${item.color}/20 border border-${item.color}/30 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${item.color}`} />
                      </div>
                      <ArrowRight className={`w-4 h-4 text-${item.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    </div>
                    <div className="text-white font-black text-base mb-1">{item.label}</div>
                    <div className="text-muted-foreground font-mono text-xs">{item.desc}</div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
