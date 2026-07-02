variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for all resources"
  type        = string
  default     = "us-central1"
}

variable "gke_cluster_name" {
  description = "GKE cluster name"
  type        = string
  default     = "varys"
}

variable "gke_release_channel" {
  description = "GKE release channel"
  type        = string
  default     = "REGULAR"
}

# Node pools ----------------------------------------------------------------

variable "default_pool_machine_type" {
  description = "Machine type for the default node pool"
  type        = string
  default     = "n2-standard-4"
}

variable "default_pool_min_nodes" {
  description = "Minimum nodes per zone in the default pool"
  type        = number
  default     = 1
}

variable "default_pool_max_nodes" {
  description = "Maximum nodes per zone in the default pool"
  type        = number
  default     = 5
}

variable "sandbox_pool_machine_type" {
  description = "Machine type for the sandbox node pool"
  type        = string
  default     = "n2-standard-4"
}

variable "sandbox_pool_min_nodes" {
  description = "Minimum nodes per zone in the sandbox pool"
  type        = number
  default     = 1
}

variable "sandbox_pool_max_nodes" {
  description = "Maximum nodes per zone in the sandbox pool"
  type        = number
  default     = 4
}

# Cloud SQL -----------------------------------------------------------------

variable "db_tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-g1-small"
}

variable "db_disk_size_gb" {
  description = "Cloud SQL data disk size in GB"
  type        = number
  default     = 20
}

variable "db_availability_type" {
  description = "Cloud SQL availability: ZONAL or REGIONAL (HA)"
  type        = string
  default     = "ZONAL"
}

# Memorystore Redis ---------------------------------------------------------

variable "redis_tier" {
  description = "Memorystore Redis service tier: BASIC or STANDARD_HA"
  type        = string
  default     = "BASIC"
}

variable "redis_memory_size_gb" {
  description = "Memorystore Redis memory size in GB"
  type        = number
  default     = 1
}

# GCS -----------------------------------------------------------------------

variable "gcs_location" {
  description = "GCS bucket location (multi-region or region)"
  type        = string
  default     = "US"
}

variable "gcs_artifact_retention_days" {
  description = "Days before non-current GCS artifact versions are deleted"
  type        = number
  default     = 90
}

# GitHub Actions WIF --------------------------------------------------------

variable "github_org" {
  description = "GitHub organisation or user owning the repository"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (without org prefix)"
  type        = string
  default     = "varys"
}
