# EAS iOS tag build setup

Pushing a Git tag matching `YYYY.MM.DD.N` on the linked repository triggers the **EAS Workflow** defined at [`.eas/workflows/mobile-ios-release.yml`](.eas/workflows/mobile-ios-release.yml).

The workflow file is located under `apps/mobile/.eas/workflows/` because the Expo dashboard **Base directory** is set to `/apps/mobile`. EAS discovers workflows relative to this base directory.

The workflow runs on EAS (not via a GitHub Actions workflow in this repo).

The pipeline:

1. Derives app version and iOS build number from the tag.
2. Runs an iOS **production** EAS Build.
3. Submits that build to **App Store Connect** with EAS Submit (`submit_ios` job).

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

These are required by `app.config.ts`.

## 3. App Store Connect submission (CI)

The `submit_ios` job uses the same credentials as `eas submit`. Configure Apple / App Store Connect API access for EAS as described in Expo’s guide:

- [Submitting your app using CI/CD services (iOS)](https://docs.expo.dev/submit/ios#submitting-your-app-using-cicd-services)

Submit profile: `production` (see [`eas.json`](eas.json) `submit.production`).

## 4. Trigger build and submit by tag

Tag format: `YYYY.MM.DD.N` (example: `2026.04.09.1`)

```bash
git tag 2026.04.09.1
git push origin 2026.04.09.1
```

In the Expo dashboard, open **Workflows** for this project and confirm **Mobile iOS Release** ran: build, then submit to App Store Connect.

### Manual run (from `apps/mobile`)

```bash
pnpm exec eas workflow:run .eas/workflows/mobile-ios-release.yml --non-interactive
```

Or: `pnpm eas:workflow:ios-release -- --non-interactive`

**Note:** EAS Submit uploads the binary to App Store Connect (e.g. TestFlight processing). Sending the app to **App Review** may still be done in App Store Connect depending on your release process.
