import { StyleSheet, Platform, StatusBar } from 'react-native';

export const TAB_VISUAL_H = 64;

const GlobalStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F7FB' 
  },

  topMenu: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight || 0) + 25
        : 25,
    paddingBottom: 10,
  },

  topIcons: {
    justifyContent: 'center',
    borderColor: 'grey',
    borderWidth: 1,
    backgroundColor: '#fae7d7',
    borderRadius: 40,
    height: 50,
    width: 50,
  },

  middleContent: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },

  bottomMenu: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    zIndex: 99,
  },

  bottomIcons: {
    justifyContent: 'center',
    borderRadius: 40,
    height: 40,
    width: 40,
  },
  
  confirmButton: {
    borderWidth: 1,
    borderColor: 'orange',
    width: 200,
    height: 50,
    marginTop: 5,
    backgroundColor: '#ADD8E6',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GlobalStyles;
