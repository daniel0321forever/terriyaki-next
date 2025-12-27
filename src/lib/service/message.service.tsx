import Cookies from "js-cookie";
import { Message } from "@/types/message.types";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN } from "@/config/error_code";
import { API_BASE, isDev } from "@/config/config";

export async function getMessages(offset: number = 0, limit: number = 10) {
    const res = await fetch(`${API_BASE}/api/v1/messages?offset=${offset}&limit=${limit}`, {
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
            const messages: Message[] = data.data;
            return messages;
        case 401:
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function getSentMessages(offset: number = 0, limit: number = 10, includeResponse: boolean = false) {
    const res = await fetch(`${API_BASE}/api/v1/messages/sent?offset=${offset}&limit=${limit}`, {
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
            const messages: Message[] = data.data;

            if (!includeResponse) {
                return messages.filter((message: Message) => message.type !== 'invitation_accepted' && message.type !== 'invitation_rejected');
            }
            return messages;
        case 401:
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}   

export async function readMessage(messageId: string) {
    const res = await fetch(`${API_BASE}/api/v1/messages/${messageId}/read`, {
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
    const res = await fetch(`${API_BASE}/api/v1/messages/invitation`, {
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
            const data = await res.json();
            if (isDev) {
                console.log("status: ", res.status, "data: ", data);
            }
            return true;
        case 401:
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(data.errorCode);
        default:    
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function acceptInvitationMessage(messageId: string) {
    const res = await fetch(`${API_BASE}/api/v1/messages/${messageId}/invitation/accept`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            const data = await res.json();
            console.log("status: ", res.status, "data: ", data);
            return true;
        case 401:
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(data.errorCode);
        default:
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}

export async function rejectInvitationMessage(messageId: string) {
    const res = await fetch(`${API_BASE}/api/v1/messages/${messageId}/invitation/reject`, {
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
            return true;
        case 401:
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(data.errorCode);
        default:
            if (isDev) {
                const data = await res.json();
                console.error("status: ", res.status, "error: ", data);
            }
            throw new Error(ERROR_CODE_UNKNOWN);

    }
}