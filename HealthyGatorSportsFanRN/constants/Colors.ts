/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/** 
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

*/

/**
 * App theme colors (light/dark) with UF blue/orange.
 * 保留原有字段以避免破坏现有调用；新增 ufBlue / ufOrange / bgSoft 等便于统一改色。
 */

const tintColorLight = '#FA4616'; // UF Orange
const tintColorDark = '#FA4616';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // ---- Added UF palette ----
    ufBlue: '#0021A5',     // UF Blue
    ufOrange: '#FA4616',   // UF Orange
    bgSoft: '#F7F9FF',     // 柔和的浅底色(卡片/列表)
    border: '#E6E8EC',     // 细边框色
    muted: '#6B7280',      // 次级文字
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // ---- Added UF palette (dark tuned) ----
    ufBlue: '#6E84FF',     // 深色模式下提亮蓝
    ufOrange: '#FF7A50',   // 深色模式下更亮橙
    bgSoft: '#0E1320',     // 深色柔和底色
    border: '#2A2F37',
    muted: '#A3A7AE',
  },
} as const;
