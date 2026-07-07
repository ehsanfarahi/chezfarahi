import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useMenuData() {
  const [menuItems, setMenuItems] = useState([]);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/business`).then((r) => r.json()).then((data) => {
      setBusinessData(data);
      setMenuItems(data.menu || []);
      setLoading(false);
    }).catch((err) => {
      setError(err.message);
      setLoading(false);
    })
   }, []);

   const getItemById = (id) => menuItems.find((item) => item.id === id) || null;

   return { menuItems, businessData, loading, error, getItemById };
   }











// import { useState, useEffect } from "react";

// const API_URL = import.meta.env.VITE_API_URL || "";

// export function useMenuData() {
//   const [menuItems, setMenuItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${API_URL}/api/business`)
//       .then((r) => r.json())
//       .then((data) => {
//         setMenuItems(data.menu || []);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, []);

//   return { menuItems, loading };
// }