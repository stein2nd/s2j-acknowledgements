import { existsSync } from "node:fs";
import { join } from "node:path";

import { which } from "../adapters/exec.js";

export function resolveOssNoticeExecutable(
  hostRoot: string,
  ossNoticePath?: string,
): { path: string; source: "config" | "node_modules" | "path" } | null {
  if (ossNoticePath && existsSync(ossNoticePath)) {
    return { path: ossNoticePath, source: "config" };
  }

  const localBin = join(hostRoot, "node_modules", ".bin", "s2j-oss-notice");
  if (existsSync(localBin)) {
    return { path: localBin, source: "node_modules" };
  }

  const globalBin = which("s2j-oss-notice");
  if (globalBin) {
    return { path: globalBin, source: "path" };
  }

  return null;
}
