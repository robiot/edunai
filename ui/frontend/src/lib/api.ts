import axios from "axios";

import { environment } from "./environment";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: environment.API_URL,
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
