import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Clock } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRenewAccount, useGetSettings, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";

const renewSchema = z.object({
  days: z.coerce.number().min(1, "Minimal perpanjangan 1 hari"),
});

export default function Renew() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: settings } = useGetSettings();
  const renewMutation = useRenewAccount();

  const form = useForm<z.infer<typeof renewSchema>>({
    resolver: zodResolver(renewSchema),
    defaultValues: {
      days: 30,
    },
  });
  
  const daysValue = form.watch("days") || 0;
  const renewalCostPerDay = settings?.renewalCostPerDay || 0;
  const totalCost = daysValue * renewalCostPerDay;

  const onSubmit = (data: z.infer<typeof renewSchema>) => {
    renewMutation.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Perpanjangan Berhasil",
          description: `Akun diperpanjang selama ${data.days} hari`,
        });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Perpanjangan Gagal",
          description: err.error || "Terjadi kesalahan",
        });
      }
    });
  };

  const daysRemaining = user?.expiresAt 
    ? differenceInDays(new Date(user.expiresAt), new Date()) 
    : 0;

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in zoom-in duration-300">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6 text-secondary hover:text-secondary hover:bg-secondary/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          KEMBALI
        </Button>
      </Link>
      
      <div className="bg-black/60 backdrop-blur-xl border border-secondary/50 p-8 rounded-2xl glow-purple relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
        
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-secondary to-primary text-glow mb-6">
          PERPANJANG AKUN
        </h1>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
            <p className="text-muted-foreground font-mono text-xs mb-1">SISA WAKTU</p>
            <p className="text-xl font-bold text-white">
              {daysRemaining > 0 ? `${daysRemaining} HARI` : "EXPIRED"}
            </p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-muted-foreground font-mono text-xs mb-1">SALDO</p>
            <p className="text-xl font-bold text-primary">{user ? formatIDR(user.balance) : "Rp 0"}</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-secondary font-mono text-xs">JUMLAH HARI</Label>
            <Input 
              type="number"
              {...form.register("days")}
              className="bg-black/50 border-secondary/30 focus-visible:ring-secondary text-white font-mono h-12 text-2xl font-bold text-center"
            />
            <p className="text-center text-xs text-muted-foreground font-mono mt-2">
              Biaya: {formatIDR(renewalCostPerDay)} / hari
            </p>
          </div>
          
          <div className="bg-black border border-white/10 rounded-lg p-4 text-center my-4">
            <p className="text-muted-foreground font-mono text-xs mb-1">TOTAL BIAYA</p>
            <p className="text-3xl font-black text-white text-glow">{formatIDR(totalCost)}</p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-white font-bold text-lg bg-secondary hover:bg-secondary/90 glow-purple transition-all mt-4"
            disabled={renewMutation.isPending || !user || user.balance < totalCost}
          >
            {renewMutation.isPending ? "MEMPROSES..." : (
              <>
                <Clock className="w-5 h-5 mr-2" />
                KONFIRMASI PERPANJANGAN
              </>
            )}
          </Button>
          {user && user.balance < totalCost && (
            <p className="text-center text-destructive text-sm font-bold mt-2">Saldo tidak mencukupi</p>
          )}
        </form>
      </div>
    </div>
  );
}