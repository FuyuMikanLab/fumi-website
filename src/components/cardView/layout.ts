import { CARD_DECK } from "./data";

/** 固定行数，卡片按列向下填满后向右扩展 */
export const ROWS = 2;
export const COLS = Math.ceil(CARD_DECK.length / ROWS);
export const GAP = 22;
export const CARD_W = 260;
export const CARD_H = 480;
export const CELL_W = CARD_W + GAP;
export const CELL_H = CARD_H + GAP;
/**
 * 场内左右留白：左边给入场间隙，右边偏少，滚到尽头时边缘卡片仍完整可见。
 * 视口左侧标题区另用 LEFT_TEXT_GUTTER，不要靠 LEFT_PAD 去“顶开”文字。
 */
// export const LEFT_PAD = 0;
export const LEFT_PAD = Math.round(CARD_W * 0.75 + 140);
// export const RIGHT_PAD = Math.round(CARD_W * 0.35 + 56);
export const RIGHT_PAD = 0;
/** @deprecated 兼容旧引用；等同 LEFT_PAD */
export const SIDE_PAD = LEFT_PAD;
/** 上下留白；底部多留，抵消 rotateX 透视裁切 */
export const TOP_PAD = Math.round(CARD_H * 0.22 + 48);
export const BOTTOM_PAD = Math.round(CARD_H * 0.48 + 120);
export const FIELD_W = LEFT_PAD + RIGHT_PAD + COLS * CELL_W - GAP;
export const FIELD_H = TOP_PAD + BOTTOM_PAD + ROWS * CELL_H - GAP;
/** 横向跟手平滑时间（秒），越大越沉、越有惯性 */
export const PAN_SMOOTH_TIME_X = 0.58;
/** 纵向跟手平滑时间；略短，形成轻微弧线而不是整板平移 */
export const PAN_SMOOTH_TIME_Y = 0.4;
/** 远距离跟手速度上限，避免大场面甩过头 */
export const PAN_MAX_SPEED_X = 2600;
export const PAN_MAX_SPEED_Y = 1700;

/** 视口左侧留给标题/简介，卡片默认停在这条线右侧 */
export const LEFT_TEXT_GUTTER = 560;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** 当前视口实际占用的左侧文本槽；窄屏按比例收缩 */
export function getLeftTextGutter(viewW: number) {
  return Math.min(LEFT_TEXT_GUTTER, Math.max(0, viewW * 0.36));
}

/** 第一列卡片落在文本槽右侧时的 translateX（默认位置 / 左限） */
export function getHomePanX(viewW: number) {
  return (FIELD_W - viewW) / 2 + (getLeftTextGutter(viewW) - LEFT_PAD);
}

/** 横向平移范围：左限为文本槽，右限才把牌面推向左侧以露出更右的列 */
export function getPanBoundsX(viewW: number) {
  const homeX = getHomePanX(viewW);
  const extra = Math.max(viewW * 0.1, 48);
  const rightX = -Math.max(0, (FIELD_W - viewW) / 2 + extra);
  return {
    homeX,
    minX: Math.min(homeX, rightX),
    maxX: Math.max(homeX, rightX),
  };
}

export function getCardCellStyle(index: number) {
  const col = Math.floor(index / ROWS);
  const row = index % ROWS;
  const jitterX = ((index * 17) % 11) - 5;
  const jitterY = ((index * 29) % 13) - 6;
  const rot = (((index * 13) % 7) - 3) * 0.6;

  return {
    left: LEFT_PAD + col * CELL_W + jitterX,
    top: TOP_PAD + row * CELL_H + jitterY,
    width: CARD_W,
    height: CARD_H,
    // 仅平面微倾，避免 translateZ / preserve-3d 造成点击热区与视觉错位
    transform: `rotate(${rot}deg)`,
  } as const;
}
