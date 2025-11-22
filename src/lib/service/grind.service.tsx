import Cookies from "js-cookie";
import { Grind } from "@/types/grind.types";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN } from "@/config/error_code";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function createGrind(
    duration: number,
    startDate: Date,
    budget: number,
    participants: string[],
) {
    console.log("Creating grind with duration: ", duration, "startDate: ", startDate, "budget: ", budget, "participants: ", participants);

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
            var data = await res.json();
            var grind: Grind = data.grind;
            return grind;
        case 401:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            var data = await res.json();
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
            var data = await res.json();
            var currentGrind: Grind = data.grind;
            return currentGrind;
        case 401:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
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
            var data = await res.json();
            var grinds: Grind[] = data.grinds;
            return grinds;
        case 401:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}