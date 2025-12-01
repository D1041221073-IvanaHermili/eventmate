import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../src/contexts/AuthContext";

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("INDEX CHECK:", { isLoading, user });
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === "admin") {
    return <Redirect href="/(admin)" />;
  } else {
    return <Redirect href="/(user)" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
