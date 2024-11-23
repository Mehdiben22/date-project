import {
  Alert,
  Button,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import Carousel from "react-native-reanimated-carousel"; // Updated import
import axios from "axios";
import AntDesign from "@expo/vector-icons/AntDesign";
import "core-js/stable/atob"

const Index = () => {
  const [option, setOption] = useState("AD"); // Add loading state
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  //initialize the active index sslide to 0
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();
  const [selectedTurnOns, setSelectedTurnOns] = useState([]);
  const [lookingOptions, setLookingOptions] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState([]);

  const profileImages = [
    {
      image:
        "https://images.pexels.com/photos/1042140/pexels-photo-1042140.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      image:
        "https://images.pexels.com/photos/1215695/pexels-photo-1215695.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      image:
        "https://images.pexels.com/photos/7580971/pexels-photo-7580971.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      image : "https://img.freepik.com/photos-gratuite/belle-fille-se-trouve-dans-parc_8353-5084.jpg?size=626&ext=jpg&ga=GA1.1.2008272138.1724284800&semt=ais_hybrid"
    }
  ];
  const turnons = [
    {
      id: "0",
      name: "Music",
      description: "Pop Rock-Indie pick our sound track",
    },
    {
      id: "10",
      name: "Kissing",
      description:
        " It's a feeling of closeness, where every touch of lips creates a symphony of emotions.",
    },
    {
      id: "1",
      name: "Fantasies",
      description:
        "Fantasies can be deeply personal, encompassing diverse elements such as romance",
    },
    {
      id: "2",
      name: "Nibbling",
      description:
        "playful form of biting or taking small, gentle bites, typically done with the teeth",
    },
    {
      id: "3",
      name: "Desire",
      description: "powerful emotion or attainment of a particular person.",
    },
  ];
  const data = [
    {
      id: "0",
      name: "Casual",
      description: "Let's keep it easy and see where it goes",
    },
    {
      id: "1",
      name: "Long Term",
      description: "How about a one life stand",
    },
    {
      id: "2",
      name: "Virtual",
      description: "Let's have some virtual fun",
    },
    {
      id: "3",
      name: "Open for Anything",
      description: "Let's Vibe and see where it goes",
    },
  ];
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
  //fetch data of the user with his all descriptions and turnOns and images
  const fetchUserDescription = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/users/${userId}`);
      console.log(response);
      const user = response.data;
      //this is to see the modif on the front even if we reload the app or
      //if the user logout and login again
      setDescription(user?.user?.description);
      setSelectedTurnOns(user.user?.turnOns);
      setImages(user.user?.profileImages);
      setLookingOptions(user.user?.lookingFor);
    } catch (error) {
      console.log("error of fetching user description", error);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchUserDescription();
    }
  }, [userId]);
  const handleLogout = async () => {
    try {
      // Make a request to the backend's logout endpoint
      const response = await axios.post("http://localhost:3000/logout");
  
      if (response.status === 200) {
        // Remove the token from AsyncStorage if logout was successful
        await AsyncStorage.removeItem("auth");
        console.log("Token cleared successfully");
  
        // Navigate the user to the login screen
        router.replace("/login");
      } else {
        console.log("Logout failed on the server");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  

  const updateUserDescription = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/users/${userId}/description`,
        {
          description: description,
        }
      );
      console.log(response.data);
      if (response.status === 200) {
        Alert.alert("Success", "Description updated successfully");
      }
    } catch (error) {
      console.log("Error updating user description");
    }
  };

  //function when clicking on a turnOns if selected turn on is on the array
  //we will remove it else we will add it to the array
  const handleToggleTurnOn = (turnOn) => {
    if (selectedTurnOns.includes(turnOn)) {
      removeTurnOn(turnOn);
    } else {
      addTurnOn(turnOn);
    }
  };

  //function to add the looking for to the array and remove it from the array
  const handleOption = (lookingFor) => {
    if (lookingOptions.includes(lookingFor)) {
      removeLookingFor(lookingFor);
    } else {
      addLookingFor(lookingFor);
    }
  };

  //looking for add
  const addLookingFor = async (lookingFor) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/users/${userId}/looking-for`,
        { lookingFor: lookingFor }
      );
      console.log(response.data);

      if (response.status == 200) {
        setLookingOptions([...lookingOptions, lookingFor]);
      }
    } catch (error) {
      console.log("error adding looking for", error);
    }
  };

  ///lookingfor remove
  const removeLookingFor = async (lookingFor) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/users/${userId}/looking-for/remove`,
        {
          lookingFor: lookingFor,
        }
      );
      console.log(response.data);

      if (response.status === 200) {
        setLookingOptions(lookingOptions.filter((item) => item !== lookingFor));
      }
    } catch (error) {
      console.log("error removing looking for", error);
    }
  };

  //add turnon to the array
  const addTurnOn = async (turnOn) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/users/${userId}/turn-ons/add`,
        {
          turnOn: turnOn,
        }
      );

      console.log(response.data);
      if (response.status == 200) {
        setSelectedTurnOns([...selectedTurnOns, turnOn]);
      }
    } catch (error) {
      console.log("Error adding turn on", error);
    }
  };

  //remove turnOn from the array
  const removeTurnOn = async (turnOn) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/users/${userId}/turn-ons/remove`,
        {
          turnOn: turnOn,
        }
      );
      console.log(response.data);
      if (response.status == 200) {
        setSelectedTurnOns(selectedTurnOns.filter((item) => item !== turnOn));
      }
    } catch (error) {
      console.log("error removing turnOn", error);
    }
  };

  //add image function
  const handleAddImage = async () => {
    if (!imageUrl) {
      Alert.alert("Add a url to add an image");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:3000/users/${userId}/profile-images`,
        {
          imageUrl: imageUrl,
        }
      );
      console.log(response);
      Alert.alert("Image added successfully");
      setImageUrl("");
    } catch (error) {
      console.log("error", error);
    }
  };
 
  // generates a random index within the bounds
  // of the images array and returns the image located at that index.
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random()* images.length);
    return images[randomIndex];
  }
  //storing the result on randoImage
  const randomImage = getRandomImage();

  const renderImageCarousel = ({ item }) => (
    <View
      style={{ width: "100%", justifyContent: "center", alignItems: "center" }}
    >
      <Image
        style={{
          width: "85%",
          resizeMode: "cover",
          height: 290,
          borderRadius: 10,
          transform: [{ rotate: "-5deg" }],
        }}
        source={{ uri:item }}
      />
      <Text
        style={{ position: "absolute", top: 10, right: 10, color: "black" }}
      >
        {activeSlide + 1}/{images.length}
      </Text>
    </View>
  );
  console.log("Description", description);
  return (
    <ScrollView>
      <View>
        <Image
          style={{ width: "100%", height: 200, resizeMode: "cover" }}
          source={{
            uri: "https://static.vecteezy.com/system/resources/thumbnails/018/977/074/original/animated-backgrounds-with-liquid-motion-graphic-background-cool-moving-animation-for-your-background-free-video.jpg",
          }}
        />
        <View>
          <View>
            <Pressable
              style={{
                padding: 10,
                backgroundColor: "#DDA0DD",
                width: 300,
                marginLeft: "auto",
                marginRight: "auto",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
                position: "absolute",
                top: -60,
                left: "50%",
                transform: [{ translateX: -150 }],
              }}
            >
              <Image
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  resizeMode: "cover",
                }}
                source={{
                  uri: randomImage,
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 6 }}>
                Casablanca
              </Text>
              <Text style={{ fontSize: 20, marginTop: 4 }}>30 years</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: 80,
          marginHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 25,
          justifyContent: "center",
        }}
      >
        <Pressable onPress={() => setOption("AD")}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: option === "AD" ? "black" : "gray",
            }}
          >
            AD
          </Text>
        </Pressable>
        <Pressable onPress={() => setOption("Photos")}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: option === "Photos" ? "black" : "gray",
            }}
          >
            Photos
          </Text>
        </Pressable>
        <Pressable onPress={() => setOption("Turn-ons")}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: option === "Turn-ons" ? "black" : "gray",
            }}
          >
            Turn-ons
          </Text>
        </Pressable>
        <Pressable onPress={() => setOption("Looking For")}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: option === "Looking For" ? "black" : "gray",
            }}
          >
            Looking For
          </Text>
        </Pressable>
      </View>
      <View style={{ marginHorizontal: 14, marginVertical: 15 }}>
        {option == "AD" && (
          <View
            style={{
              borderColor: "#202020",
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              height: 300,
            }}
          >
            <TextInput
              multiline
              value={description}
              onChangeText={(text) => setDescription(text)}
              style={{
                fontFamily: "Helvetica",
                fontSize: description ? 17 : 17,
              }}
              placeholder="Write your AD for people to like you"
            />
            <Pressable
              onPress={updateUserDescription}
              style={{
                marginTop: "auto",
                flexDirection: "row",
                alignItems: "center",
                gap: 15,
                backgroundColor: "black",
                borderRadius: 5,
                justifyContent: "center",
                padding: 10,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                Publish in feed
              </Text>
              <Entypo name="mask" size={24} color="white" />
            </Pressable>
          </View>
        )}
      </View>
      <View style={{ marginHorizontal: 14 }}>
        {option == "Photos" && (
          <View>
            <Carousel
              loop={false}
              data={images}
              width={350}
              height={300}
              autoPlay={false}
              // renderitem takes a single image from the carousel and take
              //take a single item from the profile image and display
              //it as a slide on the carousel
              renderItem={renderImageCarousel}
              //update the active slide index when the user swipes to
              //a new slide
              onSnapToItem={(index) => setActiveSlide(index)}
            />
            <View style={{ marginTop: 25 }}>
              <Text>Add a picture of yourself</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingVertical: 5,
                  borderRadius: 5,
                  marginTop: 10,
                  backgroundColor: "#DCDCDC",
                }}
              >
                <Entypo
                  style={{ marginLeft: 8 }}
                  name="image"
                  size={24}
                  color="black"
                />
                <TextInput
                  value={imageUrl}
                  onChangeText={(text) => setImageUrl(text)}
                  style={{ color: "gray", marginVertical: 10, width: 300 }}
                  placeholder="Enter your imageUrl"
                />
              </View>
              <Button
                onPress={handleAddImage}
                style={{ marginTop: 5 }}
                title="Add Image"
              />
            </View>
          </View>
        )}
      </View>
      <View style={{ marginHorizontal: 14 }}>
        {option == "Turn-ons" && (
          <View>
            {turnons?.map((item, index) => (
              <Pressable
                //when clicking to the turnOn we take the name as a parameter
                onPress={() => handleToggleTurnOn(item?.name)}
                style={{
                  backgroundColor: "#FFFDD0",
                  padding: 10,
                  marginVertical: 10,
                }}
                key={index}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    {item?.name}
                  </Text>
                  {selectedTurnOns.includes(item?.name) && (
                    <AntDesign name="checkcircle" size={18} color="green" />
                  )}
                </View>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 15,
                    color: "gray",
                    textAlign: "center",
                  }}
                >
                  {item?.description}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <View style={{ marginHorizontal: 14 }}>
        {option == "Looking For" && (
          <>
            <View>
              <FlatList
                columnWrapperStyle={{ justifyContent: "space-between" }}
                numColumns={2}
                data={data}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleOption(item?.name)}
                    style={{
                      backgroundColor: lookingOptions.includes(item?.name)
                        ? "#fd5c63"
                        : "white",
                      padding: 16,
                      justifyContent: "center",
                      alignItems: "center",
                      width: 150,
                      margin: 10,
                      borderRadius: 5,
                      borderColor: "#fd5c63",
                      borderWidth: lookingOptions.includes(item?.name)
                        ? "transparent"
                        : 0.7,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "500",
                        fontSize: 13,
                        color: lookingOptions.includes(item?.name)
                          ? "white"
                          : "black",
                      }}
                    >
                      {item?.name}
                    </Text>
                    <Text
                      style={{
                        color: lookingOptions.includes(item?.name)
                          ? "white"
                          : "gray",
                        textAlign: "center",
                        width: 140,
                        marginTop: 10,
                        fontSize: 13,
                      }}
                    >
                      {item?.description}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </>
        )}
        <Pressable onPress={handleLogout}>
          <Text
            style={{ color: "red", textAlign: "center", marginVertical: 10 }}
          >
            Logout
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({});
