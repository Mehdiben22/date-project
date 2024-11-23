import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";
import Profile from "../../../components/Profile";

const index = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    // Check if token exists and fetch user details
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("auth");
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);

  //fetch data of the user with his all descriptions and turnOns and images
  const fetchUserDescription = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/users/${userId}`);
      console.log(response);
      const user = response.data;
      setUser(user?.user);
    } catch (error) {
      console.log("error of fetching user description", error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/profiles", {
        params: {
          userId: userId,
          gender: user?.gender,
          turnOns: user?.turnOns,
          lookingFor: user?.lookingFor,
        },
      });
      setProfiles(response.data.profiles);
      console.log("Fetched profiles:", response.data.profiles);
    } catch (error) {
      console.log("error", error);
    }
  };

  //if the userId exist we fetch the userDescription
  useEffect(() => {
    if (userId) {
      fetchUserDescription();
    }
  }, [userId]);
  //fetch profiles if the userId and user exists
  useEffect(() => {
    if (userId && user) {
      console.log("User data",user)
      fetchProfiles();
    }
  }, [userId, user]);

  console.log("profiles", profiles);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={profiles}
        //extract an id from each item in the list
        keyExtractor={(item) => item.id}
        //render : afficher each profile passing the necessary props to 
        //customize the rendering
        renderItem={({ item, index }) => (
          <Profile
            key={index}
            item={item} 
            userId={userId}
            setProfiles={setProfiles}
            //determiner si lelement actuel a un index pair ou pas 
            //cela pourrait etre utilise pour appliquer un style different 
            //ou une logique specifique aux elements par ou impair dans
            //le style
            isEven = {index % 2 === 0}
          />
        )}
      />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
