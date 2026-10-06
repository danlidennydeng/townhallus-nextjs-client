"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  CircleHelpIcon,
  EyeIcon,
  EyeOffIcon,
  FileTextIcon,
  LoaderCircleIcon,
  LogOutIcon,
  MessageSquareTextIcon,
  PenLineIcon,
  ShieldCheckIcon,
  SmileIcon,
  TriangleAlertIcon,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import {
  clearStoredUser,
  getStoredUser,
  mergeStoredUser,
  type TownHallUser,
} from "@/lib/auth-client";
import { pixelAvatarPath } from "@/lib/avatar";

type SensitiveInfo = {
  lastname?: string;
  driverlicense?: string;
  ssn?: string;
  birthday?: string;
};

type ProfileFormData = {
  state: string;
  introduction: string;
  driverlicense: string;
  ssn: string;
  birthday: string;
};

type ProfileErrors = Partial<Record<keyof ProfileFormData | "general", string>>;

type DashProfileClientProps = {
  initialTotalComments?: number | null;
  initialTotalPosts?: number | null;
  serverAvatar?: ReactNode;
  serverAvatarSeed?: string | null;
};

const initialProfileFormData: ProfileFormData = {
  state: "",
  introduction: "",
  driverlicense: "",
  ssn: "",
  birthday: "",
};

const inputClassName =
  "block h-11 w-full rounded-md border border-[#999999] bg-[#f7f7f7] px-3 text-[#000000] outline-none transition-colors placeholder:text-[#666666] focus:border-[#9333EA]";
const textareaClassName =
  "block min-h-32 w-full rounded-md border border-[#999999] bg-[#f7f7f7] px-3 py-2 text-[#000000] outline-none transition-colors placeholder:text-[#666666] focus:border-[#9333EA]";
const labelClassName = "flex justify-between gap-3 font-extrabold text-[#000000]";
const mutedLabelClassName = "text-sm font-medium text-[#4d4d4d]";
const accentLinkClassName =
  "font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 transition-colors hover:text-[#7E22CE]";
const countBadgeClassName =
  "inline-flex min-w-6 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] p-px text-sm font-extrabold leading-4 text-[#9333EA] align-middle shadow-[0_1px_1px_rgba(0,0,0,0.08)]";
const introductionMaxLength = 280;

function formatBirthday(value?: string) {
  const birthdayISO = value?.slice(0, 10);
  if (!birthdayISO) {
    return "";
  }

  const [year, month, day] = birthdayISO.split("-");
  return `${month}/${day}/${year}`;
}

function daysSince(value?: string) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date();
  return Math.floor(
    (today.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function validateProfileForm(formData: ProfileFormData) {
  const fieldErrors: ProfileErrors = {};

  if (formData.driverlicense) {
    if (formData.driverlicense.length < 7 || formData.driverlicense.length > 15) {
      fieldErrors.driverlicense =
        "Driver License number must be in between 7 and 15 digits";
    }
  }

  if (formData.ssn) {
    if (!/^\d{4}$/.test(formData.ssn)) {
      fieldErrors.ssn = "SSN number must be exactly last 4 digits";
    }
  }

  if (formData.introduction.length > introductionMaxLength) {
    fieldErrors.introduction = `Self-introduction must be ${introductionMaxLength} characters or less.`;
  }

  if (formData.birthday) {
    const parsedBirthday = new Date(formData.birthday);
    if (Number.isNaN(parsedBirthday.getTime())) {
      fieldErrors.birthday = "Birthday must be a valid date";
    }
  }

  return fieldErrors;
}

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as {
      message?: string;
      errors?: Array<{ msg?: string }>;
    };

    return data.errors?.[0]?.msg || data.message;
  } catch {
    return undefined;
  }
}

