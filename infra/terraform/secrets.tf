resource "google_project_service" "secretmanager" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

locals {
  # Secrets whose values are managed by Terraform (auto-generated or derived from other resources).
  # Secrets with values set manually by the operator (GEMINI_API_KEY, JWT_SECRET, etc.)
  # are created as empty shells here and populated out-of-band.
  operator_secrets = toset([
    "GEMINI_API_KEY",
    "JWT_SECRET",
    "INTERNAL_SERVICE_SECRET",
  ])
}

# Auto-populated secrets (value set by Terraform).
resource "google_secret_manager_secret" "database_url" {
  secret_id  = "DATABASE_URL"
  depends_on = [google_project_service.secretmanager]
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "database_direct_url" {
  secret_id  = "DATABASE_DIRECT_URL"
  depends_on = [google_project_service.secretmanager]
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "redis_url" {
  secret_id  = "REDIS_URL"
  depends_on = [google_project_service.secretmanager]
  replication {
    auto {}
  }
}

# Operator-managed secrets — Terraform creates the shell; the operator populates the value:
#   gcloud secrets versions add GEMINI_API_KEY --data-file=-  <<< "real-key-here"
resource "google_secret_manager_secret" "operator" {
  for_each   = local.operator_secrets
  secret_id  = each.key
  depends_on = [google_project_service.secretmanager]
  replication {
    auto {}
  }
}

# Workload service account can access all secrets at runtime.
resource "google_secret_manager_secret_iam_member" "workload_database_url" {
  secret_id = google_secret_manager_secret.database_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.varys_workload.email}"
}

resource "google_secret_manager_secret_iam_member" "workload_database_direct_url" {
  secret_id = google_secret_manager_secret.database_direct_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.varys_workload.email}"
}

resource "google_secret_manager_secret_iam_member" "workload_redis_url" {
  secret_id = google_secret_manager_secret.redis_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.varys_workload.email}"
}

resource "google_secret_manager_secret_iam_member" "workload_operator" {
  for_each  = local.operator_secrets
  secret_id = google_secret_manager_secret.operator[each.key].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.varys_workload.email}"
}
