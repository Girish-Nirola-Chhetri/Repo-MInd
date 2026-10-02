import { betterAuth } from 'better-auth'
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2"
import { db }  from "../db/index"
import * as authSchema from "../db/schema/auth-schema"
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
    database: drizzleAdapter( db, {
        provider: 'pg',
        schema: authSchema,
    }),
    // emailAndPassword: {
    //     enabled: true
    // }

    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },

    plugins: [
        nextCookies()       // save cookies for better auth calls made in next js server actions
    ]

});