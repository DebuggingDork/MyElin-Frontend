"use client";

/**
 * Forwards a password-recovery landing to the page that can finish it.
 *
 * Supabase validates a reset link's `redirect_to` against the project's own allow-list and,
 * when it does not match, silently swaps in the project's Site URL instead of refusing. So a
 * link that should land on `/reset-password` can arrive anywhere the operator happens to have
 * configured -- including a wildcard pattern, which resolves to a 404 with the recovery token
 * still attached to it. The user sees a broken page and concludes the reset is broken.
 *
 * The token is in the URL fragment, which never leaves the browser, so it survives that
 * substitution intact: wherever the link lands inside this app, this picks the fragment up and
 * replaces the route with `/reset-password`, carrying it across. Same origin, one hop, and the
 * flow completes even while the dashboard is still misconfigured.
 *
 * Deliberately narrow: it acts only on a fragment that names itself a recovery, and only ever
 * navigates to this app's own reset page.
 */

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const RESET_PATH = "/reset-password";

export function RecoveryLinkCatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === RESET_PATH || typeof window === "undefined") return;

    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const isRecovery = params.get("type") === "recovery";
    const hasToken = Boolean(params.get("access_token"));
    if (!isRecovery || !hasToken) return;

    router.replace(`${RESET_PATH}#${hash}`);
  }, [pathname, router]);

  return null;
}
