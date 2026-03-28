import { useEffect } from "react";
import { Bell, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-white/10 ${
        type === "success" ? "bg-binance-up text-white" : "bg-binance-down text-white"
      }`}
    >
      <Bell className="w-4 h-4" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80 rounded p-1">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
