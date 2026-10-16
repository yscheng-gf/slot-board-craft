// frontend/src/themes/types.ts

export type IconFamily = {
  range: [number, number]  // id 範圍（含頭尾），例如特殊符號家族 [80, 199]
  icon: string              // 範圍內沒有專屬圖示時使用的 fallback 圖示
}

export type DynamicIconPool = {
  range: [number, number]  // 動態分配生效的 id 範圍（含頭尾）
  icons: string[]           // 依「盤面中第一次出現該 id」的順序分配；池子用完就不再分配
}

export type SymbolTheme = {
  id: string
  name: string
  pixelArt?: boolean          // true 時渲染/縮放要保持像素銳利邊緣
  icons: Partial<Record<number, string>>  // 符號 id -> 專屬圖示路徑，優先於 dynamicPool/families
  families?: IconFamily[]     // id 沒有專屬圖示、也沒被動態分配時，依範圍退回家族 fallback 圖示；都沒中才退回色塊
  dynamicPool?: DynamicIconPool  // 範圍內沒有專屬圖示的 id，依盤面出現順序「先搶先贏」分配圖示
}
