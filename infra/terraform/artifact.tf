resource "google_project_service" "artifactregistry" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "varys" {
  repository_id = "varys"
  location      = var.region
  format        = "DOCKER"
  description   = "Varys service container images"

  depends_on = [google_project_service.artifactregistry]
}

# GitHub Actions service account can push images.
resource "google_artifact_registry_repository_iam_member" "github_push" {
  repository = google_artifact_registry_repository.varys.name
  location   = var.region
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.varys_github.email}"
}

# GKE workload SA can pull images.
resource "google_artifact_registry_repository_iam_member" "workload_pull" {
  repository = google_artifact_registry_repository.varys.name
  location   = var.region
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.varys_workload.email}"
}
