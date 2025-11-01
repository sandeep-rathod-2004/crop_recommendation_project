const API_URL = import.meta.env.VITE_API_URL;

export const predictCrop = async (data, token) => {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return await res.json();
};
