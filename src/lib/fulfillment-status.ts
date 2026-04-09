export function formatFulfillmentStage(stage: string | null | undefined) {
  const value = String(stage || "").trim();
  switch (value) {
    case "enqueue":
      return "Queued from payment";
    case "package_resolved":
      return "Package metadata resolved";
    case "tenant_request_sent":
      return "Tenant onboarding request sent";
    case "control_dispatch":
      return "Control dispatch failed";
    case "control_response":
      return "Control dispatch accepted";
    case "worker_exception":
      return "Worker exception";
    case "stuck_reconcile":
      return "Recovered from stuck state";
    case "user_retry":
      return "Customer retry requested";
    case "control_dispatch_attempt":
      return "Control dispatch attempt";
    default:
      return value || "-";
  }
}

export function actionableErrorReason(errorCode: string | null | undefined) {
  const code = String(errorCode || "").trim();
  switch (code) {
    case "TENANT_ASSIGNMENT_NOT_FOUND":
      return "No active tenant mapping exists. Admin needs to assign or create tenant mapping before retry.";
    case "TENANT_ALREADY_ASSIGNED":
      return "Customer tenant already exists. System will retry with assign_existing mode automatically.";
    case "CONTROL_NOT_CONFIGURED":
      return "Website VPS is missing control-plane URL/token environment variables.";
    case "NEXIUS_CONTROL_ONBOARDING_TIMEOUT":
      return "Control-plane onboarding timed out. Worker will retry automatically based on retry policy.";
    case "NEXIUS_CONTROL_ONBOARDING_NETWORK_ERROR":
      return "Control-plane network call failed. Verify DNS/network path from Website VPS to Control VPS.";
    case "CONTROL_DISPATCH_STUCK_TIMEOUT":
      return "Job stayed in-progress too long and was moved to failed for automatic retry.";
    case "RETRY_LIMIT_EXCEEDED":
      return "Job reached retry limit. Requires manual admin intervention.";
    case "FULFILLMENT_WORKER_ERROR":
      return "Worker hit an internal exception. Review logs and retry the job.";
    default:
      return code ? `Review admin fulfillment logs for ${code}.` : "Review onboarding timeline for next action.";
  }
}
