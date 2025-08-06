import * as Sentry from "@sentry/nestjs";

Sentry.init({
  dsn: "https://f2a2d7489b0d5ba1b6c60af0506e1bf9@o4509798104498176.ingest.us.sentry.io/4509798122782720",
  sendDefaultPii: true,
});
