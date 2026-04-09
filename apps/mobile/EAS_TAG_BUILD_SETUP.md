# EAS iOS tag build setup

GitHub tag (`YYYY.MM.DD.N`) push on this repository triggers iOS build on EAS via GitHub Actions.

## 1. One-time Expo/EAS project link

Run in `apps/mobile`:

```bash
pnpm exec eas project:info
```

If not linked, run:

```bash
pnpm exec eas init
```

After linking, keep `EXPO_PUBLIC_EAS_PROJECT_ID` aligned with the linked project ID.

## 2. EAS Environment Variables (project side)

Register these variables in Expo dashboard for the mobile project:

- `EXPO_PUBLIC_EAS_PROJECT_ID`
- `IOS_BUNDLE_IDENTIFIER`
- `APPLE_TEAM_ID`

These are required by `app.config.ts`.

## 3. GitHub repository settings

### Secrets

- `EXPO_TOKEN`: Expo personal access token used by GitHub Actions.

No GitHub Variables are required for mobile build config values.
The workflow pulls `production` variables from EAS (`eas env:pull`) and uses those values directly.

## 4. Trigger build by tag

Tag format: `YYYY.MM.DD.N` (example: `2026.04.09.1`)

```bash
git tag 2026.04.09.1
git push origin 2026.04.09.1
```

Then open GitHub Actions and confirm `Mobile EAS iOS Build` is running.
