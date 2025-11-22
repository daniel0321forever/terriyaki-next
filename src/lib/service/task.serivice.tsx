import Cookies from "js-cookie";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN } from "@/config/error_code";
import { Task } from "@/types/task.types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function submitTask(code: string, language: string) {
    const res = await fetch(`${API_BASE}/v1/tasks/finish`, {
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
            var data = await res.json();
            console.log("status: ", res.status, "data: ", data);
            return data;
        case 401:
            var data = await res.json();
            console.error("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            console.error("status: ", res.status, "error: ", await res.text());
            throw new Error(ERROR_CODE_UNKNOWN);
    }   
}

export async function getTaskDetail(taskId: number) {
    const res = await fetch(`${API_BASE}/v1/tasks/${taskId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`,
        },
    });

    switch (res.status) {
        case 200:
            var data = await res.json();
            var task: Task = data.task;
            return task;
        case 401:
            var data = await res.json();
            console.error("status: ", res.status, "error: ", data);
            throw new Error(ERROR_CODE_UNAUTHORIZED);
        default:
            console.error("status: ", res.status, "error: ", await res.text());
            throw new Error(ERROR_CODE_UNKNOWN);
    }
}