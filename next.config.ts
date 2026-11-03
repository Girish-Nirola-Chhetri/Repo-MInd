import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: [
        "@xberg-io/tree-sitter-language-pack-wasm",
    ],
};

export default nextConfig;
