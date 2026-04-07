import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PACKAGES = [
  "apps/web",
  "apps/api",
  "apps/desktop",
  "apps/mobile",
  "packages/schemas",
  "packages/database",
  "packages/api-client",
  "packages/emails",
];

const main = () => {
  const nycOutputDir = fs.mkdtempSync(path.join(os.tmpdir(), "nyc-merge-"));

  let hasCoverage = false;

  for (const pkg of PACKAGES) {
    const finalPath = path.join(
      process.cwd(),
      pkg,
      "coverage",
      "coverage-final.json"
    );

    if (fs.existsSync(finalPath)) {
      const pkgName = pkg.replace(/\//g, "-");
      const destPath = path.join(nycOutputDir, `${pkgName}.json`);
      fs.copyFileSync(finalPath, destPath);
      hasCoverage = true;
      console.log(`Copied coverage from ${pkg}`);
    }
  }

  if (!hasCoverage) {
    console.log("No coverage-final.json files found to merge.");
    return;
  }

  console.log("Merging coverage reports...");

  try {
    // 1. Merge into a single out.json
    execSync(
      `npx -y nyc merge ${nycOutputDir} ${path.join(nycOutputDir, "out.json")}`,
      {
        stdio: "inherit",
      }
    );

    // 2. Generate summary formats from the merged json
    execSync(
      `npx -y nyc report -t ${nycOutputDir} --report-dir coverage --reporter=json-summary --reporter=json`,
      { stdio: "inherit" }
    );

    // The unified summary is now at coverage/coverage-summary.json
    // The unified final is at coverage/coverage-final.json
    console.log("Coverage successfully merged into coverage/ folder.");
  } catch (error) {
    console.error("Failed to merge coverage reports", error);
    process.exit(1);
  }
};

main();
