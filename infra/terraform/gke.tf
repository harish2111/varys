resource "google_project_service" "container" {
  service            = "container.googleapis.com"
  disable_on_destroy = false
}

resource "google_container_cluster" "varys" {
  provider = google-beta
  name     = var.gke_cluster_name
  location = var.region

  depends_on = [google_project_service.container]

  # Managed node pools defined separately; delete the implicitly created default pool.
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.varys.self_link
  subnetwork = google_compute_subnetwork.varys_nodes.self_link

  release_channel {
    channel = var.gke_release_channel
  }

  # Private cluster — nodes have no external IPs.
  private_cluster_config {
    enable_private_nodes   = true
    master_ipv4_cidr_block = "172.16.0.0/28"
  }

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Network policy for pod-level isolation (Calico).
  network_policy {
    enabled  = true
    provider = "CALICO"
  }

  addons_config {
    http_load_balancing {
      disabled = false
    }
    horizontal_pod_autoscaling {
      disabled = false
    }
    gce_persistent_disk_csi_driver_config {
      enabled = true
    }
    # GKE dataplane V2 provides eBPF-based network policy (enables Calico above).
    network_policy_config {
      disabled = false
    }
  }

  # Binary Authorization and Shielded Nodes for supply-chain security.
  enable_shielded_nodes = true

  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  # Allow master to reach nodes on Squid egress proxy port (3128).
  master_authorized_networks_config {
    # Empty: no external access to master. Adjust if you need kubectl from outside VPC.
  }

  maintenance_policy {
    recurring_window {
      start_time = "2024-01-01T04:00:00Z"
      end_time   = "2024-01-01T08:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SU"
    }
  }

  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"
}

# Default node pool — gateway, orchestrator, aggregator, ingestor, llm-gateway, unit-worker.
resource "google_container_node_pool" "default" {
  name     = "default"
  cluster  = google_container_cluster.varys.name
  location = var.region

  autoscaling {
    min_node_count = var.default_pool_min_nodes
    max_node_count = var.default_pool_max_nodes
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    machine_type = var.default_pool_machine_type
    spot         = true

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    service_account = google_service_account.varys_workload.email

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }
}

# Sandbox node pool — tainted so only qa-sandbox-worker pods land here.
# These pods run isolated-vm V8 isolates; keeping them on a dedicated pool
# limits blast radius if a connector escapes the V8 sandbox at the OS level.
resource "google_container_node_pool" "sandbox" {
  name     = "sandbox"
  cluster  = google_container_cluster.varys.name
  location = var.region

  autoscaling {
    min_node_count = var.sandbox_pool_min_nodes
    max_node_count = var.sandbox_pool_max_nodes
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  node_config {
    machine_type = var.sandbox_pool_machine_type
    spot         = true

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]

    service_account = google_service_account.varys_workload.email

    # Taint matches the toleration in values.yaml: sandbox=true:NoSchedule.
    taint {
      key    = "sandbox"
      value  = "true"
      effect = "NO_SCHEDULE"
    }

    labels = {
      pool = "sandbox"
    }

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }
  }
}
