resource "google_project_service" "iam" {
  service            = "iam.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iamcredentials" {
  service            = "iamcredentials.googleapis.com"
  disable_on_destroy = false
}

# ---------------------------------------------------------------------------
# Workload Identity — used by all GKE pods via the Kubernetes SA below.
# ---------------------------------------------------------------------------

resource "google_service_account" "varys_workload" {
  account_id   = "varys-workload"
  display_name = "Varys GKE workload identity"
}

# Bind the K8s service account to the GCP SA via Workload Identity.
resource "google_service_account_iam_member" "k8s_workload_identity" {
  service_account_id = google_service_account.varys_workload.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project_id}.svc.id.goog[varys/varys]"
}

# Kubernetes ServiceAccount that pods use (references the GCP SA via annotation).
resource "kubernetes_service_account" "varys" {
  metadata {
    name      = "varys"
    namespace = "varys"
    annotations = {
      "iam.gke.io/gcp-service-account" = google_service_account.varys_workload.email
    }
  }
  depends_on = [kubernetes_namespace.varys]
}

resource "kubernetes_namespace" "varys" {
  metadata {
    name = "varys"
  }
}

# Cloud SQL Client — so pods can connect via the Cloud SQL Auth Proxy sidecar.
resource "google_project_iam_member" "workload_cloudsql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.varys_workload.email}"
}

# Monitoring — pods can write custom metrics.
resource "google_project_iam_member" "workload_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.varys_workload.email}"
}

# Trace — pods can export OTel traces.
resource "google_project_iam_member" "workload_trace" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.varys_workload.email}"
}

# ---------------------------------------------------------------------------
# GitHub Actions — Workload Identity Federation for CI/CD (no long-lived keys).
# ---------------------------------------------------------------------------

resource "google_service_account" "varys_github" {
  account_id   = "varys-github-actions"
  display_name = "Varys GitHub Actions deploy SA"
}

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "varys-github"
  display_name              = "Varys GitHub Actions pool"
  depends_on                = [google_project_service.iam]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  # Only tokens from the configured repo are accepted.
  attribute_condition = "assertion.repository == '${var.github_org}/${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Allow the WIF provider to impersonate the GitHub SA.
resource "google_service_account_iam_member" "github_wif" {
  service_account_id = google_service_account.varys_github.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_org}/${var.github_repo}"
}

# GitHub SA can deploy to GKE.
resource "google_project_iam_member" "github_gke_developer" {
  project = var.project_id
  role    = "roles/container.developer"
  member  = "serviceAccount:${google_service_account.varys_github.email}"
}

# GitHub SA can read secrets to set Helm values during deploy (e.g. image digest verification).
resource "google_project_iam_member" "github_secret_viewer" {
  project = var.project_id
  role    = "roles/secretmanager.viewer"
  member  = "serviceAccount:${google_service_account.varys_github.email}"
}
