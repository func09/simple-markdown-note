import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const isNative = args.includes("--native");

// --native があれば全ワークスペース、なければ api と web のみを起動。
const command = isNative
  ? "pnpm -r --parallel dev"
  : "pnpm -F api -F web --parallel dev";

console.log(`> Running: ${command}`);

const child = spawn(command, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, FORCE_COLOR: "true" },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
