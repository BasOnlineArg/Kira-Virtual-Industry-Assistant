import type { GridConfig } from './constants'

/** Inverse of gridToPixel: rendered pixel position → grid coordinates */
export function pixelToGrid(
  px: number,
  py: number,
  imgW: number,
  imgH: number,
  cfg: GridConfig,
): { gx: number; gy: number } {
  const scaleX = imgW / cfg.naturalW
  const scaleY = imgH / cfg.naturalH
  const gx = cfg.xMin + (px / scaleX - cfg.imgLeft) / (cfg.imgRight - cfg.imgLeft) * (cfg.xMax - cfg.xMin)
  const gy = cfg.mcMax - (py / scaleY - cfg.imgTop)  / (cfg.imgBottom - cfg.imgTop)  * (cfg.mcMax - cfg.mcMin)
  return {
    gx: Math.round(gx * 10) / 10,
    gy: Math.round(gy * 10) / 10,
  }
}

export function gridToPixel(
  gx: number,
  gy: number,
  imgW: number,
  imgH: number,
  cfg: GridConfig,
): { px: number; py: number } {
  const scaleX = imgW / cfg.naturalW
  const scaleY = imgH / cfg.naturalH
  const px =
    cfg.imgLeft +
    ((gx - cfg.xMin) / (cfg.xMax - cfg.xMin)) * (cfg.imgRight - cfg.imgLeft)
  const py =
    cfg.imgTop +
    ((cfg.mcMax - gy) / (cfg.mcMax - cfg.mcMin)) * (cfg.imgBottom - cfg.imgTop)
  return { px: px * scaleX, py: py * scaleY }
}
