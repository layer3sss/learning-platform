# Production Deployment Strategy

## Build Artifacts

The build command:
```bash
npm run build
```
executes two steps:
1. `vite build`: Compiles the client SPA into `/dist`.
2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`: Bundles the Express server into `dist/server.cjs`.

## Health Check Endpoint

Learning OS exposes an HTTP health check at:
```http
GET /api/health
```
Response:
```json
{ "status": "ok", "timestamp": "2026-09-07T00:00:00.000Z" }
```
This is configured as both the Kubernetes Liveness probe and Readiness probe.

## Zero Downtime Upgrades

Deployments are automated by CI (`.github/workflows/ci.yml`). On every push to `main`:

1. Lint, test, and build run; the new image is published to GHCR as `:latest` (and `:sha-<commit>`).
2. A second job runs on the **self-hosted runner** on the cluster server and executes:
   ```bash
   kubectl rollout restart deployment/learning-os-deployment -n devops-learning-os
   kubectl rollout status deployment/learning-os-deployment -n devops-learning-os --timeout=180s
   ```
3. With `imagePullPolicy: Always`, the restarted pods pull the fresh `:latest` image. Kubernetes performs a rolling update without downtime due to the 2-replica configuration and active readiness probe.

The workflow intentionally does **not** run `kubectl apply -f k8s/learning-os.yaml`: the tracked manifest contains an empty Secret placeholder that would overwrite the real secret on the server. Rollout restart is the safe, idempotent deploy for an immutable `:latest` tag.

Manual alternative (when changing the manifest itself): update `k8s/learning-os.yaml`, apply it, then trigger the same rollout restart.

## Secrets

No credentials are committed to Git. The Kubernetes secret is created once on the server:

```bash
cp k8s/secret.example.yaml k8s/secret.yaml   # fill real values
kubectl apply -f k8s/secret.yaml
```

See [Kubernetes guide](kubernetes.md) for the imperative alternative and rotation notes.
