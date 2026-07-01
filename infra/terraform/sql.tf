# Enable required APIs.
resource "google_project_service" "sqladmin" {
  service            = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "servicenetworking" {
  service            = "servicenetworking.googleapis.com"
  disable_on_destroy = false
}

resource "google_sql_database_instance" "varys" {
  name             = "varys"
  database_version = "POSTGRES_15"
  region           = var.region

  depends_on = [
    google_service_networking_connection.private_services,
    google_project_service.sqladmin,
  ]

  deletion_protection = true

  settings {
    tier              = var.db_tier
    availability_type = var.db_availability_type
    disk_size         = var.db_disk_size_gb
    disk_autoresize   = true

    database_flags {
      name  = "cloudsql.enable_pgvector"
      value = "on"
    }

    # Private IP only — no public endpoint.
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.varys.self_link
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "03:00"
      backup_retention_settings {
        retained_backups = 7
      }
    }

    maintenance_window {
      day          = 7 # Sunday
      hour         = 4
      update_track = "stable"
    }

    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
    }
  }
}

resource "google_sql_database" "varys" {
  name     = "varys"
  instance = google_sql_database_instance.varys.name
}

# varys_owner — superuser-equivalent for migrations; password stored in Secret Manager.
resource "google_sql_user" "varys_owner" {
  name     = "varys_owner"
  instance = google_sql_database_instance.varys.name
  password = random_password.db_owner.result
}

# varys_app — non-superuser role used by all services; subject to RLS.
resource "google_sql_user" "varys_app" {
  name     = "varys_app"
  instance = google_sql_database_instance.varys.name
  password = random_password.db_app.result
}

resource "random_password" "db_owner" {
  length  = 32
  special = true
}

resource "random_password" "db_app" {
  length  = 32
  special = true
}

# Store connection URLs in Secret Manager.
resource "google_secret_manager_secret_version" "database_url" {
  secret = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.varys_app.name}:${random_password.db_app.result}@${google_sql_database_instance.varys.private_ip_address}/varys"
}

resource "google_secret_manager_secret_version" "database_direct_url" {
  secret = google_secret_manager_secret.database_direct_url.id
  secret_data = "postgresql://${google_sql_user.varys_owner.name}:${random_password.db_owner.result}@${google_sql_database_instance.varys.private_ip_address}/varys"
}
