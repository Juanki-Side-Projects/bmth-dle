import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
// @ts-expect-error - build output
import * as build from "../build/server/index.js";

export const onRequest = createPagesFunctionHandler({ build });
