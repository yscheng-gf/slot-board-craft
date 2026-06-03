// Stub for Wails-generated bindings — replaced at runtime by `wails dev` / `wails generate module`
export async function CopyToClipboard(_text: string): Promise<void> {}
export async function GetConfig(): Promise<{ favoriteIds: number[]; lastLayout: string }> {
  return { favoriteIds: [], lastLayout: '3,4,5,5,4,3' }
}
export async function SaveConfig(_cfg: { favoriteIds: number[]; lastLayout: string }): Promise<void> {}
