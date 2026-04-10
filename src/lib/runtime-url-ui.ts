export type RuntimeUrls = {
  webchatUrl: string | null;
  erpUrl: string | null;
  source?: string | null;
};

export function hasRuntimeUrls(urls: RuntimeUrls | null | undefined): boolean {
  return Boolean(urls?.webchatUrl || urls?.erpUrl);
}

export function shouldShowOnboardingReadyActions(state: string, urls: RuntimeUrls | null | undefined): boolean {
  return state === "completed" && hasRuntimeUrls(urls);
}

export function shouldShowWorkspaceReadyActions(
  activationState: string,
  urls: RuntimeUrls | null | undefined,
): boolean {
  return activationState === "ready" && hasRuntimeUrls(urls);
}
