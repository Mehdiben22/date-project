import { Stack } from "expo-router";

export default function Layout() {
    //for the screen of profile 
    return(
    <>
    <Stack screenOptions={{headerShown : false}}>

     <Stack.Screen name ="index" />

    </Stack>
    
    </>
    )
}