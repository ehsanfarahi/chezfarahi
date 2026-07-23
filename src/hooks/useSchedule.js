import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useSchedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/schedule`)
      .then((r) => r.json())
      .then((data) => {
        setSchedule(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { schedule, loading };
}