function Notice({
  message,
  tone = "error",
}: Readonly<{ message?: string; tone?: "error" | "success" }>) {
  if (!message) {
    return null;
  }

  const Icon = tone === "success" ? SmileIcon : TriangleAlertIcon;

  return (
    <div
      className={`flex items-start gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-2 text-sm leading-5 ${
        tone === "success" ? "text-[#15803D]" : "text-[#B91C1C]"
      }`}
      aria-live="polite"
    >
      <Icon
        className="mt-0.5 size-4 shrink-0"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

function FieldError({ message }: Readonly<{ message?: string }>) {
  return (
    <div className="mt-1 min-h-10 w-full" aria-live="polite">
      <Notice message={message} />
    </div>
  );
}

function StatusBadge({
  label,
  title,
  rounded = "full",
  guideOpen,
  onToggleGuide,
}: Readonly<{
  label: string;
  title: string;
  rounded?: "full" | "md";
  guideOpen: boolean;
  onToggleGuide: () => void;
}>) {
  return (
    <button
      type="button"
      title={title}
      aria-label={`${title}: ${guideOpen ? "hide" : "show"} Status Guide`}
      aria-expanded={guideOpen}
      aria-controls="status-guide"
      onClick={onToggleGuide}
      className={`flex size-7 items-center justify-center border-2 border-[#9333EA] bg-transparent p-0 text-sm font-bold text-[#9333EA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA] ${
        rounded === "full" ? "rounded-full" : "rounded-md"
      }`}
    >
      {label}
    </button>
  );
}

export default function DashProfileClient({
  initialTotalComments,
  initialTotalPosts,
  serverAvatar,
  serverAvatarSeed,
}: Readonly<DashProfileClientProps>) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<TownHallUser | null>(null);
  const [totalComments, setTotalComments] = useState<number | null>(
    typeof initialTotalComments === "number" ? initialTotalComments : null
  );
  const [totalPosts, setTotalPosts] = useState<number | null>(
    typeof initialTotalPosts === "number" ? initialTotalPosts : null
  );
  const [sensitiveInfo, setSensitiveInfo] = useState<SensitiveInfo>({});
  const [formData, setFormData] = useState<ProfileFormData>(
    initialProfileFormData
  );
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sensitiveLoading, setSensitiveLoading] = useState(false);
  const [statusGuideOpen, setStatusGuideOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const logoutDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const storedUser = getStoredUser();
      if (!storedUser?._id) {
        router.replace("/log-in");
        return;
      }

      setCurrentUser(storedUser);
      setFormData({
        state: storedUser.state || "",
        introduction: storedUser.introduction || "",
        driverlicense: "",
        ssn: "",
        birthday: "",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [router]);

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    let ignore = false;
    const params = new URLSearchParams({
      limit: "1",
      startIndex: "0",
      userId: currentUser._id,
    });

    async function fetchPostCount() {
      try {
        const response = await fetch(
          apiUrl(`/post/getposts?${params.toString()}`),
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { totalPosts?: number };
        if (!ignore && typeof data.totalPosts === "number") {
          setTotalPosts(data.totalPosts);
        }
      } catch {
        // Keep the server-provided count if the browser refresh fails.
      }
    }

    fetchPostCount();

    return () => {
      ignore = true;
    };
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    const userId = currentUser._id;
    let ignore = false;
    const params = new URLSearchParams({
      limit: "1",
      startIndex: "0",
    });

    async function fetchCommentCount() {
      try {
        const response = await fetch(
          apiUrl(`/comment/getUserComments/${userId}?${params.toString()}`),
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { totalComments?: number };
        if (!ignore && typeof data.totalComments === "number") {
          setTotalComments(data.totalComments);
        }
      } catch {
        // Keep the server-provided count if the browser refresh fails.
      }
    }

    fetchCommentCount();

    return () => {
      ignore = true;
    };
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    const userId = currentUser._id;

    async function fetchSensitiveInfo() {
      setSensitiveLoading(true);

      try {
        const response = await fetch(apiUrl(`/user/${userId}/sensitive`), {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          const message = await readResponseMessage(response);
          setErrors((current) => ({
            ...current,
            general: message || "Failed to fetch user info",
          }));
          return;
        }

        const data = (await response.json()) as SensitiveInfo;
        setSensitiveInfo(data);
        setFormData((current) => ({
          ...current,
          driverlicense: data.driverlicense || "",
          ssn: data.ssn || "",
          birthday: data.birthday?.slice(0, 10) || "",
        }));
      } catch {
        setErrors((current) => ({
          ...current,
          general: "Failed to fetch user info",
        }));
      } finally {
        setSensitiveLoading(false);
      }
    }

    fetchSensitiveInfo();
  }, [currentUser?._id]);

  const fullLegalName = useMemo(() => {
    return [currentUser?.firstname, sensitiveInfo.lastname].filter(Boolean).join(" ");
  }, [currentUser?.firstname, sensitiveInfo.lastname]);

  const canUpdateLocation = daysSince(currentUser?.updatedAt) >= 90;
  const introductionCharactersRemaining = Math.max(
    0,
    introductionMaxLength - formData.introduction.length
  );
  const birthdayFormatted = formatBirthday(sensitiveInfo.birthday);
  const commentCount = totalComments ?? 0;
  const postCount = totalPosts ?? 0;
  const statusBadges = [
    currentUser?.isVoter
      ? { label: "V", title: "U.S. Voter Verified", rounded: "full" as const }
      : null,
    currentUser?.isCitizen
      ? { label: "Z", title: "U.S. Citizen Verified", rounded: "full" as const }
      : null,
    currentUser?.isAdmin
      ? { label: "A", title: "Administrator", rounded: "full" as const }
      : null,
    currentUser?.isPoster
      ? { label: "P", title: "Post or Publish Privilege", rounded: "md" as const }
      : null,
    currentUser?.isCommenter
      ? { label: "C", title: "Comment Privilege", rounded: "md" as const }
      : null,
  ].filter(Boolean);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { id, value } = event.target;

    setErrors((current) => ({ ...current, [id]: undefined, general: undefined }));
    setUpdateUserSuccess(undefined);
    setFormData((current) => ({
      ...current,
      [id]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser?._id) {
      setErrors({ general: "Please log in again." });
      router.replace("/log-in");
      return;
    }

    const fieldErrors = validateProfileForm(formData);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setUpdateUserSuccess(undefined);
    setLoading(true);

    try {
      const response = await fetch(apiUrl(`/user/update/${currentUser._id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const message = await readResponseMessage(response);
        setErrors({ general: message || "Update failed" });
        return;
      }

      const updatedUser = (await response.json()) as TownHallUser;
      const mergedUser = mergeStoredUser(updatedUser);
      setCurrentUser(mergedUser);
      setSensitiveInfo((current) => ({
        ...current,
        lastname: current.lastname,
        driverlicense: formData.driverlicense,
        ssn: formData.ssn,
        birthday: formData.birthday,
      }));
      setUpdateUserSuccess("Your profile has been updated successfully.");
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);
    try {
      await fetch(apiUrl("/user/logout"), {
        method: "POST",
        credentials: "include",
      });
    } finally {
      clearStoredUser();
      logoutDialogRef.current?.close();
      setLogoutLoading(false);
      router.push("/log-in");
    }
  }

  if (!currentUser) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12">
        <div className="flex items-center gap-3 rounded-md border border-[#999999] bg-[#f7f7f7] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          <LoaderCircleIcon className="size-5 animate-spin text-[#9333EA]" />
          <span className="font-semibold text-[#000000]">Loading profile...</span>
        </div>
      </main>
    );
  }

  const profileAvatar =
    serverAvatarSeed === currentUser._id && serverAvatar ? (
      serverAvatar
    ) : (
      <Image
        src={pixelAvatarPath(currentUser._id)}
        alt={`${currentUser.username || "User"} avatar`}
        width={128}
        height={128}
        priority
        unoptimized
        className="size-full object-cover [image-rendering:pixelated]"
      />
    );

  return (
    <main className="flex flex-1 bg-[#e6e6e6] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 lg:grid-cols-[420px_minmax(0,840px)] lg:gap-5">
        <aside className="space-y-4">
          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border border-[#9333EA] bg-[#eeeeee] shadow-[0_2px_6px_rgba(0,0,0,0.16)]">
                {profileAvatar}
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xl font-semibold text-[#000000]">
                <EyeOffIcon className="size-5 text-[#4d4d4d]" aria-hidden="true" />
                <span>{fullLegalName || currentUser.firstname || "Legal name"}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-lg font-semibold text-[#9333EA]">
                <EyeIcon className="size-5 text-[#4d4d4d]" aria-hidden="true" />
                <span>{currentUser.username || "Username"}</span>
                {statusBadges.map((badge) =>
                  badge ? (
                    <StatusBadge
                      key={badge.label}
                      label={badge.label}
                      title={badge.title}
                      rounded={badge.rounded}
                      guideOpen={statusGuideOpen}
                      onToggleGuide={() => setStatusGuideOpen((open) => !open)}
                    />
                  ) : null
                )}
              </div>

              <section
                id="status-guide"
                hidden={!statusGuideOpen}
                aria-labelledby="status-guide-heading"
                className="mt-5 w-full rounded-md border border-[#c4c4c4] bg-[#eeeeee] p-3 text-left"
              >
                <h2
                  id="status-guide-heading"
                  className="flex items-center gap-2 font-semibold text-[#000000]"
                >
                  <CircleHelpIcon className="size-5 text-[#9333EA]" aria-hidden="true" />
                  Status Guide
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-[#1f1f1f]">
                  <li>Hidden eye = legal information is private.</li>
                  <li>Visible eye = public username and badges.</li>
                  <li>V = U.S. Voter Verified.</li>
                  <li>Z = U.S. Citizen Verified.</li>
                  <li>A = Administrator.</li>
                  <li>P = Post or Publish Privilege.</li>
                  <li>C = Comment Privilege.</li>
                </ul>
                <Link href="/faqpage" className={`mt-3 block ${accentLinkClassName}`}>
                  Learn more
                </Link>
              </section>
            </div>
          </section>

          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={mutedLabelClassName}>Account Actions</p>
                <p className="font-semibold text-[#000000]">
                  {currentUser.isPoster ? "Posting enabled" : "Profile access"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => logoutDialogRef.current?.showModal()}
                aria-haspopup="dialog"
                disabled={logoutLoading}
                className="border-[#9333EA] bg-transparent text-[#000000] hover:bg-[#d6d6d6]"
              >
                <LogOutIcon className="size-4" aria-hidden="true" />
                Log Out
              </Button>
            </div>

            {currentUser.isPoster ? (
              <Button
                nativeButton={false}
                render={<Link href="/create-post" />}
                className="mt-4 w-full bg-[#9333EA] text-[#ffffff] hover:bg-[#7E22CE]"
              >
                <PenLineIcon className="size-4" aria-hidden="true" />
                Create A Post
              </Button>
            ) : null}
          </section>

          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={mutedLabelClassName}>My Posts</p>
                <p className="font-semibold text-[#000000]">
                  <span className={countBadgeClassName}>{postCount}</span>{" "}
                  posts I have published
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
                <FileTextIcon className="size-5" aria-hidden="true" />
              </span>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/dashpost" />}
              className="mt-4 w-full border-[#9333EA] bg-[#9333EA] text-[#ffffff] hover:bg-[#7E22CE]"
            >
              <ArrowRightIcon className="size-4" aria-hidden="true" />
              Open My Posts
            </Button>
          </section>

          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className={mutedLabelClassName}>My Comments</p>
                <p className="font-semibold text-[#000000]">
                  <span className={countBadgeClassName}>{commentCount}</span>{" "}
                  comments I have made
                </p>
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#9333EA] bg-[#eeeeee] text-[#9333EA]">
                <MessageSquareTextIcon className="size-5" aria-hidden="true" />
              </span>
            </div>

            <Button
              nativeButton={false}
              render={<Link href="/dashcomment" />}
              className="mt-4 w-full border-[#9333EA] bg-[#9333EA] text-[#ffffff] hover:bg-[#7E22CE]"
            >
              <ArrowRightIcon className="size-4" aria-hidden="true" />
              Open My Comments
            </Button>
          </section>
        </aside>

        <section className="space-y-6">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)] sm:p-5"
          >
            <div className="flex flex-col gap-2 border-b border-[#c4c4c4] pb-4 sm:flex-row sm:items-center sm:justify-between">
              {sensitiveLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#4d4d4d]">
                  <LoaderCircleIcon className="size-4 animate-spin" />
                  Loading private fields
                </div>
              ) : null}
              <p className="text-right text-sm font-bold text-[#000000] sm:ml-auto">
                Profile Details
              </p>
            </div>

            {!currentUser.isVoter ? (
              <section className="mt-5 rounded-md border border-[#c4c4c4] bg-[#eeeeee] p-4">
                <div className="mb-5 flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#999999] bg-[#f7f7f7]">
                    <ShieldCheckIcon className="size-5 text-[#9333EA]" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-[#000000]">
                      Please be proud to verify your citizenship or voter status.
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#4d4d4d]">
                      These fields are treated as private account verification
                      information.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="driverlicense" className={labelClassName}>
                      <span>Driver License number</span>
                    </label>
                    <p className="mb-1 min-h-5 text-sm text-[#9333EA]">
                      {sensitiveInfo.driverlicense || "Driver License number?"}
                    </p>
                    <input
                      type="text"
                      id="driverlicense"
                      name="driverlicense"
                      maxLength={15}
                      autoComplete="off"
                      placeholder="7 - 15 digits"
                      value={formData.driverlicense}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                    <FieldError message={errors.driverlicense} />
                  </div>

                  <div>
                    <label htmlFor="birthday" className={labelClassName}>
                      <span>Birthday</span>
                    </label>
                    <p className="mb-1 min-h-5 text-sm text-[#9333EA]">
                      {birthdayFormatted || "Birthday?"}
                    </p>
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      autoComplete="off"
                      value={formData.birthday}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                    <FieldError message={errors.birthday} />
                  </div>

                  <div>
                    <label htmlFor="ssn" className={labelClassName}>
                      <span>Social Security Number</span>
                    </label>
                    <p className="mb-1 min-h-5 text-sm text-[#9333EA]">
                      {sensitiveInfo.ssn || "SSN number?"}
                    </p>
                    <input
                      type="text"
                      id="ssn"
                      name="ssn"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="\\d*"
                      autoComplete="off"
                      placeholder="Last 4 digits"
                      value={formData.ssn}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                    <FieldError message={errors.ssn} />
                  </div>
                </div>
              </section>
            ) : null}

            <section className="mt-5">
              <label htmlFor="state" className={labelClassName}>
                <span>Your state</span>
                <span className="text-[#9333EA]">
                  {currentUser.state || "State?"}
                </span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!canUpdateLocation}
                className={`${inputClassName} disabled:bg-[#eeeeee] disabled:text-[#4d4d4d]`}
              />
              <p className="mt-1 text-xs text-[#4d4d4d]">
                {canUpdateLocation
                  ? "Location update is available."
                  : "State can be changed after 90 days from the last profile update."}
              </p>
            </section>

            <section className="mt-5">
              <label htmlFor="introduction" className={labelClassName}>
                <span>Self-introduction</span>
                <span className="text-sm text-[#9333EA]">
                  <strong>{introductionCharactersRemaining}</strong>{" "}
                  <strong>characters remaining</strong>
                </span>
              </label>
              <textarea
                id="introduction"
                name="introduction"
                rows={5}
                maxLength={introductionMaxLength}
                placeholder={`Maximum ${introductionMaxLength} characters. Other users can see your contents here. Type a space then update to delete existing contents. No HTML tags.`}
                value={formData.introduction}
                onChange={handleChange}
                className={textareaClassName}
              />
              <FieldError message={errors.introduction} />

              <div className="rounded-md border border-[#c4c4c4] bg-[#eeeeee] p-3 text-sm italic font-semibold text-[#4d4d4d]">
                {currentUser.introduction || "No self-introduction yet?"}
              </div>
            </section>

            <div className="mt-5 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 border border-[#9333EA] bg-[#9333EA] text-base font-semibold text-[#ffffff] hover:bg-[#7E22CE]"
              >
                {loading ? (
                  <LoaderCircleIcon
                    className="size-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                <span>{loading ? "Loading..." : "Update"}</span>
                {!loading ? (
                  <ArrowRightIcon className="size-5" aria-hidden="true" />
                ) : null}
              </Button>

              <Notice message={errors.general} />
              <Notice message={updateUserSuccess} tone="success" />
            </div>
          </form>
        </section>
      </div>
      <dialog
        ref={logoutDialogRef}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        onCancel={(event) => {
          if (logoutLoading) {
            event.preventDefault();
          }
        }}
        className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-md border border-[#999999] bg-[#f7f7f7] p-5 text-center shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop:bg-[#000000]/45"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-[#9333EA] bg-[#eeeeee]">
          <LogOutIcon className="size-7 text-[#9333EA]" aria-hidden="true" />
        </div>
        <h2
          id="logout-dialog-title"
          className="mt-4 text-lg font-semibold text-[#000000]"
        >
          Log out of your account?
        </h2>
        <p id="logout-dialog-description" className="mt-2 text-sm text-[#4d4d4d]">
          Are you sure you want to log out?
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            autoFocus
            disabled={logoutLoading}
            onClick={() => logoutDialogRef.current?.close()}
            className="border-[#9333EA] bg-transparent text-[#000000]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={logoutLoading}
            onClick={handleLogout}
            className="border border-[#9333EA] bg-[#9333EA] text-[#ffffff]"
          >
            {logoutLoading ? (
              <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOutIcon className="size-4" aria-hidden="true" />
            )}
            {logoutLoading ? "Logging out..." : "Log Out"}
          </Button>
        </div>
      </dialog>
    </main>
  );
}
