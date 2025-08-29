import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import * as Screen from '../screens';

const MainStack = createStackNavigator();
const NavigationStack = createStackNavigator();


function Drawer() {
  return (
    <NavigationStack.Navigator screenOptions={{ headerShown: false }}>
      <NavigationStack.Screen name="MainLanding" component={Screen.MainLanding} />
      <NavigationStack.Screen name="DeleteButton" component={Screen.DeleteButton} />
      <NavigationStack.Screen name="ProductDescription" component={Screen.ProductDescription} />
      <NavigationStack.Screen name="ProfileDashboard" component={Screen.ProfileDashboard} />
      <NavigationStack.Screen name="MyScheme" component={Screen.MyScheme} />
      <NavigationStack.Screen name="HelpCenter" component={Screen.HelpCenterPage} />
      <NavigationStack.Screen name="PrivacyPolicy" component={Screen.PrivacyPolicyPage} />
      <NavigationStack.Screen name="TermsandCondition" component={Screen.TermsConditionsPage} />
      <NavigationStack.Screen name="AddNewMember" component={Screen.AddNewMember}/>
      <NavigationStack.Screen name='GoldPlanScreen' component={Screen.GoldPlanScreen}/>
      <NavigationStack.Screen name='OTP' component={Screen.OTP}/>
      <NavigationStack.Screen name='KnowMore' component={Screen.KnowMore}/>
      <NavigationStack.Screen name='Buy' component={Screen.Buy}/>
      <NavigationStack.Screen name='EditingProfile' component={Screen.EditingProfile}/>
      <NavigationStack.Screen name='PaymentHistory' component={Screen.PaymentHistory}/>
      <NavigationStack.Screen name='MainPageWithYouTube' component={Screen.MainPageWithYouTube}/>
      <NavigationStack.Screen name='ProfileSidebar' component={Screen.ProfileSidebar}/>
      <NavigationStack.Screen name='AboutPage' component={Screen.AboutPage}/>

    </NavigationStack.Navigator>
  );
}

function AppContainer() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkUserState = async () => {
      try {
        const isMpinCreated = await AsyncStorage.getItem('isMpinCreated');
        if (isMpinCreated === 'true') {
          setInitialRoute('VerifyMpinScreen'); 
        } else {
          setInitialRoute('OTP'); 
        }
      } catch (error) {
        console.error('Error checking user state:', error);
        setInitialRoute('OTP'); 
      }
    };

    checkUserState();
  }, []);

  if (!initialRoute) {
    return null; 
  }

  return (
    <NavigationContainer>
      <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <MainStack.Screen name="OTP" component={Screen.OTP} />
        <MainStack.Screen name="MpinScreen" component={Screen.MpinScreen} />
        <MainStack.Screen name="VerifyMpinScreen" component={Screen.VerifyMpinScreen} />
        <MainStack.Screen name="Drawer" component={Drawer} />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}

export default AppContainer;
