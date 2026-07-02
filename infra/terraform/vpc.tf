resource "google_compute_network" "varys" {
  name                    = "varys"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "varys_nodes" {
  name          = "varys-nodes"
  network       = google_compute_network.varys.self_link
  region        = var.region
  ip_cidr_range = "10.0.0.0/20"

  # Secondary ranges used by GKE for pod and service IPs.
  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.16.0.0/14"
  }
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.20.0.0/20"
  }

  private_ip_google_access = true
}

# Cloud NAT so private GKE nodes can reach the internet (e.g. Gemini API).
resource "google_compute_router" "varys" {
  name    = "varys"
  network = google_compute_network.varys.self_link
  region  = var.region
}

resource "google_compute_router_nat" "varys" {
  name                               = "varys-nat"
  router                             = google_compute_router.varys.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Private Services Access for Cloud SQL private IP.
resource "google_compute_global_address" "private_services" {
  name          = "varys-private-services"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 20
  network       = google_compute_network.varys.self_link
}

resource "google_service_networking_connection" "private_services" {
  network                 = google_compute_network.varys.self_link
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_services.name]
}
