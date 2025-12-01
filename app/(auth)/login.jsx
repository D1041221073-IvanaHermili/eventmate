import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext"; // ⬅ penting!

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const { login } = useAuth(); // ⬅ ambil fungsi login()

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: "error",
        text1: "⚠️ Field Kosong",
        text2: "Isi username dan password terlebih dahulu.",
        position: "top",
      });
      return;
    }

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
            text1: "❌ Gagal Login",
            text2: "Username tidak ditemukan.",
            position: "top",
          });
        } else if (data.message?.toLowerCase().includes("password")) {
          Toast.show({
            type: "error",
            text1: "❌ Gagal Login",
            text2: "Password yang kamu masukkan salah.",
            position: "top",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "⚠️ Error",
            text2: data.message || "Terjadi kesalahan saat login.",
            position: "top",
          });
        }
        return;
      }

      // 🔥 SIMPAN TOKEN + USER KE AUTHCONTEXT (PENTING BANGET)
      await login(data.token, data.user);

      // Tidak perlu router.replace()
      // AuthContext otomatis redirect ke halaman sesuai role
      Toast.show({
        type: "success",
        text1: `👋 Selamat datang, ${data.user.username}!`,
        text2: `Login sebagai ${data.user.role.toUpperCase()}.`,
        position: "top",
      });

    } catch (err) {
      Toast.show({
        type: "error",
        text1: "❌ Gagal Terhubung",
        text2: "Tidak dapat menghubungi server. Pastikan backend aktif.",
        position: "top",
      });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
        🔐 Login ke EventMate
      </Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={inputStyle}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={inputStyle}
      />

      <TouchableOpacity onPress={handleLogin} style={buttonStyle}>
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Masuk</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={{ textAlign: "center", color: "#007AFF" }}>
          Belum punya akun? Daftar di sini
        </Text>
      </TouchableOpacity>

      <Toast position="top" visibilityTime={2000} topOffset={50} />
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
};

const buttonStyle = {
  backgroundColor: "#007AFF",
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
};
