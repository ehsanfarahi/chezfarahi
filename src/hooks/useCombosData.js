import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useCombosData() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/combos`)
      .then((r) => r.json())
      .then((data) => {
        setCombos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getComboById = (id) => combos.find((c) => c.id === id) || null;

  return { combos, loading, error, getComboById };
}