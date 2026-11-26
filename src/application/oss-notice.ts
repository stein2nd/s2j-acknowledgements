import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { runCommand } from "../adapters/exec.js";
import { resolveOssNoticeExecutable } from "../lib/oss-notice-path.js";

export function runOssNoticeGenerate(options: {
  hostRoot: string;
  ossNoticePath?: string;
  sbomPath: string;
  onotConfigRel?: string;
  outputDir: string;
  verbose: boolean;
}): { ok: boolean; exitCode: number; warnedMissingConfig: boolean } {
  const exe = resolveOssNoticeExecutable(options.hostRoot, options.ossNoticePath);
  if (!exe) {
    console.error("error: s2j-oss-notice not found (npm i -D @s2j/oss-notice or PATH)");
    return { ok: false, exitCode: 127, warnedMissingConfig: false };
  }

  const args = ["generate", "-i", options.sbomPath, "-f", "md", "-o", options.outputDir];
  let warnedMissingConfig = false;

  if (options.onotConfigRel) {
    const configPath = resolve(options.hostRoot, options.onotConfigRel);
    if (existsSync(configPath)) {
      args.push("--config", configPath);
    } else {
      warnedMissingConfig = true;
      console.warn(`warn: onot config not found (${configPath}); running without --config`);
    }
  }

  if (options.verbose) {
    console.error(`${exe.path} ${args.join(" ")}`);
  }

  const result = runCommand(exe.path, args);
  if (!result.ok) {
    console.error(result.stderr || "s2j-oss-notice failed");
  }

  return {
    ok: result.ok,
    exitCode: result.status ?? 1,
    warnedMissingConfig,
  };
}
