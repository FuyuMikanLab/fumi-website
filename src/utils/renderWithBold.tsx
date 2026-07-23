import { Fragment, type ReactNode } from "react";

/**
 * 把字符串里的 <b>...</b> 与 <br> 转成 React 节点。
 * 只识别这两种标签，避免 dangerouslySetInnerHTML 的 XSS 风险。
 */
export function renderWithBold(text: string): ReactNode {
  const parts = text.split(/(<b>.*?<\/b>|<br\s*\/?>)/gi);
  return parts.map((part, index) => {
    if (/^<br\s*\/?>$/i.test(part)) {
      return <br key={index} />;
    }
    const match = part.match(/^<b>(.*?)<\/b>$/i);
    if (match) {
      return <b key={index}>{renderBreaks(match[1], index)}</b>;
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** 仅处理 <br>，供加粗内容内部换行使用 */
function renderBreaks(text: string, keyPrefix: number): ReactNode {
  const parts = text.split(/(<br\s*\/?>)/gi);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (/^<br\s*\/?>$/i.test(part)) {
      return <br key={`${keyPrefix}-br-${index}`} />;
    }
    return <Fragment key={`${keyPrefix}-br-${index}`}>{part}</Fragment>;
  });
}
