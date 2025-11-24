import Cookies from "js-cookie";
import { User } from "@/types/user.types";
import { Grind } from "@/types/grind.types";
import { Message } from "@/types/message.types";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN } from "@/config/error_code";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getMessages(offset: number = 0, limit: number = 10) {
    const res = await fetch(`${API_BASE}/v1/messages?offset=${offset}&limit=${limit}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            var data = await res.json();
            console.log("status: ", res.status, "data: ", data);
            var messages: Message[] = data.data;
            return messages;
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

export async function readMessage(messageId: number) {
    const res = await fetch(`${API_BASE}/v1/messages/${messageId}/read`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            return true;
        case 401:
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function createInvitationMessage(grindID: string, participantEmail: string) {
    const res = await fetch(`${API_BASE}/v1/messages/invitation`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
            grindID,
            participantEmail,
        }),
    });

    switch (res.status) {
        case 200:
            var data = await res.json();
            console.log("status: ", res.status, "data: ", data);
            return true;
        case 401:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(data.errorCode);
        default:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function acceptInvitationMessage(messageId: number) {
    const res = await fetch(`${API_BASE}/v1/messages/${messageId}/invitation/accept`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            var data = await res.json();
            console.log("status: ", res.status, "data: ", data);
            return true;
        case 401:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(data.errorCode);
        default:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function rejectInvitationMessage(messageId: number) {
    const res = await fetch(`${API_BASE}/v1/messages/${messageId}/invitation/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            var data = await res.json();
            console.log("status: ", res.status, "data: ", data);
            return true;
        case 401:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(data.errorCode);
        default:
            var data = await res.json();
            console.log("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNKNOWN);

    }
}