import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../types";
import { authRouter } from "./auth";
import { notesRouter } from "./notes";
import { tagsRouter } from "./tags";

export const apiRouter = new OpenAPIHono<AppEnv>();

apiRouter.route("/notes", notesRouter);
apiRouter.route("/tags", tagsRouter);
apiRouter.route("/auth", authRouter);
