import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  applyHostPackageLicenseToSpdx,
  normalizePackageJsonLicense,
  readHostPackageLicense,
} from "./host-package-license.js";

describe("host-package-license", () => {
  it("normalizes string and object licenses", () => {
    expect(normalizePackageJsonLicense("GPL-3.0-or-later")).toBe("GPL-3.0-or-later");
    expect(normalizePackageJsonLicense({ type: "MIT" })).toBe("MIT");
    expect(normalizePackageJsonLicense("")).toBeUndefined();
  });

  it("reads license from host package.json", () => {
    const root = mkdtempSync(join(tmpdir(), "host-pkg-"));
    writeFileSync(
      join(root, "package.json"),
      `${JSON.stringify({ name: "demo", license: "Apache-2.0" })}\n`,
    );
    expect(readHostPackageLicense(root)).toBe("Apache-2.0");
    expect(readHostPackageLicense(root, "missing.json")).toBeUndefined();
  });

  it("patches empty licenseDeclared on matching package name", () => {
    const doc = {
      packages: [
        { name: "CozyBrewApp", versionInfo: "1.0.0", licenseDeclared: "" },
        { name: "s2j-source-list", versionInfo: "2.0.0", licenseDeclared: "GPL-3.0-or-later" },
      ],
    };
    expect(
      applyHostPackageLicenseToSpdx(doc, {
        packageName: "CozyBrewApp",
        licenseId: "GPL-3.0-or-later",
      }),
    ).toBe(1);
    expect((doc.packages[0] as { licenseDeclared: string }).licenseDeclared).toBe(
      "GPL-3.0-or-later",
    );
    expect((doc.packages[1] as { licenseDeclared: string }).licenseDeclared).toBe(
      "GPL-3.0-or-later",
    );
  });

  it("does not override existing licenseDeclared", () => {
    const doc = {
      packages: [{ name: "App", licenseDeclared: "MIT" }],
    };
    expect(
      applyHostPackageLicenseToSpdx(doc, { packageName: "App", licenseId: "GPL-3.0-or-later" }),
    ).toBe(0);
  });
});
