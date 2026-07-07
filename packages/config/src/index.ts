export const config = {
  apiPort: Number(process.env.MOCKERY_API_PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://mockery:mockery@localhost:5432/mockery",
  storageRoot: process.env.MOCKERY_STORAGE_ROOT ?? "/srv/mockery",
  smtp: {
    host: process.env.MOCKERY_SMTP_HOST ?? "",
    port: Number(process.env.MOCKERY_SMTP_PORT ?? 587),
    user: process.env.MOCKERY_SMTP_USER ?? "",
    pass: process.env.MOCKERY_SMTP_PASS ?? "",
    from: process.env.MOCKERY_SMTP_FROM ?? "noreply@mockery.local",
  },
  appUrl: process.env.MOCKERY_APP_URL ?? "http://localhost:5173",
};
