"use client";

import Image from "next/image";
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
  ClipboardEvent,
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
import { LinkRules } from "@platejs/link";

import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-client";
import { pixelAvatarPath } from "@/lib/avatar";
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
  videoId?: string;
};

type PlateNode = PlateContentNode | PlateTextNode;

const titleMaxLength = 280;
const contentMaxLength = 20000;
const externalLinkLimit = 1;
const initialEditorValue: Value = [{ type: "p", children: [{ text: "" }] }];
const serverAuthSnapshot = "__townhallus_server_auth_snapshot__";
const imageUrlPattern =
  /\.(?:apng|avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
const youtubeVideoIdPattern = /^[a-zA-Z0-9_-]{11}$/;
const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
]);

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
  const linkKind = href ? getPlateLinkKind(element) : undefined;

  return (
    <PlateElement
      as="a"
      {...props}
      attributes={{
        ...props.attributes,
        "data-link-kind": linkKind,
        href,
        rel: "noopener noreferrer",
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

function VideoElement(props: PlateElementProps) {
  const element = props.element as PlateContentNode;
  const embedUrl = getYoutubeEmbedUrl(element.url);
  const title = element.alt?.trim() || "External video";

  return (
    <PlateElement {...props} className="my-3">
      <div
        contentEditable={false}
        className="overflow-hidden rounded-md border border-[#999999] bg-[#000000] shadow-[0_1px_2px_rgba(0,0,0,0.14)]"
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="block aspect-video w-full"
          />
        ) : (
          <div className="bg-[#f7f7f7] px-3 py-4 text-sm font-semibold text-[#4d4d4d]">
            Video link unavailable.
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

const ExternalVideoPlugin = createPlatePlugin({
  key: "video",
  node: {
    isElement: true,
    isVoid: true,
  },
  render: {
    node: VideoElement,
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

function getSafeExternalUrl(value?: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function isSafeExternalUrl(value?: string) {
  return getSafeExternalUrl(value) !== null;
}

function getYoutubeVideoId(value?: string) {
  const url = getSafeExternalUrl(value);

  if (!url || !youtubeHosts.has(url.hostname.toLowerCase())) {
    return null;
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  const videoId =
    url.hostname.toLowerCase() === "youtu.be"
      ? pathParts[0]
      : url.searchParams.get("v") ||
        (["embed", "live", "shorts"].includes(pathParts[0])
          ? pathParts[1]
          : null);

  return videoId && youtubeVideoIdPattern.test(videoId) ? videoId : null;
}

function isYoutubeUrl(value?: string) {
  const url = getSafeExternalUrl(value);
  return url ? youtubeHosts.has(url.hostname.toLowerCase()) : false;
}

function isYoutubeVideoUrl(value?: string) {
  return getYoutubeVideoId(value) !== null;
}

function getYoutubeEmbedUrl(value?: string) {
  const videoId = getYoutubeVideoId(value);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function isLikelyImageUrl(value?: string) {
  const url = getSafeExternalUrl(value);
  return url ? imageUrlPattern.test(url.pathname) : false;
}

function normalizeLinkKind(value?: string) {
  return value === "image" || value === "document" || value === "video"
    ? value
    : null;
}

function getPlateLinkKind(node: PlateContentNode): LinkKind {
  const declaredKind = normalizeLinkKind(node.linkKind);

  if (declaredKind === "image" || isLikelyImageUrl(node.url)) {
    return "image";
  }

  if (declaredKind === "video" || isYoutubeUrl(node.url)) {
    return "video";
  }

  return "document";
}

function createExternalLinkCounts(): Record<LinkKind, number> {
  return {
    document: 0,
    image: 0,
    video: 0,
  };
}

function getExternalLinkCounts(nodes: Value | PlateNode[] = []) {
  const counts = createExternalLinkCounts();

  function visit(currentNodes: Value | PlateNode[]) {
    currentNodes.forEach((node) => {
      const plateNode = node as PlateNode;

      if (isTextNode(plateNode)) {
        return;
      }

      if (plateNode.type === "image" && isSafeExternalUrl(plateNode.url)) {
        counts.image += 1;
      } else if (
        plateNode.type === "video" &&
        isSafeExternalUrl(plateNode.url)
      ) {
        counts.video += 1;
      } else if (plateNode.type === "a" && isSafeExternalUrl(plateNode.url)) {
        counts[getPlateLinkKind(plateNode)] += 1;
      }

      visit((plateNode.children || []) as Value);
    });
  }

  visit(nodes);

  return counts;
}

function getExternalLinkLimitMessage(kind: LinkKind) {
  return `Only one external ${kind} link is allowed.`;
}

function getPlateMediaPolicyError(value: Value) {
  const counts = getExternalLinkCounts(value);
  const overLimitKind = linkKinds.find(
    (kind) => counts[kind.id] > externalLinkLimit
  );

  if (overLimitKind) {
    return getExternalLinkLimitMessage(overLimitKind.id);
  }

  const hasInvalidVideoLink = (value as PlateNode[]).some(function visit(node) {
    if (isTextNode(node)) {
      return false;
    }

    if (
      (node.type === "video" ||
        (node.type === "a" && getPlateLinkKind(node) === "video")) &&
      !isYoutubeVideoUrl(node.url)
    ) {
      return true;
    }

    return (node.children || []).some(visit);
  });

  return hasInvalidVideoLink ? "Video links must be YouTube video URLs." : null;
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

    if (plateNode.type === "video" && isYoutubeVideoUrl(plateNode.url)) {
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
    const linkKind = getPlateLinkKind(node);

    return `<a href="${escapeHtml(
      safeUrl
    )}" target="_blank" rel="noopener noreferrer" data-link-kind="${linkKind}">${
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
    const alt = escapeHtml(node.alt?.trim() || "External image");

    return `<figure><img src="${safeUrl}" alt="${alt}" loading="lazy" referrerpolicy="no-referrer" /></figure>`;
  }

  if (node.type === "video" && imageUrl && isYoutubeVideoUrl(imageUrl)) {
    const safeEmbedUrl = escapeHtml(getYoutubeEmbedUrl(imageUrl) || "");
    const safeSourceUrl = escapeHtml(imageUrl);
    const title = escapeHtml(node.alt?.trim() || "External video");

    return `<figure><iframe src="${safeEmbedUrl}" title="${title}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen data-link-kind="video" data-source-url="${safeSourceUrl}"></iframe></figure>`;
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

async function validateExternalImageUrl(url: string) {
  const response = await fetch(apiUrl("/post/validate-image-link"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    return (
      (await readResponseMessage(response)) || "Image link could not be validated."
    );
  }

  return null;
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
      className="flex items-start gap-2 rounded-md border border-[#B91C1C] bg-[#eeeeee] px-3 py-2 text-sm leading-5 text-[#B91C1C]"
      aria-live="polite"
    >
      <TriangleAlertIcon
        className="mt-0.5 size-4 shrink-0 text-[#B91C1C]"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

function StatusBadge({
  label,
  title,
  rounded = "full",
}: Readonly<{ label: string; title: string; rounded?: "full" | "md" }>) {
  return (
    <span
      title={title}
      className={`flex size-7 items-center justify-center border-2 border-[#9333EA] text-sm font-bold text-[#9333EA] ${
        rounded === "full" ? "rounded-full" : "rounded-md"
      }`}
    >
      {label}
    </span>
  );
}

export default function CreatePostClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [contentValue, setContentValue] = useState<Value>(initialEditorValue);
  const [statewideScope, setStatewideScope] = useState(true);
  const [errors, setErrors] = useState<CreatePostErrors>({});
  const [loading, setLoading] = useState(false);
  const [validatingLink, setValidatingLink] = useState(false);
  const [linkKind, setLinkKind] = useState<LinkKind | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      ExternalImagePlugin,
      ExternalVideoPlugin,
      LinkPlugin.configure({
        inputRules: [
          LinkRules.markdown(),
          LinkRules.autolink({ variant: "paste" }),
          LinkRules.autolink({ variant: "space" }),
          LinkRules.autolink({ variant: "break" }),
        ],
        options: {
          isUrl: (text) =>
            isSafeExternalUrl(text) &&
            !isLikelyImageUrl(text) &&
            !isYoutubeUrl(text),
        },
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
  const externalLinkCounts = useMemo(
    () => getExternalLinkCounts(contentValue),
    [contentValue]
  );
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
    if (externalLinkCounts[kind] >= externalLinkLimit) {
      setErrors((current) => ({
        ...current,
        link: getExternalLinkLimitMessage(kind),
        general: undefined,
      }));
      return;
    }

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

  function insertExternalVideoNode(cleanUrl: string, cleanText = "External video") {
    const videoId = getYoutubeVideoId(cleanUrl);

    if (!videoId) {
      return false;
    }

    editor.tf.insertNodes([
      {
        alt: cleanText,
        children: [{ text: "" }],
        type: "video",
        url: cleanUrl,
        videoId,
      },
      {
        children: [{ text: "" }],
        type: "p",
      },
    ] as never);
    setContentValue(editor.children as Value);
    return true;
  }

  function handleContentPaste(event: ClipboardEvent<HTMLDivElement>) {
    const pastedText = event.clipboardData.getData("text/plain").trim();

    if (!isYoutubeVideoUrl(pastedText)) {
      return;
    }

    event.preventDefault();

    const currentCounts = getExternalLinkCounts(editor.children as Value);

    if (currentCounts.video >= externalLinkLimit) {
      setErrors((current) => ({
        ...current,
        content: getExternalLinkLimitMessage("video"),
        general: undefined,
      }));
      return;
    }

    insertExternalVideoNode(pastedText);
    setErrors((current) => ({
      ...current,
      content: undefined,
      general: undefined,
      link: undefined,
    }));
  }

  async function insertExternalLink() {
    if (!linkKind) {
      return;
    }

    const cleanUrl = linkUrl.trim();
    const cleanText = linkText.trim();
    const currentCounts = getExternalLinkCounts(editor.children as Value);

    if (!isSafeExternalUrl(cleanUrl)) {
      setErrors((current) => ({
        ...current,
        link: "Please enter a valid external http or https URL.",
      }));
      return;
    }

    if (currentCounts[linkKind] >= externalLinkLimit) {
      setErrors((current) => ({
        ...current,
        link: getExternalLinkLimitMessage(linkKind),
      }));
      return;
    }

    if (linkKind === "video" && !isYoutubeVideoUrl(cleanUrl)) {
      setErrors((current) => ({
        ...current,
        link: "Video links must be YouTube video URLs.",
      }));
      return;
    }

    if (linkKind !== "video" && isYoutubeUrl(cleanUrl)) {
      setErrors((current) => ({
        ...current,
        link: "Use the video link button for YouTube video URLs.",
      }));
      return;
    }

    if (linkKind !== "image" && isLikelyImageUrl(cleanUrl)) {
      setErrors((current) => ({
        ...current,
        link: "Use the image link button for image URLs.",
      }));
      return;
    }

    if (linkKind === "image") {
      setValidatingLink(true);
      setErrors((current) => ({ ...current, link: undefined }));

      try {
        const imageValidationError = await validateExternalImageUrl(cleanUrl);

        if (imageValidationError) {
          setErrors((current) => ({
            ...current,
            link: imageValidationError,
          }));
          return;
        }
      } catch {
        setErrors((current) => ({
          ...current,
          link: "Image link could not be validated.",
        }));
        return;
      } finally {
        setValidatingLink(false);
      }

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

    if (linkKind === "video") {
      insertExternalVideoNode(cleanUrl, cleanText || "External video");
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

    editor.tf.insertNodes([
      {
        children: [{ text: cleanText || cleanUrl }],
        linkKind,
        target: "_blank",
        type: "a",
        url: cleanUrl,
      },
      {
        text: " ",
      },
    ] as never);

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
    } else {
      const mediaPolicyError = getPlateMediaPolicyError(contentValue);

      if (mediaPolicyError) {
        fieldErrors.content = mediaPolicyError;
      }
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
                  const isLinkKindAtLimit =
                    externalLinkCounts[kind.id] >= externalLinkLimit;

                  return (
                    <Button
                      key={kind.id}
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Add ${kind.label.toLowerCase()} link`}
                      title={
                        isLinkKindAtLimit
                          ? getExternalLinkLimitMessage(kind.id)
                          : `Add ${kind.label.toLowerCase()} link`
                      }
                      disabled={isLinkKindAtLimit}
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
                      disabled={validatingLink}
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
                      disabled={validatingLink}
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
                      disabled={validatingLink}
                      aria-busy={validatingLink}
                      onClick={insertExternalLink}
                      className="h-10 border border-[#9333EA] bg-[#9333EA] text-[#ffffff]"
                    >
                      {validatingLink ? (
                        <LoaderCircleIcon
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <LinkIcon className="size-4" aria-hidden="true" />
                      )}
                      {validatingLink ? "Checking..." : "Insert"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={validatingLink}
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
                  onPaste={handleContentPaste}
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
            <fieldset>
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
                <dt className="font-semibold text-[#000000]">Publish to</dt>
                <dd className="font-semibold text-[#9333EA]">{storedScope}</dd>
              </div>
            </dl>

            <div className="mt-3 min-h-10">
              <Notice message={errors.scope} />
            </div>
          </section>

          <section className="rounded-md border border-[#999999] bg-[#f7f7f7] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.14)]">
            <p className={mutedTextClassName}>Author</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-[#000000]">
              <span className="flex size-6 shrink-0 overflow-hidden rounded-full border border-[#9333EA] bg-[#eeeeee]">
                <Image
                  src={pixelAvatarPath(currentUser._id)}
                  alt=""
                  width={24}
                  height={24}
                  unoptimized
                  className="size-full object-cover [image-rendering:pixelated]"
                />
              </span>
              <span className="min-w-0 break-words">
                @{currentUser.username || "anonymous"}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {statusBadges.map((badge) =>
                badge ? (
                  <StatusBadge
                    key={badge.label}
                    label={badge.label}
                    title={badge.title}
                    rounded={badge.rounded}
                  />
                ) : null
              )}
            </div>
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
