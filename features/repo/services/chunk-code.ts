import {
    detectLanguageFromPath,
    process,
    WasmProcessConfig,
} from "@xberg-io/tree-sitter-language-pack-wasm";

export type CodeChunk = {
    id: string;
    path: string;
    language: string;
    startLine: number;
    endLine: number;
    content: string;
    nodeTypes: string[];
    symbolsDefined: string[];
};

type ChunkCodeParams = {
    path: string;
    content: string;
    maxChunkBytes?: number;
};

export function chunkCode({
    path,
    content,
    maxChunkBytes = 4000,
}: ChunkCodeParams): CodeChunk[] {
    const language = detectLanguageFromPath(path);

    if (!language) {
        return [];
    }

    const config = WasmProcessConfig.default();

    config.language = language;
    config.chunkMaxSize = maxChunkBytes;
    config.structure = true;
    config.imports = true;
    config.exports = true;
    config.docstrings = true;


    const result = process(content, config);

    return (result.chunks ?? []).flatMap((chunk) => {
        if (
            typeof chunk.startLine !== "number" ||
            typeof chunk.endLine !== "number" ||
            typeof chunk.content !== "string"
        ) {
            return [];
        }

        return [{
            id: `${path}:${chunk.startLine + 1}-${chunk.endLine + 1}`,
            path,
            language,
            startLine: chunk.startLine + 1,
            endLine: chunk.endLine + 1,
            content: chunk.content,
            nodeTypes: chunk.metadata?.nodeTypes ?? [],
            symbolsDefined: chunk.metadata?.symbolsDefined ?? [],
        }];
    });
}
