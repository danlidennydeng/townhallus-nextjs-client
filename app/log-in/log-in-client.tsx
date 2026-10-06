"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRightIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import { getStoredUser, setStoredUser, type TownHallUser } from "@/lib/auth-client";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFormData | "general", string>>;

const initialFormData: LoginFormData = {
  email: "",
  password: "",
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#^-]{8,12}$/;

const inputClassName =
  "block h-11 w-full rounded-md border border-[#999999] bg-[#f7f7f7] px-3 text-[#000000] outline-none transition-colors placeholder:text-[#666666] focus:border-[#9333EA]";

const labelClassName = "block font-extrabold text-[#000000]";
const accentClassName = "font-bold text-[#9333EA]";
const linkClassName =
  "font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 transition-colors hover:text-[#7E22CE]";

function validateLogin(formData: LoginFormData) {
  const fieldErrors: LoginErrors = {};

  if (!formData.email) {
    fieldErrors.email = "Email is required";
  } else if (formData.email.length > 60) {
    fieldErrors.email = "Invalid email";
  } else if (!emailRegex.test(formData.email)) {
    fieldErrors.email = "Invalid email format";
  }

  if (!formData.password) {
    fieldErrors.password = "Password is required";
  } else if (formData.password.length < 8) {
    fieldErrors.password = "Invalid password";
  } else if (formData.password.length > 12) {
    fieldErrors.password = "Invalid password";
  } else if (!passwordRegex.test(formData.password)) {
    fieldErrors.password = "Invalid password";
  }

  return fieldErrors;
}

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message;
  } catch {
    return undefined;
  }
}

function FieldError({ message }: Readonly<{ message?: string }>) {
  return (
    <div className="mt-1 min-h-12 w-full" aria-live="polite">
      {message ? (
        <div className="flex items-start gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-2 text-sm leading-5 text-[#B91C1C]">
          <TriangleAlertIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span>{message}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function LogInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get("create-account") === "success";
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getStoredUser()) {
      router.replace("/dashprofile");
    }
  }, [router]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, value } = event.target;

    setFormData((current) => ({
      ...current,
      [id]: value.trim(),
    }));

    setErrors((current) => ({ ...current, [id]: undefined, general: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateLogin(formData);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const message = await readResponseMessage(response);
        setErrors({ general: message || "Something went wrong" });
        return;
      }

      const user = (await response.json()) as TownHallUser;
      setStoredUser(user);
      router.push("/dashprofile");
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col bg-[#e6e6e6] px-2 py-8 sm:px-4 lg:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        {justSignedUp ? (
          <div className="mb-4 rounded-md border border-[#999999] bg-[#eeeeee] px-4 py-3 text-center text-xl font-extrabold text-[#9333EA] shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            You have successfully signed up! Please log in.
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row">
          <section className="flex h-auto w-full flex-col justify-center rounded-md border border-[#9333EA] bg-[#f7f7f7] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.14)] lg:h-[460px] lg:w-[365px]">
            <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
              <label htmlFor="email" className={labelClassName}>
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.online"
                id="email"
                maxLength={60}
                onChange={handleChange}
                onFocus={() =>
                  setErrors((current) => ({ ...current, general: undefined }))
                }
                value={formData.email}
                autoComplete="off"
                className={inputClassName}
              />
              <FieldError message={errors.email} />

              <label htmlFor="password" className={labelClassName}>
                Password
              </label>
              <input
                type="text"
                placeholder="********"
                id="password"
                maxLength={12}
                onChange={handleChange}
                onFocus={() =>
                  setErrors((current) => ({ ...current, general: undefined }))
                }
                value={formData.password}
                autoComplete="off"
                className={inputClassName}
              />
              <FieldError message={errors.password} />

              <Button
                type="submit"
                disabled={loading}
                className="mt-6 h-12 rounded-md border border-[#9333EA] bg-[#9333EA] px-5 text-base font-semibold text-[#ffffff] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#7E22CE]"
              >
                {loading ? (
                  <LoaderCircleIcon
                    className="size-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                <span>{loading ? "Loading..." : "Log In"}</span>
                {!loading ? (
                  <ArrowRightIcon className="size-5" aria-hidden="true" />
                ) : null}
              </Button>

              <div className="mt-1 min-h-12" aria-live="polite">
                {errors.general ? (
                  <div className="flex items-start gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-2 text-sm leading-5 text-[#B91C1C]">
                    <TriangleAlertIcon
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{errors.general}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-2 flex justify-center">
                <Link href="/forgot-password" className={linkClassName}>
                  Forgot password?
                </Link>
              </div>
            </form>
          </section>

          <section className="flex h-auto w-full flex-row items-center overflow-hidden rounded-md border border-[#9333EA] bg-[#f7f7f7] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.14)] lg:h-[460px] lg:w-[365px]">
            <p className="text-[24px] leading-tight text-[#000000] lg:text-[32px]">
              A <span className={accentClassName}>professional political</span>{" "}
              and <span className={accentClassName}>social discussion forum</span>{" "}
              exclusively for{" "}
              <span className={accentClassName}>American registered</span>{" "}
              <span className={accentClassName}>voters</span> and{" "}
              <span className={accentClassName}>young American citizens</span>{" "}
              between the ages of 13 and 17{" "}
              <span className="text-xl text-[#9333EA]">*</span>
            </p>
          </section>

          <section className="flex h-auto w-full flex-col overflow-hidden rounded-md border border-[#9333EA] bg-[#f7f7f7] p-3 text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.14)] lg:h-[460px] lg:w-[365px] lg:text-[14px]">
            <p className="mb-3 p-1 mt-2">
              We advocate for{" "}
              <span className={accentClassName}>
                freedom of speech, honest dialogue, democracy, and unity
              </span>
              .
            </p>
            <p className="mb-3 p-1">
              We encourage you to focus on{" "}
              <span className={accentClassName}>statewide issues</span> rather
              than nationwide or local matters.
            </p>
            <p className="mb-3 p-1">
              We{" "}
              <span className={accentClassName}>
                protect you from foreign influences and foreign propaganda
              </span>{" "}
              by allowing young American citizens and American registered voters
              only.
            </p>
            <p className="mb-3 p-1">
              You will be exposed to perspectives from all sides.{" "}
              <span className={accentClassName}>
                No misuse of Artificial Intelligence
              </span>{" "}
              to send you only favored views.
            </p>
            <p className="mb-3 p-1">
              You can <span className={accentClassName}>bridge political divides</span>{" "}
              and{" "}
              <span className={accentClassName}>
                think critically about diverse media
              </span>{" "}
              all while keeping an open mind and staying anonymous.
            </p>
            <p className="mb-2 p-1">
              You can also <span className={accentClassName}>role-play</span> a{" "}
              <Link href="/gamerules" className={linkClassName}>
                realistic strategy game
              </Link>{" "}
              by competing against your{" "}
              <span className={accentClassName}>
                current elected state officials
              </span>
              .
            </p>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/create-account" />}
            className="mx-4 h-auto w-auto rounded-md border border-[#9333EA] bg-[#9333EA] px-6 py-4 text-center text-2xl font-semibold text-[#ffffff] shadow-[0_2px_4px_rgba(0,0,0,0.18)] hover:bg-[#7E22CE] sm:px-16 lg:px-48 lg:text-[45px]"
          >
            No Account yet? Create One Here!
          </Button>
        </div>
      </div>
    </main>
  );
}
