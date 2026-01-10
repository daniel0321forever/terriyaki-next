import Cookies from "js-cookie";
import { API_BASE, isDev } from "@/config/config";
import { ERROR_CODE_UNAUTHORIZED, ERROR_CODE_UNKNOWN, ERROR_CODE_BAD_REQUEST } from "@/config/error_code";
import { PaymentMethod } from "@/types/payment_method";

export const createSaveCardIntent = async () => {
  const token = Cookies.get("token");
  const response = await fetch(`${API_BASE}/api/v1/payments/save-card-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create setup intent');
  }

  const data = await response.json();

  switch (response.status) {
    case 200:
      return data.clientSecret;
    case 400:
      throw new Error(data.errorCode);
    case 401:
      throw new Error(ERROR_CODE_UNAUTHORIZED);
    default:
      throw new Error(ERROR_CODE_UNKNOWN);
  }
};

export const saveCard = async (paymentMethodId: string) => {
  const token = Cookies.get("token");
  const response = await fetch(`${API_BASE}/api/v1/payments/save-card`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      payment_method_id: paymentMethodId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save card');
  }

  const data = await response.json();
  return data;
};

export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const token = Cookies.get("token");
  const response = await fetch(`${API_BASE}/api/v1/payments/methods`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }

  const data = await response.json();

  console.log(data);

  switch (response.status) {
    case 200:
      return data.payment_methods;
    case 401:
      throw new Error(ERROR_CODE_UNAUTHORIZED);
    default:
      throw new Error(ERROR_CODE_UNKNOWN);
  }
};

export const setDefaultPaymentMethod = async (paymentMethodId: string) => {
  const token = Cookies.get("token");
  const response = await fetch(`${API_BASE}/api/v1/payments/select-default`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      payment_method_id: paymentMethodId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to set default payment method');
  }

  const data = await response.json();

  switch (response.status) {
    case 200:
      return true;
    case 400:
      throw new Error(data.errorCode);
    case 401:
      throw new Error(data.errorCode || ERROR_CODE_UNAUTHORIZED);
    default:
      throw new Error(ERROR_CODE_UNKNOWN);
  }
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  const token = Cookies.get("token");
  const response = await fetch(`${API_BASE}/api/v1/payments/methods/${paymentMethodId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete payment method');
  }

  return true;
};