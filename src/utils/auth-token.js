import { TOKEN_KEY, USER_INFO_KEY } from "@/constants/storage";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUserInfo() {
  const raw = localStorage.getItem(USER_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUserInfo(info) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
}

export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
}

export function clearAuthStorage() {
  removeToken();
  removeUserInfo();
}
