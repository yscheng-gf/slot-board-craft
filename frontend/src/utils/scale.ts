// frontend/src/utils/scale.ts

// 像素風主題縮放時，CSS transform 的任意浮點縮放值會讓像素邊緣被抗鋸齒糊掉；
// 把縮放值向下取整到固定 step 的倍數，犧牲一點貼合度換取銳利邊緣。
export function snapScaleForPixelArt(rawScale: number, step = 0.25): number {
  const snapped = Math.floor(rawScale / step) * step
  return Math.max(step, snapped)
}
