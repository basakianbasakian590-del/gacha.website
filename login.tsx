import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Eye, EyeOff, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { storeToken } from "@/lib/token";
import { useLogin, useGetSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username diperlukan"),
  password: z.string().min(1, "Password diperlukan"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, setUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { data: settings } = useGetSettings();
  const loginMutation = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (user) {
      setLocation(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, setLocation]);

  if (authLoading || user) return null;

  const onSubmit = (data: LoginForm) => {
    if (isBlocked) return;
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        storeToken(res.token);
        setUser(res.user);
      },
      onError: (err: any) => {
        const errorMsg = err?.data?.error ?? err?.message ?? "Login gagal";
        const attemptsLeft = err?.data?.attemptsLeft;
        if (attemptsLeft !== undefined) {
          const failures = 3 - attemptsLeft;
          setFailedAttempts(failures);
          if (failures >= 3) setIsBlocked(true);
        } else if (errorMsg.toLowerCase().includes("diblokir")) {
          setIsBlocked(true);
        }
        toast({ variant: "destructive", title: "Akses Ditolak", description: errorMsg });
      }
    });
  };

  const siteName = settings?.siteName ?? "AndraDev";

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl shadow-2xl">

        {/* Left panel – branding */}
        <motion.div
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(145deg, #0a0030 0%, #050520 50%, #0a0030 100%)" }}
        >
          {/* Animated glow orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #00D4FF, transparent)" }} />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #8B00FF, transparent)" }} />

          {/* Logo */}
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            >
              <div className="text-5xl font-black text-transparent bg-clip-text mb-2"
                style={{ backgroundImage: "linear-gradient(135deg, #00D4FF, #8B00FF, #FFD700)" }}>
                {siteName}
              </div>
              <div className="text-white/40 font-mono text-xs tracking-widest">GROWTOPIA GACHA SYSTEM</div>
            </motion.div>
          </div>

          {/* Features list */}
          <div className="relative z-10 space-y-4">
            {[
              { icon: "⚡", label: "Gacha Premium", desc: "Dapatkan item langka" },
              { icon: "💎", label: "Chest Eksklusif", desc: "Basic, Rare & Mythic" },
              { icon: "🔐", label: "Sistem Aman", desc: "Data terlindungi penuh" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg">{f.icon}</div>
                <div>
                  <div className="text-white font-bold text-sm">{f.label}</div>
                  <div className="text-white/40 font-mono text-xs">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom decoration */}
          <div className="relative z-10 text-white/20 font-mono text-[10px]">
            v1.0 · Powered by AndraDev
          </div>
        </motion.div>

        {/* Right panel – form */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass border border-white/10 p-8 md:p-10 flex flex-col justify-center"
        >
          {/* Mobile logo */}
          <div className="md:hidden text-center mb-8">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary">{siteName}</div>
            <div className="text-muted-foreground font-mono text-xs mt-1">GROWTOPIA GACHA SYSTEM</div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-1">Masuk ke Akun</h2>
            <p className="text-muted-foreground font-mono text-xs">Gunakan kredensial yang diberikan admin</p>
          </div>

          <AnimatePresence mode="wait">
            {isBlocked ? (
              <motion.div
                key="blocked"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-destructive/10 border border-destructive/40 p-6 rounded-2xl text-center glow-red"
              >
                <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-black text-destructive mb-1">AKUN DIKUNCI</h3>
                <p className="text-sm text-destructive/70 font-mono">3x password salah. Hubungi administrator.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-widest uppercase">Username</label>
                  <Input
                    {...form.register("username")}
                    autoComplete="username"
                    className="h-12 glass border-white/15 focus-visible:border-primary text-white font-mono tracking-wider placeholder:text-white/20"
                    placeholder="nama_akun"
                  />
                  {form.formState.errors.username && (
                    <p className="text-destructive text-xs font-mono">{form.formState.errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-primary tracking-widest uppercase">Password</label>
                    {failedAttempts > 0 && (
                      <span className="text-destructive text-xs font-mono font-bold">⚠ {failedAttempts}/3 gagal</span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      {...form.register("password")}
                      autoComplete="current-password"
                      className="h-12 glass border-white/15 focus-visible:border-primary text-white font-mono pr-12 placeholder:text-white/20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-destructive text-xs font-mono">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Attempt indicator */}
                {failedAttempts > 0 && (
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < failedAttempts ? "bg-destructive" : "bg-white/10"}`} />
                    ))}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-12 font-black text-base tracking-widest text-black glow-blue transition-all"
                  style={{ background: "linear-gradient(135deg, #00D4FF, #0099bb)" }}
                >
                  {loginMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  ) : (
                    <><Zap className="w-4 h-4 mr-2" />MASUK</>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
