# SEC-03 / SEC-01 Incident Response Summary

**Date:** 2026-07-22  
**Repository:** `SAFARI-intelligence/safari-intelligence-hub`  
**Branch:** `main`

## Executive Summary

Historical environment files contained exposed API credentials. The credentials must be treated as compromised even after history cleanup. The repository now has an explicit `.env` ignore rule, but the historical purge and provider credential rotation remain incomplete.

The active application AI path is not Anthropic or OpenAI directly. The Supabase `ai-planner` Edge Function and the server helper use `LOVABLE_API_KEY`. Anthropic and OpenAI keys are still compromised because they were committed to Git history, but production configuration must also be checked for the Lovable credential.

## Completed Actions

- Created local rollback refs before remediation:
  - `backup/pre-sec03`
  - `pre-sec03-backup`
- Confirmed those backup refs are local-only and were not found on `origin`.
- Added the explicit literal `.env` rule to `.gitignore`.
- Preserved `.env.*` and `!.env.example` rules.
- Verified `.env` and `.env.local` are ignored while `.env.example` remains trackable.
- Committed the ignore-rule fix as `65f5071`:
  - `fix(sec): add explicit .env ignore rule [SEC-03]`
- Confirmed the worktree is clean after that commit.
- Installed Gitleaks `v8.30.1` and ran a redacted full-history scan.

## Findings

### Historical credential exposure

The following historical commits contain `.env` or secret-related findings:

- `3de5860` — OpenAI key configuration
- `7859885` — Anthropic key configuration
- `e12c685` — `.env` update
- `bd792b8` — historical environment content
- `66e796e` — historical environment content
- `e4c3a04` — added `.env` as part of the prototype implementation
- `68a6cb9` — remote-tracking Lovable branch also has `.env` history

The exposure spans `main` and the remote-tracking `origin/v0/eliteaccess24-5939-257c49ce` branch. Other remote-tracking refs inherit or retain related `.env` path history and must be included in the final scope assessment.

### Active AI provider path

Repository inspection found:

- `supabase/functions/ai-planner/index.ts` reads `LOVABLE_API_KEY`.
- `src/lib/wis-ai.server.ts` reads `LOVABLE_API_KEY`.
- No active Anthropic, OpenAI, Qwen, or DashScope provider selection was found in the inspected source.
- `LOVABLE_API_KEY` appears in repository history as a configuration reference, but it was not found specifically in committed `.env` history.

This means the Lovable credential and its deployment configuration require separate verification. Anthropic and OpenAI rotation remains required because their historical values are compromised regardless of current application usage.

### Gitleaks results

The redacted Gitleaks scan reported **11 findings**. It identified:

- Historical generic API-key and JWT findings in `.env` files.
- Three `curl-auth-header` findings in `src/routes/wildlife.tsx`; these are separate code-level findings and need review to determine whether they are real credentials or false positives.

No credential values were printed or included in this document.

## Outstanding Actions

### Immediate credential response

1. Revoke the exposed Anthropic and OpenAI keys in their provider dashboards.
2. Generate replacement keys without sharing them in chat or committing them.
3. Verify the actual production configuration for `LOVABLE_API_KEY`.
4. Rotate the Lovable key too if it was ever exposed outside the repository or is present in an accessible deployment/configuration history.
5. Update the correct Vercel and Supabase environments, then redeploy and verify a real AI-planner response.

### History cleanup

1. Decide whether the remote `v0/eliteaccess24-5939-257c49ce` branch is stale or an active deployment source.
2. Delete the branch if it is confirmed stale, or rewrite it together with every other affected ref.
3. Run `git filter-repo` across all refs that contain the historical `.env` paths or secret content.
4. Force-push only the intended rewritten branches and tags using `--force-with-lease`.
5. Confirm the following returns no output after the purge:

   ```sh
   git log --all --oneline -- .env
   ```

### Verification and regression protection

- Confirm GitHub Security > Secret scanning has no active alerts. The available GitHub CLI token returned `403` for the secret-scanning API, so this remains a manual check.
- Review the three `curl-auth-header` Gitleaks findings in `src/routes/wildlife.tsx`.
- Install/configure Supabase CLI access and verify deployed Edge Function secrets.
- Add a shared CI secret scan such as Gitleaks or the pre-commit framework with `detect-secrets`.
- Keep the local pre-commit guard that blocks staging a root `.env` file.

## Current Status

| Area | Status |
| --- | --- |
| Diagnosis | Complete |
| Explicit `.env` ignore rule | Complete, commit `65f5071` |
| Anthropic/OpenAI rotation | Manual action outstanding |
| Lovable production credential verification | Outstanding |
| Vercel/Supabase redeploy verification | Outstanding |
| Gitleaks scan | Complete; 11 findings require triage |
| Git history purge | Pending; affected refs must be finalized |
| GitHub secret-scanning verification | Manual; CLI returned `403` |
| Shared regression protection | Pending |

## Safety Notes

- Never paste current, old, or replacement credential values into chat, issues, commits, or logs.
- History rewriting does not make an exposed credential safe; revoke and rotate first.
- Do not push the local backup branch or tag.
- Do not delete or rewrite the Lovable-generated branch until its deployment role is confirmed.