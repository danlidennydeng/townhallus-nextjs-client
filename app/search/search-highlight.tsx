import { Fragment, type ReactNode } from "react";

const wordSegmenter = new Intl.Segmenter("en", { granularity: "word" });

function normalizeSearchText(text: string) {
  return text.replace(/[’‘ʼ＇]/g, "'").toLocaleLowerCase("en");
}

export function createSearchHighlighter(query: string): (text: string) => ReactNode {
  const terms = [...new Set(
    [...wordSegmenter.segment(normalizeSearchText(query))]
      .filter(({ isWordLike }) => isWordLike)
      .map(({ segment }) => segment)
  )].sort((a, b) => b.length - a.length);

  return (text) => {
    if (terms.length === 0) {
      return text;
    }

    return [...wordSegmenter.segment(text)].map(({ segment, index, isWordLike }) => {
      const normalized = normalizeSearchText(segment);
      const match = isWordLike ? terms.find((term) => normalized.startsWith(term)) : undefined;

      if (!match) {
        return segment;
      }

      return (
        <Fragment key={index}>
          <mark className="rounded-sm bg-[#f3e8ff] text-[#7E22CE]">
            {segment.slice(0, match.length)}
          </mark>
          {segment.slice(match.length)}
        </Fragment>
      );
    });
  };
}
