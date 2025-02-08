import axios from "axios";

import { supabase } from "./supabase";

export const api = axios.create({
  //nextjs
  baseURL: window.location.origin + "/api",
  timeout: 30_000,
});

api.interceptors.request.use(async (config) => {
  const session = await supabase.auth.getSession();

  const token = session.data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
