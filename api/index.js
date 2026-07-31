import { app, bootstrap } from "../server/src/index.js";

bootstrap().catch((e) => console.error("[api] bootstrap failed:", e.message));

export default app;
