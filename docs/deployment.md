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

When deploying updates:
1. Push new image to your registry (e.g. GitHub Container Registry or Harbor).
2. Update the image tag in `k8s/learning-os.yaml`.
3. Run `kubectl apply -f k8s/learning-os.yaml`. Kubernetes performs a rolling update without downtime due to the 2-replica configuration and active readiness probe.

## Secrets

No credentials are committed to Git. The Kubernetes secret is created once on the server:

```bash
cp k8s/secret.example.yaml k8s/secret.yaml   # fill real values
kubectl apply -f k8s/secret.yaml
```

See [Kubernetes guide](kubernetes.md) for the imperative alternative and rotation notes.
