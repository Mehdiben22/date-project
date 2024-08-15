import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'

const index = () => {
  return (
    //once tabs profile clicked we will be directed to layout profile
    //and showing the index screen of profile
   <Redirect href="/(authenticate)/login" />
  )
}

export default index

const styles = StyleSheet.create({})