import React from 'react';
import { StatusBar } from 'react-native';
import AppContainer from './src/routes/routes';
import { colors } from './src/utils/colors';
import FlashMessage from 'react-native-flash-message';

export default function App() {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.headerbackground}
      />
      <AppContainer />
      <FlashMessage position="top" />
    </>
  );
}
