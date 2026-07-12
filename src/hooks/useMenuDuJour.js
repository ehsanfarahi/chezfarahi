import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useMenuDuJour() {
  const [menuDuJour, setMenuDuJour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/menu-du-jour`)
      .then((r) => r.json())
      .then((data) => {
        setMenuDuJour(data || null);
        setLoading(false);
      })
      .catch(() => {
        setMenuDuJour(null);
        setLoading(false)});
  }, []);

  return { menuDuJour, loading };
}