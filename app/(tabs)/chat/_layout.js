import { Stack } from "expo-router";

export default function Layout() {
    return(
    <>
    <Stack screenOptions={{headerShown : false}}>

     <Stack.Screen name ="index"  options={{headerShown:false}}/>
     <Stack.Screen name ="select" options={{headerShown:false}}/>
     <Stack.Screen name="chatroom" options={{headerShown:true}} />

    </Stack>
    
    </>
    )
}