# Release process

## Before creating a tag

1. Update `package.json` version.
2. Add a complete release note file at `release-notes/<version>.md`.
3. Run local validation:

   ```bash
   npm test
   npm run build
   npx electron-builder --win nsis --x64 --publish never
   ```

4. Commit and push the changes to `main`.
5. Create and push a matching tag:

   ```bash
   git tag v<version>
   git push origin v<version>
   ```

The GitHub Release workflow refuses to publish a tag if `release-notes/<version>.md` is missing or empty. Release notes are published from that file instead of GitHub's generated commit list.

## Installer behavior

The Windows installer is an assisted NSIS installer:

- users must accept the installation and usage disclaimer before installation;
- users can choose the installation directory;
- installer artifacts are built by GitHub Actions and uploaded to GitHub Releases.

## Browser and SmartScreen warnings

GitHub Artifact Attestation proves where a release artifact was built, but it is not the same thing as Windows Authenticode code signing.

Unsigned or low-reputation installers may still trigger browser or Windows warnings such as “not commonly downloaded”. To reduce these warnings, configure Windows code signing for the release workflow.

Repository secrets supported by the workflow:

- `WINDOWS_CSC_LINK`: base64-encoded `.pfx` certificate, HTTPS URL, `file://` path, or local path supported by electron-builder.
- `WINDOWS_CSC_KEY_PASSWORD`: certificate password.

After these secrets are configured, the release workflow will pass them to electron-builder through `CSC_LINK`, `CSC_KEY_PASSWORD`, `WIN_CSC_LINK`, and `WIN_CSC_KEY_PASSWORD`.
