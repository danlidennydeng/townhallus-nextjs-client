"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  BoldIcon,
  FileTextIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  VideoIcon,
} from "lucide-react";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Value } from "platejs";
import {
  Plate,
  PlateContent,
  PlateElement,
  createPlatePlugin,
  usePlateEditor,
  type PlateElementProps,
} from "platejs/react";
import { BoldPlugin, ItalicPlugin } from "@platejs/basic-nodes/react";
import { LinkPlugin } from "@platejs/link/react";
import { LinkRules, upsertLink } from "@platejs/link";

import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import {
  getStoredUserSnapshot,
  mergeStoredUser,
  parseStoredUserSnapshot,
  subscribeToAuthChanges,
  type TownHallUser,
} from "@/lib/auth-client";

type CreatePostErrors = Partial<
  Record<"title" | "content" | "scope" | "link" | "general", string>
>;

type LinkKind = "image" | "document" | "video";

type PlateTextNode = {
  bold?: boolean;
  italic?: boolean;
  text: string;
};

type PlateContentNode = {
  alt?: string;
  children?: PlateNode[];
  linkKind?: LinkKind;
  target?: string;
  type?: string;
  url?: string;
};

type PlateNode = PlateContentNode | PlateTextNode;

const titleMaxLength = 280;
const contentMaxLength = 20000;
const initialEditorValue: Value = [{ type: "p", children: [{ text: "" }] }];
const serverAuthSnapshot = "__townhallus_server_auth_snapshot__";

const inputClassName =
  "block w-full rounded-md border border-[#999999] bg-[#f7f7f7] px-3 text-[#000000] outline-none transition-colors placeholder:text-[#666666] focus:border-[#9333EA]";
const labelClassName =
  "flex flex-wrap items-center justify-between gap-2 font-extrabold text-[#000000]";
const mutedTextClassName = "text-sm text-[#4d4d4d]";
const accentLinkClassName =
  "font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4 transition-colors hover:text-[#7E22CE]";
const resetButtonClassName =
  "size-9 shrink-0 border-[#9333EA] bg-transparent text-[#000000]";

const linkKinds: Array<{
  icon: typeof ImageIcon;
  id: LinkKind;
  label: string;
}> = [
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "document", label: "Document", icon: FileTextIcon },
  { id: "video", label: "Video", icon: VideoIcon },
];

function LinkElement(props: PlateElementProps) {
  const element = props.element as PlateContentNode;
  const href = isSafeExternalUrl(element.url) ? element.url : undefined;

  return (
    <PlateElement
      as="a"
      {...props}
      attributes={{
        ...props.attributes,
        href,
        target: "_blank",
      }}
      className="text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4"
    />
  );
}

