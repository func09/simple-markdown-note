import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const getCoveragePaths = () => {
  const dirs = ["apps", "packages"];
  const paths: string[] = [];

  for (const dir of dirs) {
    const dirPath = path.resolve(rootDir, dir);
    if (!fs.existsSync(dirPath)) continue;

    const subDirs = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const subDir of subDirs) {
      paths.push(`${dir}/${subDir}/coverage/index.html`);
    }
  }

  return paths;
};

const files = getCoveragePaths();

for (const file of files) {
  const filePath = path.resolve(rootDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    const pkgName = file.split("/").slice(0, 2).join("/"); // apps/api, packages/database, etc.

    // h1タグ（ページ上部の見出し）を書き換え
    content = content.replace(
      /<h1>All files.*?<\/h1>/,
      `<h1>All files (${pkgName})</h1>`
    );

    // titleタグ（ブラウザタブの名前）を書き換え
    content = content.replace(
      /<title>.*?(All files|Coverage -).*?<\/title>/,
      `<title>Coverage - ${pkgName}</title>`
    );

    fs.writeFileSync(filePath, content);
  }
}

console.log("✅ Patched coverage HTML titles.");
