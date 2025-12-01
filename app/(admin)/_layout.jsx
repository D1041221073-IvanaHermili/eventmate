import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AdminLayout() {
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
          name="add-event"
          options={{
            title: "Tambah Event",
            tabBarIcon:({color, size}) =>(
              <Ionicons name="add-circle-outline" size={size} color={color}/>
            ),
          }}
        />

        <Tabs.Screen
          name="edit-event"
          options={{
            title: "Edit Event",
            tabBarIcon:({color, size}) =>(
              <Ionicons name="create-outline" size={size} color={color}/>
            ),
          }}
        />
        
    </Tabs>
  );
}
