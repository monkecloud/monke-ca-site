# monke-ca

The monke.ca website. It runs on the Tamarin k3s cluster in a namespace of its own,
`yarn-monke-ca-prod`, and everything it runs is described by `k8s/` in this repo.

There is no dev environment yet. Adding one is a `dev` branch here plus a
`yarn-monke-ca-dev` overlay in the infra repo — the manifests below need no changes,
because an environment is a namespace rather than a variant inside one.

## Deploying is pushing

Flux watches this repo and applies `k8s/` — nothing is deployed by hand, and nothing
reaches into the cluster from outside.

- push to **`main`** → `yarn-monke-ca-prod`

CI builds the image, pushes it to `ghcr.io/monkecloud/monke-ca-site`, and commits the new tag
into `k8s/`. That commit is what Flux picks up. A rollback is `git revert` plus a push —
never an out-of-band change, or the repo stops describing what is running.

Both branches deploy the **same manifests**. There are no per-environment name suffixes:
the environments are different namespaces.

## What this site talks to

**Nothing.** It is static HTML, CSS and assets, baked into an nginx image by the
Dockerfile. No database, no bucket, no cache, no environment variables, and no
Secrets in its namespace — so there is nothing to leak and nothing to break at
runtime. If that ever changes, the cluster has a shared Postgres and an
S3-compatible store, and the admin adds the credentials to the namespace.

The image is `nginxinc/nginx-unprivileged`, which runs as uid 101 and listens on
8080. That is why the pod satisfies the stricter `restricted` Pod Security
profile rather than only `baseline`, and why the container port is 8080 and not
80. The nginx config is written into the image; it is deliberately not left in
the web root.

## Hard constraints

- **Stay stateless.** No PersistentVolumeClaim except the optional cache above. Durable
  state belongs in Postgres or the bucket — those are the only two replicated stores.
- **Namespace-scoped only.** No ClusterRoles, CRDs, namespaces or PersistentVolumes. Flux
  applies this repo as a ServiceAccount that cannot create them, so such a manifest fails
  the whole reconcile rather than partly applying.
- **Egress is restricted.** Reachable: Postgres, Garage, cluster DNS, this namespace's own
  pods, and the public internet. Not reachable: the Kubernetes API, other apps, the house
  LAN. A blocked connection **hangs** rather than erroring — that is this, not a bug to
  route around.
- **Pod Security `baseline` is enforced.** No `privileged`, no `hostPath`, no
  `hostNetwork`/`hostPID`, no host ports. Warnings about the stricter `restricted` profile
  are advisory.
- **Resource budget** per namespace: 10 pods, 1 CPU / 2Gi requested, 2 CPU / 4Gi limit,
  3 PVCs. Nodes are 4-core with 1GbE between them.

## Static content

Content lives in this repo and is baked into the image by the Dockerfile, so it is
versioned with the code and a deploy is one new tag. There is no bucket to upload to —
Garage is for application data, not site content.

## Checking on things

Cluster access is the admin's, not this repo's — there is no kubeconfig here and the API is
not reachable from outside the house. What this repo can see is CI: whether the build passed
and whether the tag-bump commit landed. If a deploy does not appear, ask the cluster admin to
check the Flux Kustomization for this namespace; a failed one names the offending manifest.
