import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import AppContainer from './src/routes/routes';
import { colors } from './src/utils/colors';
import FlashMessage from 'react-native-flash-message';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './src/utils/Notification';

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Get token
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
