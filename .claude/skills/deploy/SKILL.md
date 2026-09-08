---
name: deploy
description: Ship a change to the Tamarin k3s cluster. Use when asked to deploy, ship, release, push a new version, update the running app, or roll back.
---

# Deploying

A deploy is a push. Flux watches this repo and applies `k8s/`; nothing here talks to the
cluster, and there is no `kubectl apply` step to run.

| Branch | Lands in |
|---|---|
| `main` | `yarn-monke-ca-prod` |

There is no dev environment yet — a push to any other branch builds nothing and deploys
nothing.

## Shipping a change

```bash
git add -A && git commit -m "..."
git push
```

CI then does the rest: it builds the image, pushes it to `ghcr.io/monkecloud/monke-ca-site:<sha>`,
and commits that exact tag into `k8s/`. Flux applies that second commit. **Never edit the
image tag by hand and never use `:latest`** — the tag is how rollback works, and a moving
tag means a restarted pod silently changes version.

Watch the build:

```bash
gh run list --limit 3
gh run view --log-failed
```

## Rolling back

```bash
git revert <commit>
git push
```

That is the whole procedure. Reverting the tag-bump commit alone is enough to go back to the
previous image, and it keeps the repo describing exactly what is running. Do not ask the
admin to `kubectl rollout undo` — Flux would put the broken version straight back on its next
reconcile.

## Before pushing

- The manifests are applied with `wait: true`, so a bad manifest fails the reconcile
  loudly rather than half-applying. Nothing is deployed until the whole set is valid.
- New env vars need a matching Secret key in the namespace. Adding one that does not exist
  leaves pods stuck in `CreateContainerConfigError` — ask the admin first.
- A new PVC will be refused: this app is stateless apart from the optional cache.
