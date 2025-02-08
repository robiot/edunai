export const enviroment = {
  WI_APP_ID:
    (process.env.NEXT_PUBLIC_WI_APP_ID as `app_${string}`) ??
    ("app_770651205808f6fb276aedaa031ac285" as `app_${string}`),

  BACKEND_URL: "http://localhost:8080",
  CONTRACT_ADDRESS:
    "0x1de841c54adb6ccd00bcabd9e0c4fcba1ad8c952" as `0x${string}`,
  TOKEN_ADDRESS: "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8" as `0x${string}`,
};
