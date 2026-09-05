"use client";

import {
  useCallback,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";
import "./ExternalLinkModal.css";

type ExternalHref = {
  href: string;
  host: string;
};

function parseExternalHref(value: string | null | undefined): ExternalHref | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return { href: url.href, host: url.host };
  } catch {
    return null;
  }
}

function openExternalHref(href: string) {
  const opener = document.createElement("a");
  opener.href = href;
  opener.target = "_blank";
  opener.rel = "noopener noreferrer";
  opener.click();
}

export function useExternalLinkConfirm() {
  const [href, setHref] = useState<string | null>(null);

  const request = useCallback((next: string) => {
    setHref(next);
  }, []);

  const close = useCallback(() => {
    setHref(null);
  }, []);

  return {
    href,
    open: href !== null,
    request,
    close,
  };
}

type ExternalLinkModalProps = {
  open: boolean;
  href: string | null;
  onClose: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ExternalLinkModal({
  open,
  href,
  onClose,
  title = "即将离开本站",
  description = "即将跳转到外部网站，是否继续？",
  confirmLabel = "继续前往",
  cancelLabel = "取消",
}: ExternalLinkModalProps) {
  const parsed = parseExternalHref(href);

  const handleConfirm = () => {
    if (!parsed) return;
    openExternalHref(parsed.href);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      label={title}
      backdropClassName="ext-link-modal-backdrop"
    >
      <div className="ext-link-dialog">
        <span className="ext-link-dialog__badge">
          <span className="ext-link-dialog__badge-dot" aria-hidden />
          站外
        </span>
        <h2 className="ext-link-dialog__title">{title}</h2>
        <p className="ext-link-dialog__desc">{description}</p>
        {parsed ? (
          <div className="ext-link-dialog__url">
            <span className="ext-link-dialog__host">{parsed.host}</span>
            <p className="ext-link-dialog__href">{parsed.href}</p>
          </div>
        ) : (
          <p className="ext-link-dialog__desc">链接无效，无法跳转。</p>
        )}
        <div className="ext-link-dialog__actions">
          <Button
            type="button"
            variant="underline"
            className="ext-link-dialog__cancel"
            underlineColor="color-mix(in srgb, var(--ext-ink) 28%, transparent)"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="underline"
            className="ext-link-dialog__confirm"
            underlineColor="var(--ext-acid)"
            disabled={!parsed}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

function shouldBypassConfirm(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

/** 拦截普通点击，弹出站外确认；修饰键 / 新标签页仍走浏览器默认行为。 */
export function ExternalLink({
  href,
  children,
  onClick,
  ...props
}: ExternalLinkProps) {
  const confirm = useExternalLinkConfirm();

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || shouldBypassConfirm(event)) return;
          event.preventDefault();
          confirm.request(href);
        }}
      >
        {children}
      </a>
      <ExternalLinkModal
        open={confirm.open}
        href={confirm.href}
        onClose={confirm.close}
      />
    </>
  );
}
