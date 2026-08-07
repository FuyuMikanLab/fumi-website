/** 统一为 YYYY.MM.DD；无法解析时原样返回。 */
export const formatDate = (d: string) => {
  const t = new Date(d);
  if (Number.isNaN(+t)) return d;
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}.${mm}.${dd}`;
};
