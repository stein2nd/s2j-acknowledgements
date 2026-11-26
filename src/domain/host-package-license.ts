import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function normalizePackageJsonLicense(license: unknown): string | undefined {
  if (typeof license === "string") {
    const trimmed = license.trim();
    return trimmed || undefined;
  }
  if (license !== null && typeof license === "object" && "type" in license) {
    const type = (license as { type?: unknown }).type;
    if (typeof type === "string") {
      const trimmed = type.trim();
      return trimmed || undefined;
    }
  }
  return undefined;
}

/** Reads SPDX license id from the host repo's package.json (or another relative path). */
export function readHostPackageLicense(
  hostRoot: string,
  relPath = "package.json",
): string | undefined {
  const path = resolve(hostRoot, relPath);
  if (!existsSync(path)) {
    return undefined;
  }
  try {
    const pkg = JSON.parse(readFileSync(path, "utf8")) as { license?: unknown };
    return normalizePackageJsonLicense(pkg.license);
  } catch {
    return undefined;
  }
}

function isBlankOrUnknownSpdxLicense(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== "string") return true;
  const s = value.trim();
  if (!s) return true;
  const upper = s.toUpperCase();
  return upper === "NOASSERTION" || upper === "NONE";
}

/**
 * Sets `licenseDeclared` on SPDX package row(s) whose `name` equals the product name
 * (e.g. CozyBrewApp from Syft `.app` scan) when Syft left license empty.
 */
export function applyHostPackageLicenseToSpdx(
  doc: Record<string, unknown>,
  options: { packageName: string; licenseId: string },
): number {
  const packages = doc.packages;
  const wantName = options.packageName.trim();
  const licenseId = options.licenseId.trim();
  if (!Array.isArray(packages) || !wantName || !licenseId) {
    return 0;
  }

  let patched = 0;
  for (const pkg of packages) {
    if (!pkg || typeof pkg !== "object") continue;
    const rec = pkg as Record<string, unknown>;
    const name = rec.name;
    if (typeof name !== "string" || name.trim() !== wantName) continue;
    if (!isBlankOrUnknownSpdxLicense(rec.licenseDeclared)) continue;
    rec.licenseDeclared = licenseId;
    patched++;
  }
  return patched;
}
