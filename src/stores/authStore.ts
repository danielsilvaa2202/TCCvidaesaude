// src/stores/authStore.ts
import { create } from "zustand";

function getInitialAuth(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("isAuthenticated") === "true";
  }
  return false;
}

function getInitialUser(): any | null {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }
  return null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  setIsAuthenticated: (val: boolean) => void;
  setUser: (user: any) => void;
  reset: () => void;
  login: (username: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: getInitialAuth(),
  user: getInitialUser(),

  setIsAuthenticated: (val) => set({ isAuthenticated: val }),
  setUser: (user) => set({ user }),

  reset: () => {
    console.log("🔴 Sessão encerrada.");
    set({ isAuthenticated: false, user: null });
    document.cookie =
      "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
    }
  },

  login: async (username: string, password: string) => {
    try {
      console.log("🔐 Tentando login com:", username);

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password: password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer login");
      }

      set({
        isAuthenticated: true,
        user: {
          id_profissional: data.id_profissional,
          prof_email: data.prof_email,
        },
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem(
          "user",
          JSON.stringify({
            id_profissional: data.id_profissional,
            prof_email: data.prof_email,
          })
        );
      }

      console.log("✅ Login bem-sucedido!");
    } catch (error) {
      console.error("❌ Erro no login:", error);
      throw error;
    }
  },
}));
