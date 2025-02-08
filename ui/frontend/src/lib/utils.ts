import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hashObject = async (object: Object) => {
  const stringified = JSON.stringify(object);

  const encoder = new TextEncoder();

  const data = encoder.encode(stringified);

  return Buffer.from(await crypto.subtle.digest("SHA-256", data));
};
