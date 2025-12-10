export function createCanavas(width: number, height: number): HTMLCanvasElement {
  // Always use HTMLCanvasElement for compatibility with Cesium
  // OffscreenCanvas is not directly compatible with Cesium's imagery layer
  const canv = document.createElement("canvas");
  canv.width = width;
  canv.height = height;
  return canv;
}