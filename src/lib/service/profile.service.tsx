import Cookies from "js-cookie";
import { Message } from "@/types/message.types";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN, ERROR_CODE_BAD_REQUEST } from "@/config/error_code";
import { API_BASE, isDev } from "@/config/config";

export async function updateProfile(username: string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    switch (res.status) {
      case 200:
        if (isDev) {
          console.log("status: ", res.status, "data: ", data);
        }
        return data;
      case 400:
        if (isDev) {
          console.warn("status: ", res.status, "error: ", data);
        }
        throw new Error(data.errorCode || ERROR_CODE_BAD_REQUEST);
      case 401:
        if (isDev) {
          console.warn("status: ", res.status, "error: ", data);
        }
        throw new Error(ERROR_CODE_UNAUTHORIZED);
      default:
        if (isDev) {
          console.error("status: ", res.status, "error: ", data);
        }
        throw new Error(data.errorCode || ERROR_CODE_UNKNOWN);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(ERROR_CODE_UNKNOWN);
  }
}

export async function uploadPhoto(photo: File) {
  try {
    // Step 1: Upload photo to Cloudinary
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      throw new Error("Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.");
    }

    // Create FormData for Cloudinary upload
    const formData = new FormData();
    formData.append("file", photo);
    formData.append("upload_preset", cloudinaryUploadPreset);

    if (isDev) {
      console.log("Uploading photo to Cloudinary...");
    }

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      if (isDev) {
        console.error("Cloudinary upload failed:", errorData);
      }
      throw new Error("Failed to upload photo to Cloudinary");
    }

    const cloudinaryData = await cloudinaryResponse.json();
    const photoUrl = cloudinaryData.secure_url || cloudinaryData.url;

    if (!photoUrl) {
      throw new Error("Cloudinary response did not contain a photo URL");
    }

    if (isDev) {
      console.log("Photo uploaded to Cloudinary:", photoUrl);
    }

    // Step 2: Send the URL to backend API
    const res = await fetch(`${API_BASE}/api/v1/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify({ avatar: photoUrl }),
    });

    const data = await res.json();

    switch (res.status) {
      case 200:
        if (isDev) {
          console.log("status: ", res.status, "data: ", data);
        }
        return data;
      case 400:
        if (isDev) {
          console.warn("status: ", res.status, "error: ", data);
        }
        throw new Error(data.errorCode || ERROR_CODE_BAD_REQUEST);
      case 401:
        if (isDev) {
          console.warn("status: ", res.status, "error: ", data);
        }
        throw new Error(ERROR_CODE_UNAUTHORIZED);
      default:
        if (isDev) {
          console.error("status: ", res.status, "error: ", data);
        }
        throw new Error(data.errorCode || ERROR_CODE_UNKNOWN);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (isDev) {
        console.error("error: ", error);
      }
      throw error;
    }
    throw new Error(ERROR_CODE_UNKNOWN);
  }
}