function ImageElement(props: PlateElementProps) {
  const element = props.element as PlateContentNode;
  const src = isSafeExternalUrl(element.url) ? element.url : undefined;
  const alt = element.alt?.trim() || "External image";

  return (
    <PlateElement {...props} className="my-3">
      <div
        contentEditable={false}
        className="overflow-hidden rounded-md border border-[#999999] bg-[#f7f7f7] shadow-[0_1px_2px_rgba(0,0,0,0.14)]"
      >
        {src ? (
          <>
            {/* User-provided external previews cannot be preconfigured for next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="max-h-[420px] w-full bg-[#e6e6e6] object-contain"
            />
            <div className="border-t border-[#c4c4c4] px-3 py-2 text-sm">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#9333EA] underline decoration-[#808080] decoration-2 underline-offset-4"
              >
                Open external image
              </a>
            </div>
          </>
        ) : (
          <div className="px-3 py-4 text-sm font-semibold text-[#4d4d4d]">
            Image link unavailable.
          </div>
        )}
      </div>
      {props.children}
    </PlateElement>
  );
}

const ExternalImagePlugin = createPlatePlugin({
  key: "image",
  node: {
    isElement: true,
    isVoid: true,
  },
  render: {
    node: ImageElement,
  },
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isTextNode(node: PlateNode): node is PlateTextNode {
  return "text" in node;
}

function isSafeExternalUrl(value?: string) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function getPlainText(nodes: Value | PlateNode[] = []): string {
  return nodes
    .map((node) => {
      const plateNode = node as PlateNode;

      if (isTextNode(plateNode)) {
        return plateNode.text;
      }

      return getPlainText((plateNode.children || []) as Value);
    })
    .join("");
}

function hasSerializableContent(nodes: Value | PlateNode[] = []): boolean {
  return nodes.some((node) => {
    const plateNode = node as PlateNode;

    if (isTextNode(plateNode)) {
      return plateNode.text.trim().length > 0;
    }

    if (plateNode.type === "image" && isSafeExternalUrl(plateNode.url)) {
      return true;
    }

    return hasSerializableContent((plateNode.children || []) as Value);
  });
}

function serializeInlineNode(node: PlateNode): string {
  if (isTextNode(node)) {
    let html = escapeHtml(node.text);

    if (node.bold) {
      html = `<strong>${html}</strong>`;
    }

    if (node.italic) {
      html = `<em>${html}</em>`;
    }

    return html;
  }

  const children = (node.children || []).map(serializeInlineNode).join("");

  const safeUrl = node.url;

  if (node.type === "a" && safeUrl && isSafeExternalUrl(safeUrl)) {
    return `<a href="${escapeHtml(safeUrl)}" target="_blank">${
      children || escapeHtml(safeUrl)
    }</a>`;
  }

  return children;
}

function serializeBlockNode(node: PlateNode): string {
  if (isTextNode(node)) {
    return serializeInlineNode(node);
  }

  const imageUrl = node.url;

  if (node.type === "image" && imageUrl && isSafeExternalUrl(imageUrl)) {
    const safeUrl = escapeHtml(imageUrl);
    const label = escapeHtml(node.alt?.trim() || imageUrl);

    return `<p><a href="${safeUrl}" target="_blank">${label}</a></p>`;
  }

  const children = (node.children || []).map(serializeInlineNode).join("");

  return `<p>${children}</p>`;
}

function serializePlateValue(value: Value): string {
  if (!hasSerializableContent(value)) {
    return "";
  }

  return (value as PlateNode[]).map(serializeBlockNode).join("");
}

async function readResponseMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message;
  } catch {
    return undefined;
  }
}

function Notice({
  message,
}: Readonly<{
  message?: string;
}>) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="flex items-start gap-2 rounded-md border border-[#999999] bg-[#eeeeee] px-3 py-2 text-sm leading-5 text-[#000000]"
      aria-live="polite"
    >
      <TriangleAlertIcon
        className="mt-0.5 size-4 shrink-0 text-[#4d4d4d]"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

export default function CreatePostClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [contentValue, setContentValue] = useState<Value>(initialEditorValue);
  const [statewideScope, setStatewideScope] = useState(true);
  const [errors, setErrors] = useState<CreatePostErrors>({});
  const [loading, setLoading] = useState(false);
  const [linkKind, setLinkKind] = useState<LinkKind | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      ExternalImagePlugin,
      LinkPlugin.configure({
        inputRules: [
          LinkRules.markdown(),
          LinkRules.autolink({ variant: "paste" }),
          LinkRules.autolink({ variant: "space" }),
          LinkRules.autolink({ variant: "break" }),
        ],
        render: {
          node: LinkElement,
        },
      }),
    ],
    value: initialEditorValue,
  });
  const storedUserSnapshot = useSyncExternalStore(
    subscribeToAuthChanges,
    getStoredUserSnapshot,
    () => serverAuthSnapshot
  );
  const isAuthSnapshotPending = storedUserSnapshot === serverAuthSnapshot;
  const currentUser = useMemo(
    () =>
      isAuthSnapshotPending ? null : parseStoredUserSnapshot(storedUserSnapshot),
    [isAuthSnapshotPending, storedUserSnapshot]
  );

  useEffect(() => {
    if (isAuthSnapshotPending) {
      return;
    }

    if (!currentUser?._id) {
      router.replace("/log-in");
      return;
    }

    if (!currentUser.isPoster) {
      router.replace("/dashprofile");
    }
  }, [currentUser, isAuthSnapshotPending, router]);

  useEffect(() => {
    if (!currentUser?._id || !currentUser.isPoster) {
      return;
    }

    const userId = currentUser._id;

    async function refreshUserState() {
      try {
        const response = await fetch(apiUrl(`/user/${userId}`), {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const user = (await response.json()) as TownHallUser;
        mergeStoredUser(user);
      } catch {
        // Local profile state is enough to keep the form usable.
      }
    }

    refreshUserState();
  }, [currentUser?._id, currentUser?.isPoster]);

  const titleCharactersRemaining = titleMaxLength - title.length;
  const contentPlainText = useMemo(
    () => getPlainText(contentValue),
    [contentValue]
  );
  const contentCharactersRemaining = Math.max(
    0,
    contentMaxLength - contentPlainText.length
  );
  const selectedState = currentUser?.state?.trim() || "";
  const storedScope = statewideScope && selectedState ? selectedState : "Nationwide";

  function resetTitle() {
    setTitle("");
    setErrors((current) => ({ ...current, title: undefined, general: undefined }));
  }

  function resetContent() {
    editor.tf.setValue(initialEditorValue);
    setContentValue(initialEditorValue);
    setErrors((current) => ({
      ...current,
      content: undefined,
      general: undefined,
    }));
  }

  function handleTitleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setTitle(event.target.value);
    setErrors((current) => ({ ...current, title: undefined, general: undefined }));
  }

  function handleStatewideClick() {
    setStatewideScope((current) => !current);
    setErrors((current) => ({ ...current, scope: undefined, general: undefined }));
  }

  function toggleMark(mark: "bold" | "italic") {
    const transforms = editor.tf as unknown as Record<
      "bold" | "italic",
      { toggle?: () => void }
    >;

    transforms[mark].toggle?.();
  }

  function openLinkPanel(kind: LinkKind) {
    setLinkKind(kind);
    setLinkUrl("");
    setLinkText(
      kind === "document"
        ? "External document"
        : kind === "video"
          ? "External video"
          : ""
    );
    setErrors((current) => ({ ...current, link: undefined, general: undefined }));
  }

  function insertExternalLink() {
    const cleanUrl = linkUrl.trim();
    const cleanText = linkText.trim();

    if (!isSafeExternalUrl(cleanUrl)) {
      setErrors((current) => ({
        ...current,
        link: "Please enter a valid external http or https URL.",
      }));
      return;
    }

    if (linkKind === "image") {
      editor.tf.insertNodes([
        {
          alt: cleanText || "External image",
          children: [{ text: "" }],
          type: "image",
          url: cleanUrl,
        },
        {
          children: [{ text: "" }],
          type: "p",
        },
      ] as never);
      setContentValue(editor.children as Value);
      setLinkKind(null);
      setLinkUrl("");
      setLinkText("");
      setErrors((current) => ({
        ...current,
        link: undefined,
        general: undefined,
      }));
      return;
    }

    upsertLink(editor, {
      insertTextInLink: true,
      target: "_blank",
      text: cleanText || cleanUrl,
      url: cleanUrl,
    });

    setContentValue(editor.children as Value);
    setLinkKind(null);
    setLinkUrl("");
    setLinkText("");
    setErrors((current) => ({ ...current, link: undefined, general: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser?._id) {
      router.replace("/log-in");
      return;
    }

    const cleanTitle = title.trim();
    const contentHtml = serializePlateValue(contentValue);
    const fieldErrors: CreatePostErrors = {};

    if (cleanTitle.length < 3) {
      fieldErrors.title = "Title must be at least 3 characters.";
    } else if (cleanTitle.length > titleMaxLength) {
      fieldErrors.title = "Title content should not exceed 280 characters.";
    }

    if (contentPlainText.length > contentMaxLength) {
      fieldErrors.content = "Content should not exceed 20,000 characters.";
    } else if (contentHtml.length > contentMaxLength) {
      fieldErrors.content =
        "Content markup is too long. Please shorten the post body.";
    }

    if (statewideScope && !selectedState) {
      fieldErrors.scope =
        "Your profile state is unavailable. Update your profile or publish nationwide.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(apiUrl("/post/create"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: "",
          content: contentHtml,
          county: "",
          state: storedScope,
          title: cleanTitle,
        }),
      });

      if (!response.ok) {
        const message = await readResponseMessage(response);
        setErrors({ general: message || "Something went wrong." });
        return;
      }

      const data = (await response.json()) as { slug?: string };
      router.push(data.slug ? `/post/${data.slug}` : "/");
    } catch {
      setErrors({ general: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  if (isAuthSnapshotPending || !currentUser) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#e6e6e6] px-4 py-12">
        <div className="flex items-center gap-3 rounded-md border border-[#999999] bg-[#f7f7f7] px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
          <LoaderCircleIcon className="size-5 animate-spin text-[#9333EA]" />
          <span className="font-semibold text-[#000000]">Loading editor...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 bg-[#e6e6e6] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <section className="min-w-0 rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)] sm:p-5">
          <div className="border-b border-[#c4c4c4] pb-4">
            <p className={mutedTextClassName}>Create Post</p>
            <h1 className="text-2xl font-semibold leading-tight text-[#000000]">
              Publish a TownHallUS post.
            </h1>
          </div>

          <section className="mt-5">
            <div className={labelClassName}>
              <label htmlFor="title">Title *</label>
              <div className="flex items-center gap-2 text-sm text-[#9333EA]">
                <span>
                  <strong>{titleCharactersRemaining}</strong>{" "}
                  <strong>characters remaining</strong>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Reset title"
                  title="Reset title"
                  onClick={resetTitle}
                  className={resetButtonClassName}
                >
                  <RotateCcwIcon className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <textarea
              id="title"
              rows={5}
              required
              maxLength={titleMaxLength}
              value={title}
              onChange={handleTitleChange}
              onFocus={() =>
                setErrors((current) => ({
                  ...current,
                  title: undefined,
                  general: undefined,
                }))
              }
              placeholder="Required. Minimum 3, maximum 280 characters."
              className={`${inputClassName} mt-2 min-h-32 py-2`}
            />
            <div className="mt-2 min-h-10">
              <Notice message={errors.title} />
            </div>
          </section>

          <section className="mt-3">
            <div className={labelClassName}>
              <span>Content</span>
              <div className="flex items-center gap-2 text-sm text-[#9333EA]">
                <span>
                  <strong>{contentCharactersRemaining.toLocaleString()}</strong>{" "}
                  <strong>characters remaining</strong>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Reset content"
                  title="Reset content"
                  onClick={resetContent}
                  className={resetButtonClassName}
                >
                  <RotateCcwIcon className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="mt-2 overflow-hidden rounded-md border border-[#999999] bg-[#eeeeee]">
              <div className="flex flex-wrap items-center gap-2 border-b border-[#c4c4c4] bg-[#f7f7f7] p-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Bold"
                  title="Bold"
                  onClick={() => toggleMark("bold")}
                  className="size-9 border-[#999999] bg-transparent text-[#000000]"
                >
                  <BoldIcon className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Italic"
                  title="Italic"
                  onClick={() => toggleMark("italic")}
                  className="size-9 border-[#999999] bg-transparent text-[#000000]"
                >
                  <ItalicIcon className="size-4" aria-hidden="true" />
                </Button>
                <span className="mx-1 h-7 w-px bg-[#c4c4c4]" aria-hidden="true" />
                {linkKinds.map((kind) => {
                  const Icon = kind.icon;

                  return (
                    <Button
                      key={kind.id}
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Add ${kind.label.toLowerCase()} link`}
                      title={`Add ${kind.label.toLowerCase()} link`}
                      onClick={() => openLinkPanel(kind.id)}
                      className="size-9 border-[#9333EA] bg-transparent text-[#000000]"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </Button>
                  );
                })}
              </div>

              {linkKind ? (
                <div className="grid gap-3 border-b border-[#c4c4c4] bg-[#eeeeee] p-3 md:grid-cols-[1fr_180px_auto]">
                  <label className="min-w-0">
                    <span className="text-sm font-semibold text-[#000000]">
                      External URL
                    </span>
                    <input
                      type="url"
                      autoComplete="off"
                      value={linkUrl}
                      onChange={(event) => {
                        setLinkUrl(event.target.value);
                        setErrors((current) => ({ ...current, link: undefined }));
                      }}
                      className={`${inputClassName} mt-1 h-10`}
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="text-sm font-semibold text-[#000000]">
                      {linkKind === "image" ? "Image description" : "Link text"}
                    </span>
                    <input
                      type="text"
                      placeholder={
                        linkKind === "image" ? "Optional alt text" : undefined
                      }
                      value={linkText}
                      onChange={(event) => setLinkText(event.target.value)}
                      className={`${inputClassName} mt-1 h-10`}
                    />
                  </label>
                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      onClick={insertExternalLink}
                      className="h-10 border border-[#9333EA] bg-[#9333EA] text-[#ffffff]"
                    >
                      <LinkIcon className="size-4" aria-hidden="true" />
                      Insert
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLinkKind(null)}
                      className="h-10 border-[#9333EA] bg-transparent text-[#000000]"
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="md:col-span-3">
                    <Notice message={errors.link} />
                  </div>
                </div>
              ) : null}

              <Plate
                editor={editor}
                onChange={({ value }) => {
                  setContentValue(value as Value);
                  setErrors((current) => ({
                    ...current,
                    content: undefined,
                    general: undefined,
                  }));
                }}
              >
                <PlateContent
                  placeholder="Optional. Long-form post body, external links, and supporting context."
                  className="min-h-[360px] px-4 py-3 text-base leading-7 text-[#000000] outline-none focus:outline-none [&_[data-slate-placeholder=true]]:text-[#666666] [&_a]:text-[#9333EA] [&_a]:underline [&_strong]:font-bold"
                  style={{ minHeight: 320 }}
                />
              </Plate>
            </div>

            <div className="mt-2 min-h-10">
              <Notice message={errors.content} />
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <p className={mutedTextClassName}>Scope</p>
            <fieldset className="mt-3">
              <legend className="font-semibold text-[#000000]">
                Statewide scope
              </legend>
              <button
                type="button"
                role="radio"
                aria-checked={statewideScope}
                onClick={handleStatewideClick}
                className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-md border border-[#c4c4c4] bg-[#eeeeee] px-3 py-3 text-left transition-colors hover:border-[#9333EA] hover:bg-[#ffffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9333EA]"
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    statewideScope ? "border-[#9333EA]" : "border-[#808080]"
                  }`}
                  aria-hidden="true"
                >
                  {statewideScope ? (
                    <span className="size-2.5 rounded-full bg-[#9333EA]" />
                  ) : null}
                </span>
                <span className="font-semibold text-[#000000]">Yes</span>
              </button>
            </fieldset>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-t border-[#c4c4c4] pt-3">
                <dt className="font-semibold text-[#000000]">Your state</dt>
                <dd className="font-semibold text-[#000000]">
                  {selectedState || "Unavailable"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-semibold text-[#000000]">Stored scope</dt>
                <dd className="font-semibold text-[#9333EA]">{storedScope}</dd>
              </div>
            </dl>

            <div className="mt-3 min-h-10">
              <Notice message={errors.scope} />
            </div>
          </section>

          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <p className={mutedTextClassName}>Author</p>
            <p className="mt-1 break-words text-lg font-semibold text-[#000000]">
              @{currentUser.username || "anonymous"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
              Posts are published through the Express API and stored in MongoDB
              under your account.
            </p>
            <Link href="/dashprofile" className={`mt-3 block ${accentLinkClassName}`}>
              Review profile
            </Link>
          </section>

          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full border border-[#9333EA] bg-[#9333EA] text-base font-semibold text-[#ffffff]"
            >
              {loading ? (
                <LoaderCircleIcon className="size-5 animate-spin" aria-hidden="true" />
              ) : null}
              <span>{loading ? "Publishing..." : "Publish"}</span>
              {!loading ? <ArrowRightIcon className="size-5" aria-hidden="true" /> : null}
            </Button>

            <div className="mt-3 min-h-10">
              <Notice message={errors.general} />
            </div>
          </section>
        </aside>
      </form>
    </main>
  );
}
