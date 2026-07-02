terraform {
  required_version = ">= 1.8"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.14"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.31"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Backend: use a GCS bucket for shared remote state.
  # Create the bucket manually before `terraform init`:
  #   gcloud storage buckets create gs://<project>-tf-state --location=<region>
  backend "gcs" {
    # bucket and prefix set via -backend-config on first init, or a backend.hcl file.
    # Example: terraform init -backend-config="bucket=myproject-tf-state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Helm + Kubernetes providers use cluster credentials from the GKE data source.
data "google_client_config" "default" {}

data "google_container_cluster" "varys" {
  name     = google_container_cluster.varys.name
  location = var.region
  depends_on = [google_container_cluster.varys]
}

provider "helm" {
  kubernetes {
    host                   = "https://${data.google_container_cluster.varys.endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(data.google_container_cluster.varys.master_auth[0].cluster_ca_certificate)
  }
}

provider "kubernetes" {
  host                   = "https://${data.google_container_cluster.varys.endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(data.google_container_cluster.varys.master_auth[0].cluster_ca_certificate)
}
