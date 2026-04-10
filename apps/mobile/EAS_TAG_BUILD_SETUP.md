# EAS iOS tag build setup

Pushing a Git tag matching **SemVer** (`v` prefix) on the linked repository triggers the **EAS Workflow** defined at [`.eas/workflows/mobile-ios-release.yml`](.eas/workflows/mobile-ios-release.yml).

EAS tag filters only support `*` wildcards (not bracket character classes like GitHub Actions). The workflow uses `v*.*.*` and `v*.*.*-*` for stable and pre-release tags.

The workflow file is located under `apps/mobile/.eas/workflows/` because the Expo dashboard **Base directory** is set to `/apps/mobile`. EAS discovers workflows relative to this base directory.

The workflow runs on EAS (not via a GitHub Actions workflow in this repo).

The pipeline:

1. Derives **app version** (`EXPO_APP_VERSION`) from the tag by stripping the leading `v` (e.g. `v1.2.3` → `1.2.3`, `v1.0.0-beta.1` → `1.0.0-beta.1`).
2. Sets **iOS build number** (`IOS_BUILD_NUMBER`) to the current **Unix epoch seconds** at workflow run time so each upload to App Store Connect is strictly monotonic (independent of SemVer pre-release labels).
3. Runs an iOS **production** EAS Build.

This workflow does **not** submit to App Store Connect. After the build finishes, submit via the Expo dashboard, `eas submit`, or another automation you control.

## 1. One-time Expo/EAS project link

Run in `apps/mobile`:

```bash
pnpm exec eas project:info
```

If not linked, run:

```bash
pnpm exec eas init
```

Connect the Git provider in the Expo dashboard so EAS Workflows can run on tag pushes.

After linking, keep `EXPO_PUBLIC_EAS_PROJECT_ID` aligned with the linked project ID.

## 2. EAS Environment Variables (project side)

Register these variables in Expo dashboard for the mobile project (e.g. `production` environment):

- `EXPO_PUBLIC_EAS_PROJECT_ID`
- `IOS_BUNDLE_IDENTIFIER`
- `APPLE_TEAM_ID`
- `ASC_APP_ID` — App Store Connect **numeric** Apple ID for this app (not your login email). Find it under **App Store Connect → your app → App Information → General Information → Apple ID**. See [expo.fyi/asc-app-id](https://expo.fyi/asc-app-id). Used when running **`eas submit`** (e.g. local or CI outside this workflow); not consumed by the tag workflow itself.

## 3. App Store Connect submission (after the tag build)

The tag workflow does **not** run EAS Submit. To upload a finished build to App Store Connect, use Expo’s guide and configure Apple / App Store Connect API access for EAS:

- [Submitting your app using CI/CD services (iOS)](https://docs.expo.dev/submit/ios#submitting-your-app-using-cicd-services)

Submit profile: `production` (see [`eas.json`](eas.json) `submit.production`). Set `ascAppId` in `eas.json` or via dashboard as required by `eas submit`.

## 4. Trigger build by tag

Tag format: **SemVer with a `v` prefix** (matches `vX.Y.Z` or pre-releases like `vX.Y.Z-label.N`).

Examples:

- `v0.1.0` — first pre-1.0 release
- `v1.0.0-beta.1` — pre-release
- `v1.0.0`

```bash
git tag v0.1.0
git push origin v0.1.0
```

Use the **same tag convention** as the desktop app ([`.github/workflows/desktop-release.yml`](../../.github/workflows/desktop-release.yml)) so both clients ship the same marketing version.

In the Expo dashboard, open **Workflows** for this project and confirm **Mobile iOS Release** ran (build only).

### Manual run (from `apps/mobile`)

```bash
pnpm exec eas workflow:run .eas/workflows/mobile-ios-release.yml --non-interactive
```

Or: `pnpm eas:workflow:ios-release -- --non-interactive`

**Note:** `eas submit` uploads the binary to App Store Connect (e.g. TestFlight processing). Sending the app to **App Review** may still be done in App Store Connect depending on your release process.
