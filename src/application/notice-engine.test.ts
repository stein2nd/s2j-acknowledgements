import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type { AckConfig } from "../domain/ack-config.js";
import { planPipeline } from "./pipeline.js";

const hostRoot = resolve(process.cwd());
const baseConfig: AckConfig = {
  preset: "dir",
  output: "build/oss-notice/ACKNOWLEDGEMENTS.test.md",
  workDir: "build/oss-notice",
  scanPaths: ["."],
};

describe("pipeline.engine", () => {
  it("defaults to onot command", () => {
    const plan = planPipeline(hostRoot, baseConfig);
    expect("error" in plan).toBe(false);
    if ("error" in plan) return;
    expect(plan.noticeEngine).toBe("onot");
    expect(plan.noticeCommand).toMatch(/\bonot generate /);
  });

  it("plans s2j-oss-notice argv when engine is oss-notice", () => {
    const plan = planPipeline(hostRoot, {
      ...baseConfig,
      pipeline: { engine: "oss-notice", onotConfig: "onot.yaml" },
    });
    expect("error" in plan).toBe(false);
    if ("error" in plan) return;
    expect(plan.noticeEngine).toBe("oss-notice");
    expect(plan.noticeCommand).toMatch(/s2j-oss-notice generate /);
    expect(plan.noticeCommand).toContain("--config onot.yaml");
  });
});
