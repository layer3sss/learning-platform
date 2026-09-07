/**
 * DevOps Learning OS - Initial Curriculum Seed Data
 * Covers Roadmap Levels 0-5 with projects, tasks, skills, and learning objectives.
 */

export const INITIAL_SKILLS = [
  { id: 'skill-linux', name: 'Linux', category: 'OS & Systems', description: 'Linux system fundamentals, CLI navigation, and core utilities', maxLevel: 5 },
  { id: 'skill-bash', name: 'Bash Scripting', category: 'Automation', description: 'Shell automation, pipes, redirections, loops, and scripts', maxLevel: 5 },
  { id: 'skill-git', name: 'Git & Version Control', category: 'Collaboration', description: 'Branching strategies, rebasing, merge resolution, and Git workflows', maxLevel: 5 },
  { id: 'skill-networking', name: 'Networking Fundamentals', category: 'Networking', description: 'TCP/IP, DNS, routing, CIDR, firewalls, and ports', maxLevel: 5 },
  { id: 'skill-ssh', name: 'SSH & Remote Administration', category: 'Security & Access', description: 'Key pairs, agent forwarding, secure tunneling, and bastion hosts', maxLevel: 5 },
  { id: 'skill-systemd', name: 'systemd & Service Management', category: 'OS & Systems', description: 'Unit files, timers, process isolation, and journalctl debugging', maxLevel: 5 },
  { id: 'skill-nginx', name: 'Nginx & Reverse Proxies', category: 'Web & Ingress', description: 'Reverse proxying, SSL/TLS termination, and load balancing', maxLevel: 5 },
  { id: 'skill-docker', name: 'Docker & Containerization', category: 'Containers', description: 'Container runtime, Dockerfiles, caching, multi-stage builds', maxLevel: 5 },
  { id: 'skill-docker-compose', name: 'Docker Compose', category: 'Containers', description: 'Multi-container orchestration, networks, volumes, and environments', maxLevel: 5 },
  { id: 'skill-github-actions', name: 'GitHub Actions & CI/CD', category: 'CI/CD', description: 'Workflows, triggers, matrix builds, secrets, and artifact publishing', maxLevel: 5 },
  { id: 'skill-ghcr', name: 'Container Registries (GHCR)', category: 'CI/CD', description: 'Image tagging, registry authentication, and image vulnerability scanning', maxLevel: 5 },
  { id: 'skill-k8s', name: 'Kubernetes Core', category: 'Orchestration', description: 'Control plane, worker nodes, manifests, and declarative architecture', maxLevel: 5 },
  { id: 'skill-k8s-workloads', name: 'Kubernetes Workloads', category: 'Orchestration', description: 'Pods, Deployments, ReplicaSets, and rollout strategies', maxLevel: 5 },
  { id: 'skill-k8s-networking', name: 'Kubernetes Networking & Services', category: 'Orchestration', description: 'ClusterIP, NodePort, LoadBalancer, and Ingress controllers', maxLevel: 5 },
  { id: 'skill-k8s-storage', name: 'Kubernetes Storage', category: 'Orchestration', description: 'PersistentVolumes, PersistentVolumeClaims, and StorageClasses', maxLevel: 5 },
  { id: 'skill-k8s-troubleshoot', name: 'Kubernetes Troubleshooting', category: 'Troubleshooting', description: 'kubectl debug, logs, events, probe failures, and crash loops', maxLevel: 5 },
  { id: 'skill-terraform', name: 'Terraform & OpenTofu', category: 'Infrastructure as Code', description: 'State management, modules, providers, and plan/apply workflows', maxLevel: 5 },
  { id: 'skill-ansible', name: 'Ansible', category: 'Configuration Management', description: 'Playbooks, roles, inventory management, and idempotent runs', maxLevel: 5 },
  { id: 'skill-prometheus', name: 'Prometheus & Metrics', category: 'Observability', description: 'Metric types, scrape targets, PromQL, and alerting rules', maxLevel: 5 },
  { id: 'skill-grafana', name: 'Grafana Dashboards', category: 'Observability', description: 'Visualizing telemetry, panels, alerts, and dashboard variables', maxLevel: 5 },
  { id: 'skill-security', name: 'DevSecOps & RBAC', category: 'Security', description: 'Least privilege, RBAC policies, NetworkPolicies, and secret hygiene', maxLevel: 5 },
  { id: 'skill-gitops', name: 'GitOps & Argo CD', category: 'GitOps', description: 'Declarative cluster sync, reconciliation loops, and automated rollouts', maxLevel: 5 }
];

