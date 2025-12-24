export class PathResolver {
    constructor(basePath) {
        this.basePath = basePath;
    }
    resolve(relativePath) {
        if (relativePath.startsWith("http://") ||
            relativePath.startsWith("https://")) {
            return relativePath;
        }
        if (relativePath.startsWith("/")) {
            const needsRaw = relativePath.endsWith(".html") && !relativePath.includes("?");
            return needsRaw ? `${relativePath}?raw` : relativePath;
        }
        if (relativePath.startsWith("./") || relativePath.startsWith("../")) {
            const needsRaw = relativePath.endsWith(".html") && !relativePath.includes("?");
            const withRaw = needsRaw ? `${relativePath}?raw` : relativePath;
            return new URL(withRaw, this.basePath + "/").href;
        }
        throw new Error(`Cannot resolve path: ${relativePath}`);
    }
}
//# sourceMappingURL=path-resolver.js.map