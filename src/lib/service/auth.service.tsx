import Cookies from "js-cookie";
import { User } from "@/types/user.types";
import { Grind } from "@/types/grind.types";
import { API_BASE, isDev } from "@/config/config";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/v2/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  switch (res.status) {
    case 200:
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }

      Cookies.set("token", data.token);

      const user: User = data.user;
      const grinds: { [key: string]: Grind } = data.grinds;

      return { user, grinds };

    // TODO: make this error visible to the user
      case 400:
      if (isDev) {
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error("invalid-email");
    case 401:
      if (isDev) {
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    default:
      if (isDev) {
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}

export async function register(email: string, password: string, username: string) {
  const res = await fetch(`${API_BASE}/api/v1/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, username }),
  });


  const data = await res.json();
  switch (res.status) {
    case 200:
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }
      const user: User = data.user;
      Cookies.set("token", data.token);

      return user;
    case 400:
      if (isDev) {
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    case 401:
      if (isDev) {
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    default:
      if (isDev) {
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/v1/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
  });

  const data = await res.json();
  switch (res.status) {
    case 200:
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }
      Cookies.remove("token");
      return true;
    default:
      if (isDev) {
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}

export async function verifyToken() {
  const res = await fetch(`${API_BASE}/api/v2/verify-token`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
  });

  const data = await res.json();
  switch (res.status) {
    case 200:
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }

      const user: User = data.user;
      const grinds: { [key: string]: Grind } = data.grinds;

      return { user: user, grinds: grinds };
    case 401:
      if (isDev) {
        console.warn("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
    default:
      if (isDev) {
        console.error("status: ", res.status, "error: ", data);
      }
      throw new Error(data.errorCode);
  }
}

export async function checkEmailExists(email: string) {
  const res = await fetch(`${API_BASE}/api/v1/users/exists?email=${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  switch (res.status) {
    case 200:
      if (isDev) {
        console.log("status: ", res.status, "data: ", data);
      }
      return data.exists;
    case 400:
      if (isDev) {
        console.warn("status: ", res.status, "error: ", data);
      }
      return false;
    default:
      if (isDev) {
        console.error("status: ", res.status, "error: ", data);
      }
      return false;
  }
}