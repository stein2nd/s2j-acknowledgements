import type { NoticeEngine } from "../domain/notice-engine.js";
import { runOnotGenerate } from "./onot.js";
import { runOssNoticeGenerate } from "./oss-notice.js";

export function runNoticeGenerate(options: {
  engine: NoticeEngine;
  hostRoot: string;
  venvPath: string;
  onotPath?: string;
  ossNoticePath?: string;
  sbomPath: string;
  onotConfigRel?: string;
  outputDir: string;
  verbose: boolean;
}): { ok: boolean; exitCode: number; warnedMissingConfig: boolean } {
  if (options.engine === "oss-notice") {
    return runOssNoticeGenerate({
      hostRoot: options.hostRoot,
      ossNoticePath: options.ossNoticePath,
      sbomPath: options.sbomPath,
      onotConfigRel: options.onotConfigRel,
      outputDir: options.outputDir,
      verbose: options.verbose,
    });
  }

  return runOnotGenerate({
    hostRoot: options.hostRoot,
    venvPath: options.venvPath,
    onotPath: options.onotPath,
    sbomPath: options.sbomPath,
    onotConfigRel: options.onotConfigRel,
    outputDir: options.outputDir,
    verbose: options.verbose,
  });
}
