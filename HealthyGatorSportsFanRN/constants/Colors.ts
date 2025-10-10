const tintColorLight = '#FA4616';
const tintColorDark = '#FA4616';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    ufBlue: '#0021A5',
    ufOrange: '#FA4616',
    bgSoft: '#F7F9FF',
    border: '#E6E8EC',
    muted: '#6B7280',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    ufBlue: '#6E84FF',
    ufOrange: '#FF7A50',
    bgSoft: '#0E1320',
    border: '#2A2F37',
    muted: '#A3A7AE',
  },
} as const;
