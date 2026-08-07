"use client";

import { PostPipeline } from "@/src/components/common/PostPipeline";
import { TransparentVideo } from "@/src/components/common/TransparentVideo";
import { BlackGauze } from "@/src/components/common/effects/BlackGauze";
import { assetUrl } from "@/src/utils/cdn";

/** 设计稿尺寸 1422×800，保持固定比例并随视口缩放 */
const VIDEO_ASPECT = "1422 / 800";

/**
 * 视频经同源 /cdn 代理加载（next.config rewrites → assert.vrfan.icu）。
 * WebGL 读帧要求 CORS；直连 CDN 时 CF 缓存偶发丢掉 ACAO，同源可彻底规避。
 */
export function SectionHomePage() {
  return (
    <div className="banner">
      <div className="banner__copy">
        <div className="section__inner">
          <p className="section__eyebrow">Fumi</p>
          <div className="section__title banner__title">FuyumikanLab</div>
          <p className="section__desc">
            <b>FuyumikanLab</b> 是国内<b>较</b>具影响力的原创虚拟艺人企划
          </p>
          <p className="section__desc banner__desc-long">
            <b>虚拟艺人</b>日常通过直播、短视频、演出等方式活跃在 bilibili
            等平台，凭借多元化的表演方式提供丰富多彩的娱乐内容，是陪伴粉丝们一起成长的新时代偶像
          </p>
        </div>
      </div>

      <div className="banner__video" style={{ aspectRatio: VIDEO_ASPECT }}>
        <PostPipeline>
          <TransparentVideo src={assetUrl("/website/videos/hero-banner.mp4")} />
          {/* 后续 3D 模型直接挂在这里，与视频同场景 */}
          <PostPipeline.Effects>
            <BlackGauze scale={800} opacity={0.05} bloomIntensity={0.05} />
          </PostPipeline.Effects>
        </PostPipeline>
      </div>
    </div>
  );
}
