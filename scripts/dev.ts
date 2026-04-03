import { spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const isNative = args.includes("--native");

// --native の場合は Vite キャッシュをクリアする (Tailwind v4 の反映漏れ対策)
if (isNative) {
  const viteCachePath = join(process.cwd(), "apps/web/node_modules/.vite");
  if (existsSync(viteCachePath)) {
    console.log(`> Cleaning Vite cache: ${viteCachePath}`);
    rmSync(viteCachePath, { recursive: true, force: true });
  }
}

// --native があれば全ワークスペース、なければ api と web のみを起動。
const command = isNative
  ? "turbo run dev"
  : "turbo run dev --filter=api --filter=web";

console.log(`> Running: ${command}`);

const child = spawn(command, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, FORCE_COLOR: "true" },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
