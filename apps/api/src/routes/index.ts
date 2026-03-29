import { Hono } from "hono";
import { authRouter } from "@/routes/auth";
import { notesRouter } from "@/routes/notes";
import { tagsRouter } from "@/routes/tags";
import type { AppEnv } from "@/types";

export const apiRouter = new Hono<AppEnv>();

apiRouter.route("/notes", notesRouter);
apiRouter.route("/tags", tagsRouter);
apiRouter.route("/auth", authRouter);
