# Kubernetes & k3s Deployment Guide

## Overview

The Kubernetes manifests in `/k8s/learning-os.yaml` provide a self-contained, production-ready specification suitable for:
- Local k3s / k0s / MicroK8s clusters
- Minikube or kind
- Cloud managed clusters (EKS, GKE, AKS)

## Included Resources

1. **Namespace:** `devops-learning-os`
2. **ConfigMap:** `learning-os-config` (Port, Node Environment, DB name/user — non-sensitive values only)
3. **Secret:** `learning-os-secret` (Database password, JWT authentication secret, and connection string)
   - **Not stored in Git.** The tracked manifest contains no secret values.
   - Create the real secret on the cluster server (see "Creating the Secret" below).
4. **PersistentVolumeClaim:** `postgres-pvc` (10Gi persistent volume for database data)
5. **PostgreSQL Deployment & ClusterIP Service:** Single-replica stateful database with health probes
6. **Learning OS Deployment & Service:** Two-replica scalable web service with HTTP liveness/readiness probes (`/api/health`)
7. **Ingress:** Routes hostname `learning-os.local` via Ingress controller (Traefik/Nginx)

## Creating the Secret (on the cluster server)

The Git-tracked `k8s/learning-os.yaml` intentionally contains **no secret values**. Real credentials live only on the server:

```bash
# Option A: from the placeholder template
cp k8s/secret.example.yaml k8s/secret.yaml
# edit k8s/secret.yaml with real values, then:
kubectl apply -f k8s/secret.yaml

# Option B: imperatively, without any file
kubectl -n devops-learning-os create secret generic learning-os-secret \
  --from-literal=POSTGRES_PASSWORD='<strong-random-password>' \
  --from-literal=AUTH_SECRET='<64-char-random-string>'
```

Generate strong values with `openssl rand -hex 32`. If you change `POSTGRES_PASSWORD`, also patch `DATABASE_URL` in the same secret so the connection string matches (command documented in `k8s/secret.example.yaml`).

`k8s/secret.yaml` is git-ignored — only `k8s/secret.example.yaml` (placeholders) is committed.

## Deployment Commands

### Automated (CI/CD, preferred)

Every push to `main` publishes the image to GHCR and then runs
`kubectl rollout restart deployment/learning-os-deployment -n devops-learning-os`
from the **self-hosted runner** on the cluster server, followed by
`kubectl rollout status` (180s timeout). See `.github/workflows/ci.yml`.

Requires: kubectl pre-configured on the runner (`~/.kube/config` pointing at the
k3s cluster) and `imagePullPolicy: Always` on the app container (already set).

### Manual

```bash
# 1. Apply all manifests
kubectl apply -f k8s/learning-os.yaml

# 2. Check rollout status
kubectl rollout status deployment/postgres-deployment -n devops-learning-os
kubectl rollout status deployment/learning-os-deployment -n devops-learning-os

# 3. Add to /etc/hosts (for local cluster)
# <NODE_IP> learning-os.local

# 4. Check services
kubectl get svc -n devops-learning-os
```

After applying the manifest (or after CI pushed a new `:latest` image), roll out manually with:

```bash
kubectl rollout restart deployment/learning-os-deployment -n devops-learning-os
kubectl rollout status deployment/learning-os-deployment -n devops-learning-os --timeout=180s
```
