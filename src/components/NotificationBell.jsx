import { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { Bell, X, CheckCircle, ChevronRight } from "lucide-react";

function getNotifications() {
  try { return JSON.parse(localStorage.getItem("camion_notifications") || "[]"); }
  catch { return []; }
}

function saveNotifications(list) {
  try { localStorage.setItem("camion_notifications", JSON.stringify(list)); }
  catch {}
}

function formatDateTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
      + " à "
      + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

export default function NotificationBell({ onShowOrderReady }) {
  const [open,   setOpen]   = useState(false);
  const [notifs, setNotifs] = useState([]);
  const panelRef = useRef(null);

  // Reload from localStorage every 2s
=======
import { Bell, X, CheckCircle, Package, ChevronRight } from "lucide-react";

function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem("camion_notifications") || "[]");
  } catch {
    return [];
  }
}

function saveNotifications(notifs) {
  try {
    localStorage.setItem("camion_notifications", JSON.stringify(notifs));
  } catch {}
}

export default function NotificationBell({ onShowOrderReady }) {
  const [open, setOpen]         = useState(false);
  const [notifs, setNotifs]     = useState([]);
  const panelRef                = useRef(null);

  // Load and poll notifications
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
  useEffect(() => {
    const refresh = () => setNotifs(getNotifications());
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, []);

<<<<<<< HEAD
  // Close when clicking outside
=======
  // Close panel when clicking outside
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

<<<<<<< HEAD
  // Handle ?orderReady= URL param (from push notification click)
=======
  // Check URL for orderReady param on mount (from push notification click)
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderReady = params.get("orderReady");
    if (orderReady) {
<<<<<<< HEAD
      // Mark matching notification as read
=======
      // Mark the matching notification as read and show the banner
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
      const all = getNotifications();
      const updated = all.map((n) =>
        n.orderNumber === orderReady ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      setNotifs(updated);
<<<<<<< HEAD
      // Show the ready banner
      onShowOrderReady?.(orderReady);
      // Clean URL without reload
=======
      onShowOrderReady?.(orderReady);
      // Clean URL
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
      const url = new URL(window.location.href);
      url.searchParams.delete("orderReady");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

<<<<<<< HEAD
  const unread = notifs.filter((n) => !n.read).length;

  const markRead = (id) => {
    const updated = notifs.map((n) => n.id === id ? { ...n, read: true } : n);
=======
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
    saveNotifications(updated);
    setNotifs(updated);
  };

<<<<<<< HEAD
  const markAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
=======
  const markRead = (id) => {
    const updated = notifs.map((n) => n.id === id ? { ...n, read: true } : n);
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
    saveNotifications(updated);
    setNotifs(updated);
  };

  const deleteNotif = (id) => {
    const updated = notifs.filter((n) => n.id !== id);
    saveNotifications(updated);
    setNotifs(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
    setNotifs([]);
  };

<<<<<<< HEAD
  const handleClick = (notif) => {
    markRead(notif.id);
    if (notif.orderNumber) onShowOrderReady?.(notif.orderNumber);
    setOpen(false);
  };

=======
  const handleNotifClick = (notif) => {
    markRead(notif.id);
    if (notif.orderNumber) {
      onShowOrderReady?.(notif.orderNumber);
    }
    setOpen(false);
  };

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-cream/10 transition"
        aria-label="Notifications"
      >
<<<<<<< HEAD
        <Bell size={20} className={notifs.length > 0 ? "text-cream" : "text-mute/50"} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-chili rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1 leading-none">
            {unread > 9 ? "9+" : unread}
=======
        <Bell size={20} className={notifs.length ? "text-cream" : "text-mute/50"} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-chili rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
          </span>
        )}
      </button>

<<<<<<< HEAD
      {/* Panel */}
=======
      {/* Notification panel */}
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
      {open && (
        <div
          className="absolute right-0 top-12 w-80 sm:w-96 bg-char-soft border border-cream/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          style={{ maxHeight: "70vh" }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cream/10">
<<<<<<< HEAD
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-cream text-sm">
                Notifications
              </h3>
              {unread > 0 && (
                <span className="bg-chili text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {unread} nouvelle{unread > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
=======
            <h3 className="font-display font-semibold text-cream text-sm">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-chili text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-mute/50 hover:text-marigold transition"
                >
                  Tout marquer lu
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-mute/40 hover:text-cream transition">
                <X size={15} />
              </button>
            </div>
          </div>

<<<<<<< HEAD
          {/* Notifications list */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 95px)" }}>
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <Bell size={28} className="text-mute/20" />
                <p className="text-sm text-mute/40">Aucune notification</p>
                <p className="text-xs text-mute/30">
                  Vous serez alerté ici quand votre commande est prête
                </p>
=======
          {/* Notification list */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 100px)" }}>
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <Bell size={28} className="text-mute/20" />
                <p className="text-sm text-mute/40">Aucune notification</p>
                <p className="text-xs text-mute/30">Vous serez alerté ici quand votre commande est prête</p>
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
              </div>
            ) : (
              <div className="divide-y divide-cream/5">
                {notifs.map((notif) => (
                  <div
                    key={notif.id}
<<<<<<< HEAD
                    className={`relative flex items-start gap-3 px-4 py-3 cursor-pointer transition group ${
=======
                    className={`relative flex items-start gap-3 px-4 py-3 cursor-pointer transition ${
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
                      notif.read
                        ? "hover:bg-cream/3"
                        : "bg-marigold/5 hover:bg-marigold/8"
                    }`}
<<<<<<< HEAD
                    onClick={() => handleClick(notif)}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-marigold shrink-0" />
=======
                    onClick={() => handleNotifClick(notif)}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span className="absolute top-3.5 left-2 w-1.5 h-1.5 rounded-full bg-marigold shrink-0" />
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
                    )}

                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.read ? "bg-herb/10" : "bg-herb/20"
                    }`}>
                      <CheckCircle size={18} className="text-herb" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
<<<<<<< HEAD
                      <p className={`text-xs font-semibold mb-0.5 ${
                        notif.read ? "text-mute/70" : "text-cream"
                      }`}>
                        Commande n°{notif.orderNumber} prête !
                      </p>
                      <p className={`text-xs leading-snug ${
                        notif.read ? "text-mute/45" : "text-mute/70"
                      }`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-mute/35 mt-1">
                        {formatDateTime(notif.timestamp)}
                      </p>
                    </div>

=======
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-xs font-semibold ${notif.read ? "text-mute/70" : "text-cream"}`}>
                          Commande n°{notif.orderNumber} prête
                        </span>
                      </div>
                      <p className={`text-xs leading-snug ${notif.read ? "text-mute/45" : "text-mute/70"}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-mute/35 mt-1">
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>

                    {/* Arrow */}
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
                    <ChevronRight size={14} className="text-mute/25 shrink-0 mt-2" />

                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
<<<<<<< HEAD
                      className="absolute top-2 right-2 w-5 h-5 rounded-full items-center justify-center hidden group-hover:flex hover:bg-cream/10 text-mute/40 hover:text-chili transition"
=======
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-cream/10 text-mute/40 hover:text-chili transition"
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div className="px-4 py-2.5 border-t border-cream/8">
              <button
                onClick={clearAll}
                className="text-[10px] text-mute/40 hover:text-chili transition w-full text-center"
              >
                Effacer toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 393817f8858bbe4ffc92642f0f2f8cbadb6b6707
