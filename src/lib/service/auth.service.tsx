import Cookies from "js-cookie";
import { User } from "@/types/user.types";
import { Grind } from "@/types/grind.types";
import { API_BASE, isDev } from "@/config/config";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/v1/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  switch (res.status) {
    case 200:
      const data = await res.json();

      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }

      Cookies.set("token", data.token);

      const user: User = data.user;
      const currentGrind: Grind = data.grind;

      return { user, currentGrind };

    case 400:
      if (isDev) {
        const data = await res.json();
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error("invalid-email");
    case 401:
      if (isDev) {
        const data = await res.json();
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    default:
      if (isDev) {
        const data = await res.json();
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}

export async function register(email: string, password: string, username: string) {
  const res = await fetch(`${API_BASE}/v1/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, username }),
  });

  
  switch (res.status) {
    case 200:
      const data = await res.json();
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }
      const user: User = data.user;
      Cookies.set("token", data.token);

      return user;
    case 400:
      if (isDev) {
        const data = await res.json();
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    case 401:
      if (isDev) {
        const data = await res.json();
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    default:
      if (isDev) {
        const data = await res.json();
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}

export async function logout() {
  const res = await fetch(`${API_BASE}/v1/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
  });

  switch (res.status) {
    case 200:
      const data = await res.json();
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }
      Cookies.remove("token");
      return true;
    default:
      if (isDev) {
        const data = await res.json();
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}

export async function verifyToken() {
  const res = await fetch(`${API_BASE}/v1/verify-token`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
  });

  switch (res.status) {
    case 200:
      const data = await res.json();
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }
      const user: User = data.user;
      const currentGrind: Grind | null = data.grind;
      return { user: user, currentGrind: currentGrind };
    case 401:
      if (isDev) {
        const data = await res.json();
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    default:
      if (isDev) {
        const data = await res.json();
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}