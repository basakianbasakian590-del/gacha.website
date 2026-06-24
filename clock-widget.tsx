import { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";

export function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (offset: number) => {
    const d = new Date(time.getTime() + (time.getTimezoneOffset() * 60000) + (offset * 3600000));
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatDate = () =>
    time.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const wibTime = formatTime(7);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {expanded ? (
        <div className="bg-black/90 border border-secondary/40 rounded-2xl p-3 backdrop-blur-xl shadow-xl shadow-secondary/10 w-44">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-secondary" />
              <span className="text-xs font-mono text-secondary font-bold">ZONA WAKTU</span>
            </div>
            <button onClick={() => setExpanded(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[10px] font-mono text-white/40 mb-2">{formatDate()}</div>
          {[
            { label: "WIB", offset: 7 },
            { label: "WITA", offset: 8 },
            { label: "WIT", offset: 9 },
          ].map(({ label, offset }) => (
            <div key={label} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
              <span className="text-white/40 font-mono text-xs">{label}</span>
              <span className="text-primary font-mono text-xs tabular-nums">{formatTime(offset)}</span>
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="h-9 px-3 rounded-full bg-black/80 border border-secondary/40 flex items-center gap-1.5 hover:border-secondary transition-all backdrop-blur-md"
          title="Jam Indonesia"
        >
          <Clock className="w-3 h-3 text-secondary/70" />
          <span className="font-mono text-xs text-white/70 tabular-nums">{wibTime}</span>
        </button>
      )}
    </div>
  );
}
