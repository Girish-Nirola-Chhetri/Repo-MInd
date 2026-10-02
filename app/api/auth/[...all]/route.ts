// connect better auth with the next router

import { auth } from "@/lib/auth"
import { toNextJsHandler  } from "better-auth/next-js"

export const {POST, GET } = toNextJsHandler(auth)