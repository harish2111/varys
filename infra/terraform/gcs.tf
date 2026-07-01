resource "google_project_service" "storage" {
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}

resource "google_storage_bucket" "varys_artifacts" {
  name                        = "${var.project_id}-varys-artifacts"
  location                    = var.gcs_location
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      days_since_noncurrent_time = var.gcs_artifact_retention_days
      with_state                 = "ARCHIVED"
    }
  }

  depends_on = [google_project_service.storage]
}

# Allow the workload service account to read/write artifacts.
resource "google_storage_bucket_iam_member" "varys_workload_artifacts" {
  bucket = google_storage_bucket.varys_artifacts.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.varys_workload.email}"
}
