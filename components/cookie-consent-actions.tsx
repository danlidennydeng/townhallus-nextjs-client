"use client";

import { Button } from "@/components/ui/button";
import { saveCookieConsent, useCookieConsent } from "@/lib/cookie-consent";

export function CookieConsentActions({ showFeedback = false }: Readonly<{ showFeedback?: boolean }>) {
  const { choice, ready, temporary, storageUnavailable } = useCookieConsent();

  return (
    <div>
      <div role="group" aria-label="Optional cookie preference" className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          disabled={!ready}
          aria-pressed={choice === false}
          onClick={() => saveCookieConsent(false)}
          className="h-auto min-h-11 w-full whitespace-normal border-[#9333EA] bg-[#f7f7f7] px-5 py-3 font-semibold text-[#9333EA] hover:bg-[#eeeeee] sm:w-auto"
        >
          Reject optional cookies
        </Button>
        <Button
          type="button"
          disabled={!ready}
          aria-pressed={choice === true}
          onClick={() => saveCookieConsent(true)}
          className="h-auto min-h-11 w-full whitespace-normal border-[#9333EA] bg-[#9333EA] px-5 py-3 font-semibold text-[#ffffff] hover:bg-[#7E22CE] sm:w-auto"
        >
          Accept optional cookies
        </Button>
      </div>
      {showFeedback ? (
        <p role="status" className="mt-4 text-sm leading-6 text-[#4d4d4d]">
          {!ready ? "Loading your preference..."
            : temporary ? "Your choice applies for this visit. Your browser could not save it for future visits."
              : storageUnavailable ? "Your browser could not read saved preferences. You can still choose for this visit."
                : choice === null ? "Choose an option above. You can change your preference here at any time."
                  : `Your preference is saved in this browser. Optional analytics and advertising cookies are ${choice ? "accepted" : "rejected"}.`}
        </p>
      ) : null}
    </div>
  );
}
