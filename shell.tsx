import { useEffect } from "react";
import { Background } from "./background";
import { MusicPlayer } from "./music-player";
import { ClockWidget } from "./clock-widget";
import { useGetSettings } from "@workspace/api-client-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const { data: settings } = useGetSettings();

  useEffect(() => {
    const root = document.documentElement;
    if (settings?.themeMode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [settings?.themeMode]);

  return (
    <div className="min-h-screen relative flex flex-col">
      <Background />
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10 relative z-10">
        {children}
      </div>
      <MusicPlayer />
      <ClockWidget />
    </div>
  );
}
