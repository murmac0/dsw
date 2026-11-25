import * as stylex from "@stylexjs/stylex";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { fontSize, lineHeight, space } from "@dsw/tokens/semantic.stylex";
import { codeShape as shape, codeTokens as t } from "@dsw/tokens/components.stylex";
import { Button } from "../Button/Button";
import { fieldStyles } from "../Field/Field.styles";

const styles = stylex.create({
  root: {
    position: "relative",
    minWidth: 0,
    borderRadius: shape.radius,
    borderWidth: shape.borderWidth,
    borderStyle: "solid",
    borderColor: t.border,
    backgroundColor: t.bg,
    color: t.text,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBlock: space.xxs,
    paddingInlineStart: space.md,
    paddingInlineEnd: space.xxs,
    borderBottomWidth: shape.borderWidth,
    borderBottomStyle: "solid",
    borderBottomColor: t.border,
  },
  title: {
    minWidth: 0,
    overflowWrap: "anywhere",
    color: t.label,
    fontFamily: shape.fontFamily,
    fontSize: fontSize.xs,
  },
  pre: {
    margin: 0,
    padding: space.md,
    fontFamily: shape.fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
    // Wrap instead of scrolling sideways: nothing is hidden at 320px, and
    // there's no scroll region that keyboard users would need to focus.
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    tabSize: 2,
  },
});

const kindStyles = stylex.create({
  keyword: { color: t.keyword },
  string: { color: t.string },
  comment: { color: t.comment, fontStyle: "italic" },
  name: { color: t.name },
  attribute: { color: t.attribute },
});

/** The syntax roles a code block colours. Anything else is plain text. */
export type CodeTokenKind = keyof typeof kindStyles;

export interface CodeToken {
  text: string;
  kind?: CodeTokenKind;
}

export interface CodeBlockProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "style" | "children" | "title"> {
  /** The source, exactly as it should be copied. */
  code: string;
  /**
   * Optional syntax colouring, as lines of tokens whose text joins up to
   * `code` (for example from Shiki at build time). Without it the code is
   * shown in one colour.
   */
  tokens?: CodeToken[][];
  /** A file name or language shown above the code. Also names the copy button ("Copy Button.tsx"). */
  title?: string;
  /** Hide the copy button, for very short snippets. Defaults to shown. */
  showCopy?: boolean;
  /** Copy button text. Override to localise. */
  copyLabel?: string;
  /** Shown and announced after copying. */
  copiedLabel?: string;
  /** Announced if the clipboard refuses. */
  copyFailedLabel?: string;
}

/**
 * Source code on a raised surface, with an optional title and a copy
 * button that announces the result. Long lines wrap rather than scroll.
 * For a word or two of code inside a sentence, use `<Text as="code" mono>`.
 *
 * Highlighting is passed in as `tokens`, so the library ships no parser;
 * the colours are tokens, contrast-checked in every theme.
 */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    tokens,
    title,
    showCopy = true,
    copyLabel = "Copy",
    copiedLabel = "Copied",
    copyFailedLabel = "Couldn't copy: select the code and copy it",
    ...rest
  },
  ref,
) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const hasHeader = title !== undefined || showCopy;
  const buttonText = status === "copied" ? copiedLabel : copyLabel;

  return (
    <div {...rest} ref={ref} {...stylex.props(styles.root)}>
      {hasHeader && (
        <div {...stylex.props(styles.header)}>
          <span {...stylex.props(styles.title)}>{title}</span>
          {showCopy && (
            <Button
              variant="ghost"
              size="sm"
              // The visible word starts the name (WCAG 2.5.3); the title
              // tells several copy buttons on one page apart.
              aria-label={title ? `${buttonText} ${title}` : buttonText}
              onPress={() => void copy()}
            >
              {buttonText}
            </Button>
          )}
        </div>
      )}
      <pre {...stylex.props(styles.pre)}>
        <code>
          {tokens
            ? tokens.map((line, i) => (
                <span key={i}>
                  {line.map((token, j) =>
                    token.kind ? (
                      <span key={j} {...stylex.props(kindStyles[token.kind])}>
                        {token.text}
                      </span>
                    ) : (
                      token.text
                    ),
                  )}
                  {i < tokens.length - 1 && "\n"}
                </span>
              ))
            : code}
        </code>
      </pre>
      {showCopy && (
        <span role="status" {...stylex.props(fieldStyles.visuallyHidden)}>
          {status === "copied" ? copiedLabel : status === "failed" ? copyFailedLabel : ""}
        </span>
      )}
    </div>
  );
});
