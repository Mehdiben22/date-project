import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";
import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import UserChat from "../../../components/UserChat";


const index = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("auth");
        console.log("Retrieved token:", token);

        if (token) {
          const decodedToken = jwtDecode(token);
          console.log("Decoded token:", decodedToken);
          const userId = decodedToken.userId;
          setUserId(userId);
        } else {
          console.log("No token found, redirecting to login.");
          router.replace("/login"); // Redirect to login if token is invalid or not found
        }
      } catch (error) {
        console.log("Error decoding token:", error);
      }
    };

    fetchUser();
  }, []);
  const fetchrReceivedLikesDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/received-likes/${userId}/details`
      );
      console.log("Response received likes", response);

      const receivedLikesDetails = response.data.receivedLikesDetails;

      setProfiles(receivedLikesDetails);
    } catch (error) {
      console.log("error fetching details", error);
    }
  };
  //
  const fetchUserMatches = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/users/${userId}/matches`
      );

      const userMatches = response.data.matches;

      setMatches(userMatches);
    } catch (error) {
      console.log("Error fetching matches", error);
    }
  };

  //if there is a userId fetch the receivd likes details
  useEffect(() => {
    if (userId) {
      fetchrReceivedLikesDetails();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserMatches();
    }
  }, [userId]);
  //useFocusEffect makes sure that fetchUserMatches()
  // is called whenever the screen becomes active,
  // so the latest user matches are loaded every time the user views this screen.
  useFocusEffect(
    //make sure the callback function only change if the userId changes
    useCallback(()=>{
      if(userId){
        fetchUserMatches();
      }
    },[userId])
  );

  console.log("Profiles", profiles);
  console.log("Matches", matches);
  return (
    <View style={{ backgroundColor: "white", flex: 1, padding: 10 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "500" }}>CHATS</Text>
        <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
      </View>
      <Pressable
        //we user json.stringify because we are  Passing Complex Data Types the profiles is an array of objects
        onPress={() => {
          router.push({
            pathname: "/chat/select",
            params: {
              profiles: JSON.stringify(profiles),
              userId: userId,
            },
          });
        }}
        style={{
          marginVertical: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#E0E0E0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Feather name="heart" size={24} color="black" />
        </View>
        <Text style={{ fontSize: 17, marginLeft: 10, flex: 1 }}>
          You have got {profiles?.length} likes
        </Text>
        <MaterialIcons name="keyboard-arrow-right" size={24} color="black" />
      </Pressable>
      <View>
        {matches?.map((item,index) => (
          <UserChat key={index} userId={userId} item={item}/>
        ))}
      </View>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
