import React, { useState } from 'react'
import styles from './styles'
import { SafeAreaView, Alert, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { TextDefault, BackHeader, BottomTab } from '../../components'
import { alignment, colors } from '../../utils'

function DeleteAccount(props) {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false)
 
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Account Deletion',
      'Are you sure you want to delete your account? This will remove all your data from this device.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true)
            try {
              // Get all keys from AsyncStorage
              const allKeys = await AsyncStorage.getAllKeys();
              
              // Remove all data from AsyncStorage
              await AsyncStorage.multiRemove(allKeys);
              
              Alert.alert(
                'Account Deleted',
                'Your account data has been removed from this device.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.replace('OTP')
                  }
                ]
              );
            } catch (error) {
              console.error('Error deleting account data:', error);
              Alert.alert(
                'Error',
                'Failed to delete account data. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, styles.safeAreaStyle, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <TextDefault style={{ marginTop: 20 }}>Removing your data...</TextDefault>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, styles.safeAreaStyle]}>
      <BackHeader
        title={'Delete Account'}
        backPressed={() => navigation.goBack()}
      />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <TextDefault
          bolder
          H4
          style={{
            padding: 25,
            textAlign: 'center',
            fontWeight: '900',
            color: colors.black
          }}>
          Are you sure you want to delete your account?
        </TextDefault>
        
        <TextDefault
          style={{
            textAlign: 'center',
            marginBottom: 30,
            color: colors.fontSecondColor,
            lineHeight: 20
          }}>
          This will remove all your data from this device. You'll need to sign up again to use the app.
        </TextDefault>
        
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.error,
            borderRadius: 10,
            width: '100%',
            padding: 15,
            ...alignment.MTlarge
          }}
          onPress={handleDeleteAccount}
          disabled={loading}>
          <TextDefault center bold style={{ color: colors.black }}>
            {loading ? 'Deleting...' : 'Delete Account'}
          </TextDefault>
        </TouchableOpacity>
        
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ 
            width: '100%', 
            paddingTop: 30, 
            paddingBottom: 20,
            alignItems: 'center'
          }}
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <TextDefault center style={{ color: colors.primary }}>
            Cancel
          </TextDefault>
        </TouchableOpacity>
      </View>
      <BottomTab screen="PROFILE" />
    </SafeAreaView>
  )
}

export default DeleteAccount