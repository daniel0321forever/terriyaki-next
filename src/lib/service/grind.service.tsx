import Cookies from "js-cookie";
import { Grind } from "@/types/grind.types";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN } from "@/config/error_code";
import { API_BASE, isDev } from "@/config/config";

export async function createGrind(
    duration: number,
    startDate: Date,
    budget: number,
    participants: string[],
) {
    const res = await fetch(`${API_BASE}/v1/grinds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
            duration,
            startDate: startDate.toISOString(),
            budget,
            participants,
        }),
    });

    switch (res.status) {
        case 200:
            let data = await res.json();
            if (isDev) {
                console.log("status: ", res.status, "data: ", data);
            }
            var grind: Grind = data.grind;
            return grind;
        case 400:
            if (isDev) {
                let data = await res.json();
                console.warn("status: ", res.status, "error: ", data);
            }
            throw new Error(data.errorCode);
        case 401:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function getCurrentGrind() {
    const res = await fetch(`${API_BASE}/v1/grinds/current`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            let data = await res.json();
            if (isDev) {
                console.log("status: ", res.status, "data: ", data);
            }
            const currentGrind: Grind = data.grind;
            return currentGrind;
        case 401:
            if (isDev) {
                let data = await res.json();
                console.warn("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function getGrindById(grindId: string) {
    const res = await fetch(`${API_BASE}/v1/grinds/${grindId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            let data = await res.json();
            if (isDev) {
                console.log("status: ", res.status, "data: ", data);
            }
            const grind: Grind = data.grind;
            return grind;
        case 401:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function getGrinds() {
    const res = await fetch(`${API_BASE}/v1/grinds`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            let data = await res.json();
            if (isDev) {
                console.log("status: ", res.status, "data: ", data);
            }
            const grinds: Grind[] = data.grinds;
            return grinds;
        case 401:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function quitGrind(grindId: number) {
    const res = await fetch(`${API_BASE}/v1/grinds/${grindId}/quit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            let data = await res.json();
            if (isDev) {
                console.log("status: ", res.status, "data: ", data);
            }
            return data;
        case 401:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            if (isDev) {
                let data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}