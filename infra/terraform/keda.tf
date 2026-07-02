resource "helm_release" "keda" {
  name             = "keda"
  repository       = "https://kedacore.github.io/charts"
  chart            = "keda"
  version          = "2.15.1"
  namespace        = "keda"
  create_namespace = true

  set {
    name  = "resources.operator.requests.cpu"
    value = "50m"
  }
  set {
    name  = "resources.operator.requests.memory"
    value = "64Mi"
  }
  set {
    name  = "resources.operator.limits.cpu"
    value = "500m"
  }
  set {
    name  = "resources.operator.limits.memory"
    value = "256Mi"
  }

  depends_on = [
    google_container_node_pool.default,
  ]
}
