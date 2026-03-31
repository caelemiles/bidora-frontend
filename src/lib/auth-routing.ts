import { api } from "@/lib/api";

/**
 * Check whether the current user has a completed onboarding profile.
 * Calls GET /api/profiles/me and inspects onboarding_completed.
 * Returns true only when a profile exists AND onboarding_completed is true.
 *
 * The api client throws errors formatted as "STATUS: detail" (e.g. "404: Not Found"),
 * so checking msg.startsWith("404") is reliable for detecting missing profiles.
 */
export async function checkOnboardingComplete(
  label: string,
): Promise<boolean> {
  try {
    console.log(
      `[${label}] Checking onboarding status via GET /api/profiles/me …`,
    );
    const profile = await api.get<{ onboarding_completed?: boolean }>(
      "/api/profiles/me",
    );
    const completed = profile.onboarding_completed === true;
    console.log(
      `[${label}] Profile found. onboarding_completed = ${completed}`,
    );
    return completed;
  } catch (err: unknown) {
    // 404 means no profile exists yet → onboarding not done
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.startsWith("404")) {
      console.log(
        `[${label}] No profile found (404) → onboarding required.`,
      );
      return false;
    }
    // For other errors, log and default to onboarding so the user doesn't
    // land in a broken main-app state.
    console.warn(
      `[${label}] Could not verify onboarding status:`,
      msg,
    );
    return false;
  }
}
