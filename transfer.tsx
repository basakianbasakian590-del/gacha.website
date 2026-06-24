import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useTransferBalance, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { formatIDR } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

const transferSchema = z.object({
  toUsername: z.string().min(1, "Username tujuan diperlukan"),
  amount: z.coerce.number().min(1000, "Minimal transfer Rp 1.000"),
});

export default function Transfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const transferMutation = useTransferBalance();

  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toUsername: "",
      amount: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof transferSchema>) => {
    transferMutation.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Transfer Berhasil",
          description: `Berhasil mengirim ${formatIDR(data.amount)} ke ${data.toUsername}`,
        });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Transfer Gagal",
          description: err.error || "Terjadi kesalahan",
        });
      }
    });
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in zoom-in duration-300">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6 text-primary hover:text-primary hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          KEMBALI
        </Button>
      </Link>
      
      <div className="bg-black/60 backdrop-blur-xl border border-primary/50 p-8 rounded-2xl glow-blue relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary text-glow mb-6">
          TRANSFER SALDO
        </h1>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-muted-foreground font-mono text-xs mb-1">SALDO ANDA SAAT INI</p>
          <p className="text-2xl font-bold text-white">{user ? formatIDR(user.balance) : "Rp 0"}</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-primary font-mono text-xs">USERNAME TUJUAN</Label>
            <Input 
              {...form.register("toUsername")}
              className="bg-black/50 border-primary/30 focus-visible:ring-primary text-white font-mono h-12"
              placeholder="Username penerima..."
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-primary font-mono text-xs">JUMLAH TRANSFER (IDR)</Label>
            <Input 
              type="number"
              {...form.register("amount")}
              className="bg-black/50 border-primary/30 focus-visible:ring-primary text-white font-mono h-12 text-2xl font-bold text-center"
              placeholder="10000"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-black font-bold text-lg bg-primary hover:bg-primary/90 glow-blue transition-all mt-4"
            disabled={transferMutation.isPending}
          >
            {transferMutation.isPending ? "MEMPROSES..." : (
              <>
                <Send className="w-5 h-5 mr-2" />
                KIRIM SALDO
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}