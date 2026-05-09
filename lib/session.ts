import { createHmac } from "node:crypto";

import { UserRole } from "@prisma/client";
import type {
  RequestCookies,
  ResponseCookies,
} from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const COOKIE_NAME = "jdj3_session";
const SESSION_DURATION = 60 * 60 * 24 * 30;

type SessionPayload = {
  userId: string;
  role: UserRole;
  exp: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.DATABASE_URL || "jdj3-dev-session-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
  };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(cookieStore: ResponseCookies, payload: Omit<SessionPayload, "exp">) {
  cookieStore.set(COOKIE_NAME, createSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export function clearSessionCookie(
  cookieStore: ResponseCookies | RequestCookies | ReadonlyRequestCookies,
) {
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getSessionFromCookies(
  cookieStore: RequestCookies | ReadonlyRequestCookies,
) {
  return readSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}
