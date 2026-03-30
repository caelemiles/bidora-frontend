"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer({
  endsAt,
  className = "",
}: {
  endsAt: string | number;
  className?: string;
}) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
      if (diff <= 0) {
        setRemaining("Ended");
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <span className={`font-mono text-sm tabular-nums ${className}`}>
      {remaining || "--:--:--"}
    </span>
  );
}
