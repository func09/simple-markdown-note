import { execSync } from "node:child_process";
import fs from "node:fs";
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
  const publicDir = path.join(process.cwd(), ".badges");
  fs.mkdirSync(publicDir, { recursive: true });

  for (const pkg of PACKAGES) {
    const summaryPath = path.join(
      process.cwd(),
      pkg,
      "coverage",
      "coverage-summary.json"
    );
    const name = pkg.split("/")[1];

    if (!fs.existsSync(summaryPath)) {
      console.warn(`Coverage not found for ${pkg}, skipping...`);
      continue;
    }

    try {
      const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
      const pct = summary.total?.statements?.pct ?? 0;

      let color = "red";
      if (pct >= 80) color = "green";
      else if (pct >= 60) color = "orange";

      const badgeName = `${name}-coverage.svg`;
      const badgePath = path.join(publicDir, badgeName);

      const title = name.charAt(0).toUpperCase() + name.slice(1);

      // Execute badgen-cli
      // We assume badgen-cli is installed globally or via npx
      const cmd = `npx badgen-cli -j "${title} Coverage" -s "${pct}%" -c ${color} > ${badgePath}`;
      execSync(cmd, { stdio: "inherit" });

      console.log(`Generated badge for ${pkg}: ${pct}% -> ${badgePath}`);
    } catch (e) {
      console.error(`Failed to process coverage for ${pkg}`, e);
    }
  }
};

main();
