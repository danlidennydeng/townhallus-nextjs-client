"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  LoaderCircleIcon,
  MailCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";

import { apiUrl } from "@/lib/api-client";

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message;
  } catch {
    return undefined;
  }
}

export default function VerifyEmailClient() {
  const router = useRouter();
  const [code, setCode] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function handleChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return;

    const updated = [...code];
    updated[index] = value;
    setCode(updated);
    setMessage("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    handleChange(event.target.value, index);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const pasted = event.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasted)) return;

    setCode(pasted.split(""));
    setMessage("");
    inputsRef.current[5]?.focus();
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setMessageType("error");
      setMessage("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/auth/verify-email"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const responseMessage = await readResponseMessage(response);
        throw new Error(responseMessage || "Verification failed");
      }

      setMessageType("success");
      setMessage("Email verified successfully. Redirecting to home page...");
      router.push("/");
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Invalid or expired verification code"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-10">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md rounded-xl border border-[#999999] bg-[#f7f7f7] p-6 shadow-[0_2px_6px_rgba(0,0,0,0.18)] sm:p-12 lg:p-16"
        noValidate
      >
        <div className="flex justify-center">
          <span className="flex size-16 items-center justify-center rounded-lg border border-[#999999] bg-[#ffffff]">
            <MailCheckIcon className="size-9 text-[#666666]" aria-hidden="true" />
          </span>
        </div>

        <h1 className="mt-6 text-center text-3xl font-bold text-[#000000]">
          Verify Your Email
        </h1>

        <p className="mt-10 text-center text-[#1f1f1f]">
          Please check your email for a 6 digit verification code.
        </p>

        <p className="mt-2 text-center text-[#1f1f1f]">
          Then enter the 6-digit verification code to verify within 1 hour.
        </p>

        <p className="mt-2 text-center text-[#1f1f1f]">
          Or you can create an new account again with the same information 24
          hours later.
        </p>

        <div
          className="mt-10 flex justify-center gap-2 sm:gap-3"
          onPaste={handlePaste}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => handleInputChange(event, index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              aria-label={`Verification code digit ${index + 1}`}
              className="h-14 w-11 rounded-lg border border-[#999999] bg-[#ffffff] text-center text-xl font-semibold text-[#000000] outline-none transition-colors focus:border-[#000000] focus:ring-3 focus:ring-[#808080]/40 sm:w-12"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-md border border-[#808080] bg-[#000000] px-8 py-3 text-xl font-semibold text-[#ffffff] shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#4d4d4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#000000] disabled:opacity-60 sm:px-16"
        >
          {loading ? (
            <LoaderCircleIcon
              className="size-5 animate-spin"
              aria-hidden="true"
            />
          ) : null}
          <span>{loading ? "Verifying..." : "Verify Email"}</span>
          {!loading ? <ArrowRightIcon className="size-5" aria-hidden="true" /> : null}
        </button>

        <div className="mt-5 min-h-12" aria-live="polite">
          {message ? (
            <div
              className={`flex items-start gap-2 rounded-md border px-4 py-3 text-sm leading-6 ${
                messageType === "success"
                  ? "border-[#808080] bg-[#eeeeee] text-[#000000]"
                  : "border-[#999999] bg-[#eeeeee] text-[#000000]"
              }`}
            >
              <TriangleAlertIcon
                className="mt-0.5 size-4 shrink-0 text-[#4d4d4d]"
                aria-hidden="true"
              />
              <span>{message}</span>
            </div>
          ) : null}
        </div>
      </form>
    </main>
  );
}
