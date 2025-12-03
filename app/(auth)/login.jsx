// import { useRouter } from "expo-router";
// import { useState } from "react";
// import { Text, TextInput, TouchableOpacity, View } from "react-native";
// import Toast from "react-native-toast-message";
// import { useAuth } from "../../src/contexts/AuthContext"; // ⬅ penting!

// export default function LoginScreen() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const router = useRouter();

//   const { login } = useAuth(); // ⬅ ambil fungsi login()

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Toast.show({
//         type: "error",
//         text1: "⚠️ Field Kosong",
//         text2: "Isi username dan password terlebih dahulu.",
//         position: "top",
//       });
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:4000/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (data.message?.toLowerCase().includes("tidak ditemukan")) {
//           Toast.show({
//             type: "error",
//             text1: "❌ Gagal Login",
//             text2: "Username tidak ditemukan.",
//             position: "top",
//           });
//         } else if (data.message?.toLowerCase().includes("password")) {
//           Toast.show({
//             type: "error",
//             text1: "❌ Gagal Login",
//             text2: "Password yang kamu masukkan salah.",
//             position: "top",
//           });
//         } else {
//           Toast.show({
//             type: "error",
//             text1: "⚠️ Error",
//             text2: data.message || "Terjadi kesalahan saat login.",
//             position: "top",
//           });
//         }
//         return;
//       }

//       // 🔥 SIMPAN TOKEN + USER KE AUTHCONTEXT (PENTING BANGET)
//       await login(data.token, data.user);

//       // Tidak perlu router.replace()
//       // AuthContext otomatis redirect ke halaman sesuai role
//       Toast.show({
//         type: "success",
//         text1: `👋 Selamat datang, ${data.user.username}!`,
//         text2: `Login sebagai ${data.user.role.toUpperCase()}.`,
//         position: "top",
//       });

//     } catch (err) {
//       Toast.show({
//         type: "error",
//         text1: "❌ Gagal Terhubung",
//         text2: "Tidak dapat menghubungi server. Pastikan backend aktif.",
//         position: "top",
//       });
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#fff" }}>
//       <Text style={{ fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
//         🔐 Login ke EventMate
//       </Text>

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

//       <TouchableOpacity onPress={handleLogin} style={buttonStyle}>
//         <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Masuk</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
//         <Text style={{ textAlign: "center", color: "#007AFF" }}>
//           Belum punya akun? Daftar di sini
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
//   backgroundColor: "#007AFF",
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
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

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: "error",
        text1: "Field Kosong",
        text2: "Isi username dan password terlebih dahulu.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message?.toLowerCase().includes("tidak ditemukan")) {
          Toast.show({
            type: "error",
            text1: "Gagal Login",
            text2: "Username tidak ditemukan.",
          });
        } else if (data.message?.toLowerCase().includes("password")) {
          Toast.show({
            type: "error",
            text1: "Gagal Login",
            text2: "Password yang kamu masukkan salah.",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: data.message || "Terjadi kesalahan saat login.",
          });
        }
        return;
      }

      await login(data.token, data.user);

      Toast.show({
        type: "success",
        text1: `Selamat datang, ${data.user.username}!`,
        text2: `Login sebagai ${data.user.role.toUpperCase()}.`,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal Terhubung",
        text2: "Tidak dapat menghubungi server.",
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
      <View style={{ flex: 1, justifyContent: "center", padding: 30 }}>
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
        <View style={{ marginBottom: 40, alignItems: "center" }}>
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
            <MaterialIcons name="event" size={40} color={theme.primary} />
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Login
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary }}>
            Selamat datang kembali! 👋
          </Text>
        </View>

        {/* Username Input */}
        <View style={{ marginBottom: 20 }}>
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
                paddingVertical: 16,
                fontSize: 15,
                color: theme.text,
              }}
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={{ marginBottom: 12 }}>
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
                paddingVertical: 16,
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

        {/* Forgot Password */}
        <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 24 }}>
          <Text
            style={{
              color: theme.primary,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            Lupa Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleLogin}
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
              {loading ? "Loading..." : "Login"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Register Link */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
            Belum punya akun?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text
              style={{
                color: theme.primary,
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              Daftar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Toast />
    </KeyboardAvoidingView>
  );
}