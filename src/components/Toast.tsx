import { useEffect } from "react";
import { SteamMark } from "./icons";

interface ToastProps {
  message: string;
  onDone: () => void;
}

/** 爆発的な祝福ではなく、湯気がふっと上がる静かな手触り（設計書 4）。 */
export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="toast" role="status" aria-live="polite">
      <SteamMark size={26} className="toast-steam" />
      <span>{message}</span>
    </div>
  );
}
