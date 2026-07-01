resource "google_project_service" "redis" {
  service            = "redis.googleapis.com"
  disable_on_destroy = false
}

resource "google_redis_instance" "varys" {
  name               = "varys"
  region             = var.region
  tier               = var.redis_tier
  memory_size_gb     = var.redis_memory_size_gb
  redis_version      = "REDIS_7_2"
  display_name       = "Varys BullMQ + cache"
  authorized_network = google_compute_network.varys.self_link

  # Persistence: RDB snapshots every hour for BullMQ queue durability.
  persistence_config {
    persistence_mode    = "RDB"
    rdb_snapshot_period = "ONE_HOUR"
  }

  depends_on = [google_project_service.redis]
}

resource "google_secret_manager_secret_version" "redis_url" {
  secret      = google_secret_manager_secret.redis_url.id
  secret_data = "redis://${google_redis_instance.varys.host}:${google_redis_instance.varys.port}"
}
