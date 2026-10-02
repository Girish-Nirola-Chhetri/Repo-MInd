import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    out: "./drizzle",
    schema: "./db/schema/*",
    dialect: "postgresql",          // type of db using
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    }
})