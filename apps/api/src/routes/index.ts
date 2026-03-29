import { Hono } from "hono";
import type { AppEnv } from "../types";
import { authRouter } from "./auth";
import { notesRouter } from "./notes";
import { tagsRouter } from "./tags";

export const apiRouter = new Hono<AppEnv>();

apiRouter.route("/notes", notesRouter);
apiRouter.route("/tags", tagsRouter);
apiRouter.route("/auth", authRouter);
