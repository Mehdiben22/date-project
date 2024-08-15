import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(()=> {
    const checkLoginStatus = async() => {
      try {
       const token = await AsyncStorage.getItem("auth");
       if(token) {
        router.replace("/(tabs)/profile")
       }
      }catch(error) {
        console.log("Error" , error)
      }
    }
    checkLoginStatus()
  },[])

  const handleLogin = () => {
      const user = {
        email : email,
        password : password,
      };
     
      axios.post("http://localhost:3000/login",user).then((response) => {
        console.log(response);
        const token = response.data.token;
        //setting a key for the token in this case we set "auth"
        AsyncStorage.setItem("auth",token);
        console.log("Token stored:", token);
        router.replace("/(authenticate)/select")

        
      })
  }
  
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <View style={{ height: 200, backgroundColor: "pink", width: "100%" }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: "25",
          }}
        >
          <Image
            style={{ width: 150, height: 80, resizeMode: "contain" }}
            source={{
              uri: "https://cdn-icons-png.flaticon.com/128/6655/6655045.png",
            }}
          />
        </View>
        <Text
          style={{
            marginTop: "20",
            textAlign: "center",
            fontSize: 20,
            fontFamily: "GillSans-SemiBold",
          }}
        >
          Match Mate
        </Text>
      </View>
      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: "bold",
              marginTop: 25,
              color: "#F9629F",
            }}
          >
            Login to your account
          </Text>
        </View>
        <View
          style={{
            justifyContent: "center",
            marginTop: 20,
            alignItems: "center",
          }}
        >
          <Image
            style={{ width: 100, height: 80, resizeMode: "cover" }}
            source={{
              uri: "https://cdn-icons-png.flaticon.com/128/2509/2509078.png",
            }}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
              backgroundColor: "#FFC0CB",
              paddingVertical: 5,
              borderRadius: 5,
              marginTop: 20,
            }}
          >
            <MaterialIcons
              style={{ marginLeft: 8 }}
              name="email"
              size={24}
              color="white"
            />
            <TextInput
              value={email}
              onChangeText={(text) => setEmail(text)}
              placeholder="Enter your email"
              placeholderTextColor="white"
              style={{
                color: "white",
                marginVertical: 10,
                width: 300,
                fontSize: email ? 17 : 17,
              }}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <View
              style={{
                flexDirection: "row",
                gap: 5,
                alignItems: "center",
                backgroundColor: "#FFC0CB",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 20,
              }}
            >
              <AntDesign
                style={{ marginLeft: 8 }}
                name="lock1"
                size={24}
                color="white"
              />
              <TextInput
                value={password}
                onChangeText={(text) => setPassword(text)}
                placeholder="Enter you password"
                placeholderTextColor="white"
                secureTextEntry={true}
                style={{
                  color: "white",
                  marginVertical: 10,
                  width: 300,
                  fontSize: password ? 17 : 17,
                }}
              />
            </View>
          </View>
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>Keep me logged in</Text>
            <Text style={{ color: "#007FFF", fontWeight: "500" }}>
              Forgot password
            </Text>
          </View>
          <View style={{ marginTop: 50 }}>
            <Pressable
            onPress={handleLogin}
              style={{
                width: 200,
                backgroundColor: "#FFC0CB",
                borderRadius: 6,
                marginLeft: "auto",
                marginRight: "auto",
                padding: 15,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Login
              </Text>
            </Pressable>

            <Pressable
            //the user can not navigate back after
            onPress={()=>router.replace("/register")}
            style={{marginTop:12}}>
                <Text style={{textAlign:"center",color:"gray"}}>Don't have an account ? Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default login;

const styles = StyleSheet.create({});