export const INITIAL_ROADMAP = [
  {
    levelNumber: 0,
    title: 'Level 0 — DevOps Lab',
    description: 'Establish the foundation: terminal workflows, version control, networking basics, and SSH connectivity.',
    topics: ['Linux Terminal', 'Bash Basics', 'Git Workflows', 'Local Networking', 'SSH Key Authentication', 'Server Admin Basics'],
    order: 0,
    projects: [
      {
        id: 'proj-0-1',
        title: 'Workstation Setup & Linux Lab Environment',
        description: 'Provision a local or virtual Linux environment with command-line tools, Git setup, and passwordless SSH authentication.',
        objective: 'Configure a clean terminal environment, manage dotfiles with Git, and verify SSH key pair connectivity to a remote host.',
        order: 1,
        requiredSkills: ['skill-linux', 'skill-bash', 'skill-git', 'skill-ssh'],
        tasks: [
          {
            id: 'task-0-1-1',
            title: 'Configure Terminal & Shell Environment',
            description: 'Set up your shell profile with essential DevOps aliases, environment variables, and verify PATH resolution.',
            objective: 'Understand shell startup files (.bashrc/.zshrc) and customize the prompt and command history.',
            order: 1,
            difficulty: 'BEGINNER' as const,
            expectedSkills: [{ skillId: 'skill-bash', expectedLevel: 1 }]
          },
          {
            id: 'task-0-1-2',
            title: 'Generate & Deploy SSH Keypairs',
            description: 'Generate an ed25519 SSH keypair, configure ~/.ssh/config for host aliasing, and verify key-based authentication.',
            objective: 'Master secure remote access without passwords and understand permissions on ~/.ssh and authorized_keys.',
            order: 2,
            difficulty: 'BEGINNER' as const,
            expectedSkills: [{ skillId: 'skill-ssh', expectedLevel: 1 }, { skillId: 'skill-linux', expectedLevel: 1 }]
          },
          {
            id: 'task-0-1-3',
            title: 'Initialize Git Repository & Dotfiles Tracking',
            description: 'Initialize a local git repository to track configuration, configure .gitignore, and create meaningful atomic commits.',
            objective: 'Demonstrate basic Git commands: init, status, add, commit, branch, and remote origin.',
            order: 3,
            difficulty: 'BEGINNER' as const,
            expectedSkills: [{ skillId: 'skill-git', expectedLevel: 1 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 1,
    title: 'Level 1 — Linux Server',
    description: 'Build and configure a production-ready Linux server from the ground up.',
    topics: ['Filesystem Hierarchy', 'Users & Groups', 'Permissions (chmod/chown)', 'Processes & Signals', 'systemd Services', 'Package Management', 'UFW Firewall'],
    order: 1,
    projects: [
      {
        id: 'proj-1-1',
        title: 'Hardened Linux Server Configuration',
        description: 'Configure a freshly provisioned Linux instance with dedicated service accounts, POSIX permissions, and custom systemd units.',
        objective: 'Demonstrate deep understanding of Linux system internals, user isolation, and process supervision.',
        order: 1,
        requiredSkills: ['skill-linux', 'skill-systemd', 'skill-networking'],
        tasks: [
          {
            id: 'task-1-1-1',
            title: 'Create Non-Root User & Sudoers Isolation',
            description: 'Provision an unprivileged operator account with sudo privileges and disable direct root SSH logins.',
            objective: 'Enforce principle of least privilege and lock down server access.',
            order: 1,
            difficulty: 'BEGINNER' as const,
            expectedSkills: [{ skillId: 'skill-linux', expectedLevel: 2 }]
          },
          {
            id: 'task-1-1-2',
            title: 'Manage System Services with systemd',
            description: 'Write a custom systemd unit file with restart policies, resource limits, and inspect logs via journalctl.',
            objective: 'Understand daemon supervision, service lifecycles, and unit dependency declarations.',
            order: 2,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-systemd', expectedLevel: 2 }]
          },
          {
            id: 'task-1-1-3',
            title: 'Inspect Networking & Configure Firewall Rules',
            description: 'Analyze open listening ports using ss/netstat and configure iptables/ufw to only allow ports 22, 80, and 443.',
            objective: 'Verify inbound network filtering and network interface states.',
            order: 3,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-networking', expectedLevel: 2 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 2,
    title: 'Level 2 — Web Application',
    description: 'Deploy real web applications behind reverse proxies with TLS, custom domains, and access logging.',
    topics: ['HTTP Protocol & Headers', 'Nginx Reverse Proxy', 'DNS Records (A, CNAME)', 'Let\'s Encrypt TLS', 'Log Aggregation & Analysis'],
    order: 2,
    projects: [
      {
        id: 'proj-2-1',
        title: 'Deploy Nginx Reverse Proxy with Upstream Backend',
        description: 'Set up an upstream application listening on localhost and proxy public traffic through Nginx with custom headers and error handling.',
        objective: 'Route HTTP traffic, forward client IP headers, and inspect access/error logs.',
        order: 1,
        requiredSkills: ['skill-nginx', 'skill-networking', 'skill-linux'],
        tasks: [
          {
            id: 'task-2-1-1',
            title: 'Configure Nginx Virtual Host & Proxy Pass',
            description: 'Create a server block that routes requests to an internal application backend running on 127.0.0.1:8080.',
            objective: 'Master proxy_pass, proxy_set_header Host, and X-Forwarded-For configuration.',
            order: 1,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-nginx', expectedLevel: 2 }]
          },
          {
            id: 'task-2-1-2',
            title: 'Set up DNS & Troubleshoot HTTP Status Codes',
            description: 'Map local /etc/hosts or DNS entries and debug 502 Bad Gateway and 504 Gateway Timeout simulation scenarios.',
            objective: 'Diagnose upstream connectivity failures and analyze HTTP response headers.',
            order: 2,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-networking', expectedLevel: 2 }, { skillId: 'skill-nginx', expectedLevel: 2 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 3,
    title: 'Level 3 — Containers',
    description: 'Containerize multi-tier applications using Docker, optimize image layers, and orchestrate with Docker Compose.',
    topics: ['Docker Architecture', 'Multi-Stage Dockerfiles', 'Layer Caching', 'Named Volumes', 'Bridge Networks', 'Docker Compose'],
    order: 3,
    projects: [
      {
        id: 'proj-3-1',
        title: 'Production Dockerfile & Compose Stack',
        description: 'Build a minimal multi-stage Dockerfile for a full-stack service, write a docker-compose.yml with health checks and persistent volumes.',
        objective: 'Eliminate build bloat, enforce non-root container users, and test service recovery.',
        order: 1,
        requiredSkills: ['skill-docker', 'skill-docker-compose'],
        tasks: [
          {
            id: 'task-3-1-1',
            title: 'Author Multi-Stage Dockerfile',
            description: 'Build an application in a builder stage and copy only static/compiled binaries into an unprivileged distroless/alpine runtime image.',
            objective: 'Produce images under 50MB with zero compiler dependencies in the runtime container.',
            order: 1,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-docker', expectedLevel: 3 }]
          },
          {
            id: 'task-3-1-2',
            title: 'Compose Multi-Tier Stack with Network Isolation',
            description: 'Run frontend, API, and PostgreSQL on isolated user-defined bridge networks with named volumes for data persistence.',
            objective: 'Demonstrate container DNS service discovery and volume survival across container teardowns.',
            order: 2,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-docker-compose', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 4,
    title: 'Level 4 — CI/CD',
    description: 'Automate testing, linting, image builds, and container registry publishing with GitHub Actions.',
    topics: ['GitHub Actions Workflows', 'CI Testing Matrix', 'GitHub Container Registry (GHCR)', 'Semantic Versioning', 'Automated Deployment Triggers'],
    order: 4,
    projects: [
      {
        id: 'proj-4-1',
        title: 'Automated CI/CD Pipeline to GHCR',
        description: 'Construct a reusable GitHub Actions workflow that lints, runs unit tests, builds Docker containers, and pushes versioned images to GHCR.',
        objective: 'Implement zero-touch build and release automation on every git push and tag.',
        order: 1,
        requiredSkills: ['skill-github-actions', 'skill-ghcr', 'skill-docker'],
        tasks: [
          {
            id: 'task-4-1-1',
            title: 'Create Lint & Test Automation Workflow',
            description: 'Write .github/workflows/ci.yml to run automated tests with caching for node_modules/pip on pull requests.',
            objective: 'Fail the build fast when code styling or unit tests do not pass.',
            order: 1,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-github-actions', expectedLevel: 2 }]
          },
          {
            id: 'task-4-1-2',
            title: 'Build & Publish Container to GHCR with Buildx',
            description: 'Use docker/build-push-action with GitHub Secrets to push multi-arch containers tagged with git SHA and semver tags.',
            objective: 'Master container registry authentication and automated image promotion.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-ghcr', expectedLevel: 3 }, { skillId: 'skill-github-actions', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 5,
    title: 'Level 5 — Kubernetes',
    description: 'Deploy, scale, and manage containerized workloads in a real Kubernetes cluster.',
    topics: ['Pods & ReplicaSets', 'Deployments & Rolling Updates', 'ClusterIP / NodePort Services', 'ConfigMaps & Secrets', 'PersistentVolumeClaims', 'Ingress Controllers'],
    order: 5,
    projects: [
      {
        id: 'proj-5-1',
        title: 'Production Kubernetes Workload Deployment',
        description: 'Deploy a high-availability multi-tier application with declarative YAML manifests, liveness/readiness probes, and storage claims.',
        objective: 'Orchestrate resilient services with zero downtime updates and persistent storage.',
        order: 1,
        requiredSkills: ['skill-k8s', 'skill-k8s-workloads', 'skill-k8s-networking', 'skill-k8s-storage'],
        tasks: [
          {
            id: 'task-5-1-1',
            title: 'Write Declarative Deployment with Health Probes',
            description: 'Create a Deployment manifest with 3 replicas, resource requests/limits, and HTTP liveness and readiness probes.',
            objective: 'Understand how Kubernetes ensures zero-downtime rolling updates and restarts unhealthy pods.',
            order: 1,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-k8s-workloads', expectedLevel: 3 }]
          },
          {
            id: 'task-5-1-2',
            title: 'Expose Application via Service & Ingress',
            description: 'Create a ClusterIP Service and Ingress resource to route incoming cluster traffic with path-based routing.',
            objective: 'Master internal cluster networking and North-South traffic ingress.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-k8s-networking', expectedLevel: 3 }]
          },
          {
            id: 'task-5-1-3',
            title: 'Attach PersistentVolumeClaim to Stateful Backend',
            description: 'Provision a PersistentVolumeClaim with ReadWriteOnce access mode and mount it into a PostgreSQL Pod.',
            objective: 'Ensure database data persists across Pod restarts and node rescheduling.',
            order: 3,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-k8s-storage', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 6,
    title: 'Level 6 — Kubernetes Troubleshooting',
    description: 'Debug broken clusters like a staff engineer: events, logs, probes, and crash loops.',
    topics: ['kubectl debug & events', 'CrashLoopBackOff', 'Probe Failures', 'Resource Quotas', 'NetworkPolicy Debugging'],
    order: 6,
    projects: [
      {
        id: 'proj-6-1',
        title: 'Break & Fix a Kubernetes Deployment',
        description: 'Diagnose deliberately broken workloads: bad images, failing probes, OOMKills, and DNS failures.',
        objective: 'Build a systematic debugging methodology using kubectl events, logs, describe, and ephemeral containers.',
        order: 1,
        requiredSkills: ['skill-k8s-troubleshoot', 'skill-k8s-workloads'],
        tasks: [
          {
            id: 'task-6-1-1',
            title: 'Diagnose CrashLoopBackOff & Image Errors',
            description: 'Fix a Deployment stuck in CrashLoopBackOff and an ImagePullBackOff caused by a wrong tag and missing secret.',
            objective: 'Correlate pod events, container exit codes, and image pull errors to root cause.',
            order: 1,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-k8s-troubleshoot', expectedLevel: 2 }]
          },
          {
            id: 'task-6-1-2',
            title: 'Debug Failing Liveness Probes & OOMKills',
            description: 'Tune liveness/readiness probe thresholds and right-size requests/limits to stop restart storms.',
            objective: 'Understand how probe misconfiguration and memory limits interact to kill healthy pods.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-k8s-troubleshoot', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 7,
    title: 'Level 7 — Terraform & Infrastructure as Code',
    description: 'Declare your homelab infrastructure in code: providers, state, modules, and plan/apply discipline.',
    topics: ['Providers & Resources', 'State Management', 'Variables & Outputs', 'Modules', 'Plan/Apply Workflows'],
    order: 7,
    projects: [
      {
        id: 'proj-7-1',
        title: 'Codify a VM & DNS Infrastructure',
        description: 'Provision infrastructure (VMs, DNS records, firewall rules) with Terraform/OpenTofu and manage state safely.',
        objective: 'Treat infrastructure as disposable, reviewable code with remote state and locking.',
        order: 1,
        requiredSkills: ['skill-terraform', 'skill-networking'],
        tasks: [
          {
            id: 'task-7-1-1',
            title: 'First Apply: Provision & Destroy Safely',
            description: 'Write a provider config and resource, run plan/apply/destroy, and inspect the state file.',
            objective: 'Understand declarative diffing and why state is the source of truth.',
            order: 1,
            difficulty: 'BEGINNER' as const,
            expectedSkills: [{ skillId: 'skill-terraform', expectedLevel: 2 }]
          },
          {
            id: 'task-7-1-2',
            title: 'Refactor into Reusable Modules',
            description: 'Extract a VM module with variables and outputs; compose it for multiple environments.',
            objective: 'Design module interfaces and avoid copy-paste infrastructure.',
            order: 2,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-terraform', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 8,
    title: 'Level 8 — Ansible & Configuration Management',
    description: 'Configure fleets of servers declaratively with idempotent playbooks and roles.',
    topics: ['Inventory', 'Playbooks', 'Roles & Galaxy', 'Idempotency', 'Handlers & Templates'],
    order: 8,
    projects: [
      {
        id: 'proj-8-1',
        title: 'Automate Server Hardening with Ansible',
        description: 'Roll out user accounts, SSH hardening, packages, and systemd services across multiple hosts with roles.',
        objective: 'Make server configuration repeatable, reviewable, and idempotent.',
        order: 1,
        requiredSkills: ['skill-ansible', 'skill-linux', 'skill-ssh'],
        tasks: [
          {
            id: 'task-8-1-1',
            title: 'First Playbook Against a Real Host',
            description: 'Build an inventory, write a playbook installing packages and copying config, and verify idempotent re-runs.',
            objective: 'Master inventory groups, modules, and change reporting.',
            order: 1,
            difficulty: 'BEGINNER' as const,
            expectedSkills: [{ skillId: 'skill-ansible', expectedLevel: 2 }]
          },
          {
            id: 'task-8-1-2',
            title: 'Role-Based Nginx Deployment with Templates',
            description: 'Package an nginx role with Jinja2 templates, handlers, and defaults; apply it to a web group.',
            objective: 'Structure automation for reuse and use handlers for service reloads.',
            order: 2,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-ansible', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 9,
    title: 'Level 9 — Monitoring & Observability',
    description: 'See your systems: metrics pipelines, dashboards, and actionable alerting.',
    topics: ['Prometheus Architecture', 'PromQL', 'Exporters & Scrape Targets', 'Grafana Dashboards', 'Alert Rules'],
    order: 9,
    projects: [
      {
        id: 'proj-9-1',
        title: 'Homelab Metrics Stack',
        description: 'Deploy Prometheus and Grafana (compose or k8s), scrape node exporters, and build operational dashboards.',
        objective: 'Turn raw metrics into answers: is it up, is it fast, is it about to fall over?',
        order: 1,
        requiredSkills: ['skill-prometheus', 'skill-grafana', 'skill-docker-compose'],
        tasks: [
          {
            id: 'task-9-1-1',
            title: 'Run Prometheus & Scrape Real Targets',
            description: 'Configure scrape jobs for node_exporter and your own apps; query with PromQL.',
            objective: 'Understand the pull model, target relabeling, and rate/increase functions.',
            order: 1,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-prometheus', expectedLevel: 2 }]
          },
          {
            id: 'task-9-1-2',
            title: 'Grafana Dashboard & Alert Rules',
            description: 'Build CPU/memory/disk dashboards with variables and define alert rules that page on real symptoms.',
            objective: 'Practice SLO thinking: alert on symptoms, not causes.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-grafana', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 10,
    title: 'Level 10 — Security & DevSecOps',
    description: 'Defend the lab: least privilege, RBAC, network policies, and secret hygiene.',
    topics: ['Kubernetes RBAC', 'NetworkPolicies', 'Secret Management', 'Image Scanning', 'Least Privilege'],
    order: 10,
    projects: [
      {
        id: 'proj-10-1',
        title: 'Harden the Cluster',
        description: 'Apply RBAC roles, default-deny NetworkPolicies, and scan images for vulnerabilities.',
        objective: 'Apply zero-trust principles inside a real cluster without breaking workloads.',
        order: 1,
        requiredSkills: ['skill-security', 'skill-k8s-networking'],
        tasks: [
          {
            id: 'task-10-1-1',
            title: 'RBAC: Least-Privilege Service Accounts',
            description: 'Create Roles/RoleBindings granting a CI service account only the verbs it needs.',
            objective: 'Understand authentication vs authorization and audit with kubectl auth can-i.',
            order: 1,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-security', expectedLevel: 3 }]
          },
          {
            id: 'task-10-1-2',
            title: 'Default-Deny NetworkPolicy Rollout',
            description: 'Lock down namespace traffic with a default-deny policy, then allow exactly what the app needs.',
            objective: 'Reason about ingress/egress selectors and DNS exceptions.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-security', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 11,
    title: 'Level 11 — GitOps & Continuous Delivery',
    description: 'Let Git drive the cluster: reconciliation loops, drift detection, and automated rollouts.',
    topics: ['GitOps Principles', 'Argo CD', 'Application CRDs', 'Sync & Drift', 'Promotion Strategies'],
    order: 11,
    projects: [
      {
        id: 'proj-11-1',
        title: 'Argo CD Manages the Homelab',
        description: 'Install Argo CD, onboard your k8s manifests from Git, and manage rollouts through commits.',
        objective: 'Make the cluster state declaratively defined in Git and self-healing.',
        order: 1,
        requiredSkills: ['skill-gitops', 'skill-k8s', 'skill-github-actions'],
        tasks: [
          {
            id: 'task-11-1-1',
            title: 'Bootstrap Argo CD & First Application',
            description: 'Install Argo CD, register a Git repo, and deploy an app via an Application CRD.',
            objective: 'Understand reconciliation, sync status, and health assessment.',
            order: 1,
            difficulty: 'INTERMEDIATE' as const,
            expectedSkills: [{ skillId: 'skill-gitops', expectedLevel: 2 }]
          },
          {
            id: 'task-11-1-2',
            title: 'Git-Driven Rollout & Rollback',
            description: 'Ship a new image tag by committing it; roll back by reverting; watch Argo sync drift.',
            objective: 'Experience Git as the single interface to operations.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-gitops', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 12,
    title: 'Level 12 — Platform Engineering',
    description: 'Build the platform others deploy on: ingress, certificates, namespaces, and self-service.',
    topics: ['Cluster Bootstrap (k3s)', 'Ingress & TLS Automation', 'Namespace Standards', 'Resource Governance', 'Backups'],
    order: 12,
    projects: [
      {
        id: 'proj-12-1',
        title: 'Homelab Platform Foundation',
        description: 'Stand up cluster ingress with automated TLS, namespace standards, quotas, and a backup strategy.',
        objective: 'Operate your cluster as a product with guardrails instead of hand-built snowflakes.',
        order: 1,
        requiredSkills: ['skill-k8s', 'skill-k8s-networking', 'skill-security'],
        tasks: [
          {
            id: 'task-12-1-1',
            title: 'Ingress + Automated TLS (cert-manager)',
            description: 'Deploy an ingress controller and cert-manager; issue certificates for internal domains.',
            objective: 'Automate certificate lifecycle instead of manual cert wrangling.',
            order: 1,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-k8s-networking', expectedLevel: 4 }]
          },
          {
            id: 'task-12-1-2',
            title: 'Namespace Standards, Quotas & Backups',
            description: 'Define namespace conventions, apply ResourceQuotas/LimitRanges, and schedule volume backups.',
            objective: 'Prevent noisy neighbors and data loss with governance, not heroics.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-k8s-storage', expectedLevel: 3 }, { skillId: 'skill-security', expectedLevel: 3 }]
          }
        ]
      }
    ]
  },
  {
    levelNumber: 13,
    title: 'Level 13 — Capstone: Run It Like Production',
    description: 'Everything together: a full platform lifecycle from code commit to monitored, backed-up production service.',
    topics: ['End-to-End Pipeline', 'SLOs & Runbooks', 'Incident Response', 'Capacity Planning', 'Documentation'],
    order: 13,
    projects: [
      {
        id: 'proj-13-1',
        title: 'Full Lifecycle Capstone Service',
        description: 'Ship a real service through CI to GHCR, deploy via GitOps with TLS, monitor it with SLO-based alerts, and write its runbook.',
        objective: 'Demonstrate senior-level ownership: design, deploy, observe, incident-test, and document a production-grade service.',
        order: 1,
        requiredSkills: ['skill-github-actions', 'skill-gitops', 'skill-prometheus', 'skill-security', 'skill-k8s-troubleshoot'],
        tasks: [
          {
            id: 'task-13-1-1',
            title: 'Design & Document the Service',
            description: 'Write a one-page design doc: architecture, SLOs, failure modes, and dashboards before writing code.',
            objective: 'Practice designing for operations first.',
            order: 1,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-security', expectedLevel: 3 }]
          },
          {
            id: 'task-13-1-2',
            title: 'Build, Deploy & Observe End-to-End',
            description: 'CI builds and publishes the image, GitOps deploys it, dashboards watch it, alerts guard it.',
            objective: 'Prove the full toolchain works together without manual steps.',
            order: 2,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-gitops', expectedLevel: 4 }, { skillId: 'skill-prometheus', expectedLevel: 3 }]
          },
          {
            id: 'task-13-1-3',
            title: 'Break It on Purpose: Incident Drill',
            description: 'Inject a failure (kill a pod, fill a disk), follow your runbook, and write a blameless postmortem.',
            objective: 'Validate that your observability and runbooks actually work under pressure.',
            order: 3,
            difficulty: 'ADVANCED' as const,
            expectedSkills: [{ skillId: 'skill-k8s-troubleshoot', expectedLevel: 4 }]
          }
        ]
      }
    ]
  }
];
