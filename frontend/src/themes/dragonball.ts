// frontend/src/themes/dragonball.ts
// 七龍珠風主題：256x256 PNG，由 codex 的 image_gen 文字生圖工具產生（原創設計，非重現版權角色）。
import high1 from '../assets/images/themes/dragonball/high-1.png'
import high2 from '../assets/images/themes/dragonball/high-2.png'
import high3 from '../assets/images/themes/dragonball/high-3.png'
import high4 from '../assets/images/themes/dragonball/high-4.png'
import high5 from '../assets/images/themes/dragonball/high-5.png'
import high6 from '../assets/images/themes/dragonball/high-6.png'
import high7 from '../assets/images/themes/dragonball/high-7.png'
import high8 from '../assets/images/themes/dragonball/high-8.png'
import high9 from '../assets/images/themes/dragonball/high-9.png'
import low11 from '../assets/images/themes/dragonball/low-11.png'
import low12 from '../assets/images/themes/dragonball/low-12.png'
import low13 from '../assets/images/themes/dragonball/low-13.png'
import low14 from '../assets/images/themes/dragonball/low-14.png'
import low15 from '../assets/images/themes/dragonball/low-15.png'
import low16 from '../assets/images/themes/dragonball/low-16.png'
import low17 from '../assets/images/themes/dragonball/low-17.png'
import low18 from '../assets/images/themes/dragonball/low-18.png'
import low19 from '../assets/images/themes/dragonball/low-19.png'
import low20 from '../assets/images/themes/dragonball/low-20.png'
import specialWild from '../assets/images/themes/dragonball/special-wild.png'
import specialScatter from '../assets/images/themes/dragonball/special-scatter.png'
import specialBonus from '../assets/images/themes/dragonball/special-bonus.png'
import specialFreespin from '../assets/images/themes/dragonball/special-freespin.png'
import specialJackpot from '../assets/images/themes/dragonball/special-jackpot.png'
import specialCoin from '../assets/images/themes/dragonball/special-coin.png'
import specialRespin from '../assets/images/themes/dragonball/special-respin.png'
import specialSuperwild from '../assets/images/themes/dragonball/special-superwild.png'
import specialMultiplier from '../assets/images/themes/dragonball/special-multiplier.png'
import specialGeneric from '../assets/images/themes/dragonball/special-generic.png'
import type { SymbolTheme } from './types'

export const DRAGONBALL_THEME: SymbolTheme = {
  id: 'dragonball',
  name: '七龍珠風',
  icons: {
    1: high1, 2: high2, 3: high3, 4: high4, 5: high5,
    6: high6, 7: high7, 8: high8, 9: high9,
    11: low11, 12: low12, 13: low13, 14: low14, 15: low15,
    16: low16, 17: low17, 18: low18, 19: low19, 20: low20,
    // 依慣例固定：91=wild、92=scatter，其餘特殊符號不預先指定 id
    91: specialWild,
    92: specialScatter,
  },
  // 91/92 以外、落在 80~199 範圍內的特殊符號 id，依盤面上第一次出現的順序「先搶先贏」
  // 分配以下 7 張圖示；用完後交給 families 退回通用的「？」fallback。
  dynamicPool: {
    range: [80, 199],
    icons: [specialBonus, specialFreespin, specialJackpot, specialCoin, specialRespin, specialSuperwild, specialMultiplier],
  },
  families: [
    // exact icons 跟 dynamicPool 都優先於這裡；都沒分配到才退回通用「？」圖示。
    { range: [80, 199], icon: specialGeneric },
  ],
}
