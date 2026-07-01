output "gke_cluster_name" {
  description = "GKE cluster name (set GKE_CLUSTER in CI secrets)"
  value       = google_container_cluster.varys.name
}

output "gke_cluster_endpoint" {
  description = "GKE API server endpoint"
  value       = google_container_cluster.varys.endpoint
  sensitive   = true
}

output "artifact_registry_url" {
  description = "Artifact Registry base URL for image tags (set GCP_REGION + GCP_PROJECT in CI)"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/varys"
}

output "db_private_ip" {
  description = "Cloud SQL private IP (reachable from GKE pods)"
  value       = google_sql_database_instance.varys.private_ip_address
}

output "redis_host" {
  description = "Memorystore Redis host (reachable from GKE pods)"
  value       = google_redis_instance.varys.host
}

output "gcs_bucket" {
  description = "GCS artifacts bucket name (set GCS_BUCKET in app config)"
  value       = google_storage_bucket.varys_artifacts.name
}

output "github_wif_provider" {
  description = "Workload Identity provider resource name (set GCP_WORKLOAD_IDENTITY_PROVIDER in CI secrets)"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "github_deploy_sa" {
  description = "GitHub Actions service account email (set GCP_SERVICE_ACCOUNT in CI secrets)"
  value       = google_service_account.varys_github.email
}
