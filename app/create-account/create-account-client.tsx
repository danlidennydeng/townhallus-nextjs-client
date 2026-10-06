"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  LoaderCircleIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { apiUrl } from "@/lib/api-client";

type FormData = {
  firstname: string;
  lastname: string;
  state: string;
  email: string;
  password: string;
  confirmPassword: string;
  isAgreed: boolean;
};

type FormErrors = Partial<Record<keyof FormData | "general", string>>;

const states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const initialFormData: FormData = {
  firstname: "",
  lastname: "",
  state: "",
  email: "",
  password: "",
  confirmPassword: "",
  isAgreed: false,
};

const nameRegex = /^[A-Za-z\s'-]+$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#^-]{8,12}$/;

function formatFieldValue(id: string, value: string) {
  let formattedValue = value.trim();

  if (id === "firstname" || id === "lastname") {
    formattedValue =
      formattedValue.charAt(0).toUpperCase() +
      formattedValue.slice(1).toLowerCase();
  }

  if (id === "email") {
    formattedValue = formattedValue.toLowerCase();
  }

  return formattedValue;
}

function validateForm(formData: FormData) {
  const fieldErrors: FormErrors = {};

  if (!formData.firstname) {
    fieldErrors.firstname = "First name is required.";
  } else if (formData.firstname.length > 30) {
    fieldErrors.firstname = "First name must not exceed 30 characters.";
  } else if (!nameRegex.test(formData.firstname)) {
    fieldErrors.firstname = "Only letters are allowed";
  }

  if (!formData.lastname) {
    fieldErrors.lastname = "Last name is required.";
  } else if (formData.lastname.length > 50) {
    fieldErrors.lastname = "Last name must not exceed 50 characters.";
  } else if (!nameRegex.test(formData.lastname)) {
    fieldErrors.lastname = "Only letters are allowed.";
  }

  if (!formData.state) {
    fieldErrors.state = "state where you had registered as a voter.";
  }

  if (!formData.email) {
    fieldErrors.email = "Email is required.";
  } else if (formData.email.length > 254) {
    fieldErrors.email = "Email cannot exceed 254 characters.";
  } else if (!emailRegex.test(formData.email)) {
    fieldErrors.email = "Invalid email address";
  }

  if (!formData.password) {
    fieldErrors.password = "Password is required.";
  } else if (formData.password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  } else if (formData.password.length > 12) {
    fieldErrors.password = "Password cannot exceed 12 characters.";
  } else if (!passwordRegex.test(formData.password)) {
    fieldErrors.password = "1 number, 1 uppercase, 1 special character.";
  }

  if (!formData.confirmPassword) {
    fieldErrors.confirmPassword = "Confirm password is required";
  } else if (formData.confirmPassword !== formData.password) {
    fieldErrors.confirmPassword = "Passwords must match.";
  }

  if (!formData.isAgreed) {
    fieldErrors.isAgreed = "You must check above to proceed.";
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

function StateSelect({
  value,
  onChange,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
}>) {
  const selectedIndex = value ? states.indexOf(value) : -1;
  const defaultActiveIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleDocumentPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    document.addEventListener("touchstart", handleDocumentPointerDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentPointerDown);
      document.removeEventListener("touchstart", handleDocumentPointerDown);
    };
  }, []);

  function openStateList() {
    setActiveIndex(defaultActiveIndex);
    setOpen(true);
  }

  function toggleStateList() {
    if (open) {
      setOpen(false);
      return;
    }

    openStateList();
  }

  function selectState(nextState: string) {
    onChange(nextState);
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        openStateList();
        return;
      }
      setActiveIndex((current) =>
        Math.min(current + 1, states.length - 1)
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openStateList();
        return;
      }
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(states.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        selectState(states[activeIndex]);
        return;
      }
      openStateList();
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        id="state"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="state-options"
        onClick={toggleStateList}
        onKeyDown={handleKeyDown}
        className={`${inputClassName} flex items-center justify-between gap-3 text-left`}
      >
        <span className={value ? "text-[#000000]" : "text-[#666666]"}>
          {value || "Please select your state..."}
        </span>
        <ChevronDownIcon
          className={`size-5 shrink-0 text-[#4d4d4d] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <input type="hidden" name="state" value={value} />

      {open ? (
        <div
          id="state-options"
          role="listbox"
          aria-label="State"
          onKeyDown={handleKeyDown}
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-md border border-[#9333EA] bg-[#f7f7f7] py-1 shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
        >
          {states.map((state, index) => {
            const highlighted = index === activeIndex || state === value;

            return (
              <button
                id={`state-option-${index}`}
                key={state}
                type="button"
                role="option"
                aria-selected={state === value}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectState(state)}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none ${
                  highlighted
                    ? "bg-[#9333EA] text-[#ffffff]"
                    : "bg-[#f7f7f7] text-[#000000] hover:bg-[#9333EA] hover:text-[#ffffff]"
                }`}
              >
                <span>{state}</span>
                {state === value ? (
                  <CheckIcon className="size-4 shrink-0" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

const inputClassName =
  "block h-11 w-full rounded-md border border-[#999999] bg-[#f7f7f7] px-3 text-[#000000] outline-none transition-colors placeholder:text-[#666666] focus:border-[#9333EA]";

const labelClassName = "block font-extrabold text-[#000000]";
const requiredClassName = "text-[#4d4d4d]";
const mutedLinkClassName =
  "font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 hover:text-[#7E22CE]";

export default function CreateAccountClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { id, type, value } = event.target;
    const checked =
      event.target instanceof HTMLInputElement ? event.target.checked : false;

    setFormData((current) => ({
      ...current,
      [id]: type === "checkbox" ? checked : formatFieldValue(id, value),
    }));

    setErrors((current) => ({ ...current, [id]: undefined, general: undefined }));
  }

  function handleStateChange(state: string) {
    setFormData((current) => ({
      ...current,
      state,
    }));

    setErrors((current) => ({
      ...current,
      state: undefined,
      general: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateForm(formData);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/auth/signup"), {
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

      router.push("/verify-email");
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[#e6e6e6] px-2 py-8 sm:px-4 lg:py-12">
      <form
        className="flex w-full max-w-7xl flex-col"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-row">
          <section className="flex h-auto w-full flex-col justify-center rounded-md border border-[#999999] bg-[#f7f7f7] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.14)] lg:h-[460px] lg:w-[365px]">
            <label htmlFor="firstname" className={labelClassName}>
              Legal first name <span className={requiredClassName}>*</span>
            </label>
            <input
              type="text"
              placeholder="first name"
              id="firstname"
              onChange={handleChange}
              value={formData.firstname}
              maxLength={30}
              autoComplete="off"
              className={inputClassName}
            />
            <FieldError message={errors.firstname} />

            <label htmlFor="lastname" className={labelClassName}>
              Legal last name <span className={requiredClassName}>*</span>
            </label>
            <input
              type="text"
              placeholder="last name"
              id="lastname"
              onChange={handleChange}
              value={formData.lastname}
              maxLength={50}
              autoComplete="off"
              className={inputClassName}
            />
            <FieldError message={errors.lastname} />

            <div className="invisible mt-[34px] text-xs">
              The politicians who hate transgender people and want to legislate
              them out of existence, and the constituents who support that plan,
              are upset that a federal judge issued a preliminary injunction
              preventing the Department of Defense from removing transgender
              troops
            </div>
          </section>

          <section className="flex h-auto w-full flex-col justify-center rounded-md border border-[#999999] bg-[#f7f7f7] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.14)] lg:h-[460px] lg:w-[365px]">
            <label htmlFor="state" className={labelClassName}>
              State: <span className={requiredClassName}>*</span>
            </label>
            <StateSelect value={formData.state} onChange={handleStateChange} />
            <FieldError message={errors.state} />

            <label htmlFor="email" className={labelClassName}>
              Email <span className={requiredClassName}>*</span> (for log in
              later)
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              id="email"
              onChange={handleChange}
              value={formData.email}
              autoComplete="off"
              maxLength={60}
              className={inputClassName}
            />
            <FieldError message={errors.email} />

            <div className="invisible mt-[34px] text-xs">
              The politicians who hate transgender people and want to legislate
              them out of existence, and the constituents who support that plan,
              are upset that a federal judge issued a preliminary injunction
              preventing the Department of Defense from removing transgender
              troops
            </div>
          </section>

          <section className="flex h-auto w-full flex-col justify-center rounded-md border border-[#999999] bg-[#f7f7f7] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.14)] [&>*]:-translate-y-1.5 lg:h-[460px] lg:w-[365px]">
            <label htmlFor="password" className={labelClassName}>
              Password <span className={requiredClassName}>*</span> (8 - 12
              characters)
            </label>
            <input
              type="text"
              placeholder="1 number, 1 uppercase, 1 special character"
              id="password"
              onChange={handleChange}
              value={formData.password}
              autoComplete="off"
              maxLength={12}
              className={inputClassName}
            />
            <FieldError message={errors.password} />

            <label htmlFor="confirmPassword" className={labelClassName}>
              Confirm password <span className={requiredClassName}>*</span>
            </label>
            <input
              type="text"
              placeholder="Please type exact same password as above. Then write it down."
              id="confirmPassword"
              onChange={handleChange}
              value={formData.confirmPassword}
              autoComplete="off"
              maxLength={12}
              className={inputClassName}
            />
            <FieldError message={errors.confirmPassword} />

            <div className="flex items-start">
              <input
                type="checkbox"
                id="isAgreed"
                checked={formData.isAgreed}
                onChange={handleChange}
                autoComplete="off"
                className="mt-0.5 size-4 rounded border-[#999999] bg-[#f7f7f7] text-[#000000] focus:ring-3 focus:ring-[#808080]/40"
              />

              <label htmlFor="isAgreed" className="ml-2 text-xs leading-snug">
                <span className={requiredClassName}>*</span> I acknowledge that
                I have read, I understand, I expressly accept, and I am legally
                bound by the{" "}
                <Link href="/terms" target="_blank" className={mutedLinkClassName}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className={mutedLinkClassName}
                >
                  Privacy & Cookie
                </Link>
                , including{" "}
                <Link
                  href="/userrules"
                  target="_blank"
                  className={mutedLinkClassName}
                >
                  User Rules
                </Link>
                .
              </label>
            </div>
            <FieldError message={errors.isAgreed} />
          </section>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="mx-4 w-auto rounded-md border border-[#808080] bg-[#9333EA] px-12 py-3 text-4xl font-semibold text-[#ffffff] shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-colors hover:bg-[#7E22CE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#000000] disabled:opacity-60 sm:px-16 lg:px-48 lg:text-[45px]"
          >
            <span className="flex items-center justify-center gap-2 p-2">
              {loading ? (
                <LoaderCircleIcon
                  className="size-8 animate-spin"
                  aria-hidden="true"
                />
              ) : null}
              <span>{loading ? "Loading..." : "Submit"}</span>
              {!loading ? (
                <ArrowRightIcon className="size-8" aria-hidden="true" />
              ) : null}
            </span>
          </button>
        </div>

        <div className="mx-auto mt-2 w-full max-w-4xl" aria-live="polite">
          {errors.general ? (
            <div className="flex items-start gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-4 py-3 text-base text-[#B91C1C]">
              <TriangleAlertIcon
                className="mt-0.5 size-5 shrink-0"
                aria-hidden="true"
              />
              <span>{errors.general}</span>
            </div>
          ) : null}
        </div>
      </form>
    </main>
  );
}
