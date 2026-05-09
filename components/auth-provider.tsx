"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { AuthAddress, AuthUser, ReferralActivity } from "@/lib/auth-types";

type RegisterInput = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  referralCodeInput?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type ApiResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  referrals: ReferralActivity[];
  ready: boolean;
  login: (input: LoginInput, role?: "CUSTOMER" | "ADMIN") => Promise<ApiResult>;
  register: (input: RegisterInput) => Promise<ApiResult>;
  logout: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<ApiResult>;
  addAddress: (address: Omit<AuthAddress, "id">) => Promise<ApiResult>;
  updateAddress: (id: string, address: Omit<AuthAddress, "id">) => Promise<ApiResult>;
  deleteAddress: (id: string) => Promise<ApiResult>;
  refreshAccount: () => Promise<void>;
  allUsers: AuthUser[];
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AccountResponse = {
  user: AuthUser | null;
  referrals?: ReferralActivity[];
  message?: string;
};

async function parseJson<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [referrals, setReferrals] = useState<ReferralActivity[]>([]);
  const [ready, setReady] = useState(false);

  const applyAccountResponse = useCallback((payload: AccountResponse | null) => {
    setUser(payload?.user ?? null);
    setReferrals(payload?.referrals ?? []);
  }, []);

  const refreshAccount = useCallback(async () => {
    try {
      const response = await fetch("/api/account", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      const payload = await parseJson<AccountResponse>(response);
      applyAccountResponse(payload);
    } catch {
      applyAccountResponse(null);
    } finally {
      setReady(true);
    }
  }, [applyAccountResponse]);

  useEffect(() => {
    void refreshAccount();
  }, [refreshAccount]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      referrals,
      ready,
      allUsers: [],
      login: async (input, role = "CUSTOMER") => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ ...input, role }),
        });
        const payload = await parseJson<AccountResponse>(response);

        if (!response.ok) {
          return { ok: false, message: payload?.message ?? "Unable to log in." };
        }

        applyAccountResponse(payload);
        return { ok: true };
      },
      register: async (input) => {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(input),
        });
        const payload = await parseJson<AccountResponse>(response);

        if (!response.ok) {
          return { ok: false, message: payload?.message ?? "Unable to register." };
        }

        applyAccountResponse(payload);
        return { ok: true };
      },
      logout: async () => {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
        });
        applyAccountResponse(null);
      },
      updatePassword: async (currentPassword, newPassword) => {
        const response = await fetch("/api/auth/password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const payload = await parseJson<{ message?: string }>(response);
        return {
          ok: response.ok,
          message: payload?.message ?? (response.ok ? "Password updated." : "Unable to update password."),
        };
      },
      addAddress: async (address) => {
        const response = await fetch("/api/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(address),
        });
        const payload = await parseJson<AccountResponse>(response);

        if (!response.ok) {
          return { ok: false, message: payload?.message ?? "Unable to save address." };
        }

        applyAccountResponse(payload);
        return { ok: true };
      },
      updateAddress: async (id, address) => {
        const response = await fetch(`/api/addresses/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify(address),
        });
        const payload = await parseJson<AccountResponse>(response);

        if (!response.ok) {
          return { ok: false, message: payload?.message ?? "Unable to update address." };
        }

        applyAccountResponse(payload);
        return { ok: true };
      },
      deleteAddress: async (id) => {
        const response = await fetch(`/api/addresses/${id}`, {
          method: "DELETE",
          credentials: "same-origin",
        });
        const payload = await parseJson<AccountResponse>(response);

        if (!response.ok) {
          return { ok: false, message: payload?.message ?? "Unable to delete address." };
        }

        applyAccountResponse(payload);
        return { ok: true };
      },
      refreshAccount,
    }),
    [applyAccountResponse, ready, referrals, refreshAccount, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
