// import { useRouter } from "expo-router";
// import { useState } from "react";
// import { Text, TextInput, TouchableOpacity, View } from "react-native";
// import Toast from "react-native-toast-message";

// export default function RegisterScreen() {
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [adminCode, setAdminCode] = useState("");
//   const router = useRouter();

//   const handleRegister = async () => {
//     if (!name || !username || !password) {
//       Toast.show({
//         type: "error",
//         text1: "⚠️ Field Kosong",
//         text2: "Isi semua field (nama, username, password).",
//         position: "top",
//       });
//       return;
//     }

//     const ADMIN_SECRET = "EVENTMATE2025";
//     const inputCode = (adminCode || "").trim().toLowerCase();
//     const validCode = ADMIN_SECRET.toLowerCase();

//     if (adminCode && inputCode !== validCode) {
//       Toast.show({
//         type: "error",
//         text1: "❌ Kode Admin Salah",
//         text2: "Kode admin tidak valid! Akun tidak dibuat.",
//         position: "top",
//       });
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:4000/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, username, password, adminCode }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);

//       Toast.show({
//         type: "success",
//         text1: data.role === "admin" ? "👑 Akun Admin Dibuat!" : "🎉 Akun User Dibuat!",
//         text2: "Silakan login untuk melanjutkan.",
//         position: "top",
//       });

//       setTimeout(() => router.replace("/(auth)/login"), 1500);
//     } catch (err) {
//       Toast.show({
//         type: "error",
//         text1: "❌ Gagal Mendaftar",
//         text2: err.message || "Terjadi kesalahan server.",
//         position: "top",
//       });
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#fff" }}>
//       <Text style={{ fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
//         📝 Daftar Akun Baru
//       </Text>

//       <TextInput
//         placeholder="Nama Lengkap"
//         value={name}
//         onChangeText={setName}
//         style={inputStyle}
//       />
//       <TextInput
//         placeholder="Username"
//         value={username}
//         onChangeText={setUsername}
//         style={inputStyle}
//       />
//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//         style={inputStyle}
//       />
//       <TextInput
//         placeholder="Kode Admin (opsional)"
//         value={adminCode}
//         onChangeText={setAdminCode}
//         style={{ ...inputStyle, marginBottom: 20 }}
//       />

//       <TouchableOpacity onPress={handleRegister} style={buttonStyle}>
//         <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Daftar</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
//         <Text style={{ textAlign: "center", color: "#007AFF" }}>
//           Sudah punya akun? Login di sini
//         </Text>
//       </TouchableOpacity>

//       <Toast position="top" visibilityTime={2000} topOffset={50} />
//     </View>
//   );
// }

// const inputStyle = {
//   borderWidth: 1,
//   borderColor: "#ccc",
//   padding: 10,
//   borderRadius: 8,
//   marginBottom: 12,
// };

// const buttonStyle = {
//   backgroundColor: "#34C759",
//   padding: 12,
//   borderRadius: 8,
//   marginBottom: 10,
// };

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();

  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleRegister = async () => {
    if (!name || !username || !password) {
      Toast.show({
        type: "error",
        text1: "Field Kosong",
        text2: "Isi semua field (nama, username, password).",
      });
      return;
    }

    const ADMIN_SECRET = "EVENTMATE2025";
    const inputCode = (adminCode || "").trim().toLowerCase();
    const validCode = ADMIN_SECRET.toLowerCase();

    if (adminCode && inputCode !== validCode) {
      Toast.show({
        type: "error",
        text1: "Kode Admin Salah",
        text2: "Kode admin tidak valid! Akun tidak dibuat.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, adminCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Toast.show({
        type: "success",
        text1: data.role === "admin" ? "Akun Admin Dibuat!" : "Akun User Dibuat!",
        text2: "Silakan login untuk melanjutkan.",
      });

      setTimeout(() => router.replace("/(auth)/login"), 1500);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal Mendaftar",
        text2: err.message || "Terjadi kesalahan server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Mode Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            padding: 12,
            backgroundColor: theme.card,
            borderRadius: 12,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <MaterialIcons
            name={isDark ? "light-mode" : "dark-mode"}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ marginBottom: 32, alignItems: "center", marginTop: 20 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.primaryLight,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <MaterialIcons name="person-add" size={40} color={theme.primary} />
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Create Account
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary }}>
            Daftar untuk memulai! 🎉
          </Text>
        </View>

        {/* Name Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Nama Lengkap
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 16,
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <MaterialIcons
              name="badge"
              size={20}
              color={theme.textSecondary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Masukkan nama lengkap"
              placeholderTextColor={theme.textTertiary}
              value={name}
              onChangeText={setName}
              style={{
                flex: 1,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.text,
              }}
            />
          </View>
        </View>

        {/* Username Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Username
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 16,
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <MaterialIcons
              name="person-outline"
              size={20}
              color={theme.textSecondary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Masukkan username"
              placeholderTextColor={theme.textTertiary}
              value={username}
              onChangeText={setUsername}
              style={{
                flex: 1,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.text,
              }}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Password
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 16,
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <MaterialIcons
              name="lock-outline"
              size={20}
              color={theme.textSecondary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Masukkan password"
              placeholderTextColor={theme.textTertiary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={{
                flex: 1,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.text,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ padding: 4 }}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Code Input */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.text,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            Kode Admin (Opsional)
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 16,
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <MaterialIcons
              name="admin-panel-settings"
              size={20}
              color={theme.textSecondary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Kosongkan jika user biasa"
              placeholderTextColor={theme.textTertiary}
              value={adminCode}
              onChangeText={setAdminCode}
              style={{
                flex: 1,
                paddingVertical: 14,
                fontSize: 15,
                color: theme.text,
              }}
            />
          </View>
        </View>

        {/* Register Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: "center",
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              marginBottom: 20,
            }}
          >
            <Text
              style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}
            >
              {loading ? "Loading..." : "Create Account"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Link */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
            Sudah punya akun?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text
              style={{
                color: theme.primary,
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}