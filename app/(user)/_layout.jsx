import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function UserLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007Aff",
        tabBarInactiveTintColor: "gray",
      }}>

        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon:({color, size}) =>(
              <Ionicons name="home-outline" size={size} color={color}/>
            ),
          }}
        />

        <Tabs.Screen
          name="calendar"
          options={{
            title: "Kalender",
            tabBarIcon:({color, size}) =>(
              <Ionicons name="calendar-outline" size={size} color={color}/>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon:({color, size}) =>(
              <Ionicons name="person-circle-outline" size={size} color={color}/>
            ),
          }}
        />       
    </Tabs>
  );
}
