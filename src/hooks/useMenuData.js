import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useMenuData() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/business`)
      .then((r) => r.json())
      .then((data) => {
        setMenuItems(data.menu || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { menuItems, loading };
}