import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const packageJsonPath = path.resolve("package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

const scaffoldXpiPath = path.resolve(".scaffold/build/metadata-updater.xpi");
if (!fs.existsSync(scaffoldXpiPath)) {
  process.exit(0);
}

const versionedScaffoldXpiPath = path.resolve(
  `.scaffold/build/metadata-updater-${version}.xpi`,
);
const versionedRootXpiPath = path.resolve(`metadata-updater-${version}.xpi`);
const legacyRootXpiPath = path.resolve("metadata-updater.xpi");

fs.copyFileSync(scaffoldXpiPath, versionedScaffoldXpiPath);
fs.copyFileSync(scaffoldXpiPath, versionedRootXpiPath);

if (fs.existsSync(legacyRootXpiPath)) {
  fs.rmSync(legacyRootXpiPath);
}
