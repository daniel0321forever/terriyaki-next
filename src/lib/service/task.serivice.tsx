import Cookies from "js-cookie";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN } from "@/config/error_code";
import { Task } from "@/types/task.types";
import { API_BASE, isDev } from "@/config/config";

export async function submitTask(code: string, language: string) {
    const res = await fetch(`${API_BASE}/api/v1/tasks/finish`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
            code,
            language,
        }),
    });


    switch (res.status) {
        case 200:
            const data = await res.json();
            if (isDev) {
                console.log("status: ", res.status, "data: ", data);
            }
            return data;
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

export async function getTaskDetail(taskId: string) {
    // set-problem=true ensures problem details (constraints, examples) are loaded
    const res = await fetch(`${API_BASE}/api/v1/tasks/${taskId}?set-problem=true`, {
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
            const task: Task = data.task;
            return task;
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