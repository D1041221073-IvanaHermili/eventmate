import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !username || !password) {
      Toast.show({
        type: "error",
        text1: "⚠️ Field Kosong",
        text2: "Isi semua field (nama, username, password).",
        position: "top",
      });
      return;
    }

    const ADMIN_SECRET = "EVENTMATE2025";
    const inputCode = (adminCode || "").trim().toLowerCase();
    const validCode = ADMIN_SECRET.toLowerCase();

    if (adminCode && inputCode !== validCode) {
      Toast.show({
        type: "error",
        text1: "❌ Kode Admin Salah",
        text2: "Kode admin tidak valid! Akun tidak dibuat.",
        position: "top",
      });
      return;
    }

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
        text1: data.role === "admin" ? "👑 Akun Admin Dibuat!" : "🎉 Akun User Dibuat!",
        text2: "Silakan login untuk melanjutkan.",
        position: "top",
      });

      setTimeout(() => router.replace("/(auth)/login"), 1500);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "❌ Gagal Mendaftar",
        text2: err.message || "Terjadi kesalahan server.",
        position: "top",
      });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
        📝 Daftar Akun Baru
      </Text>

      <TextInput
        placeholder="Nama Lengkap"
        value={name}
        onChangeText={setName}
        style={inputStyle}
      />
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
      <TextInput
        placeholder="Kode Admin (opsional)"
        value={adminCode}
        onChangeText={setAdminCode}
        style={{ ...inputStyle, marginBottom: 20 }}
      />

      <TouchableOpacity onPress={handleRegister} style={buttonStyle}>
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Daftar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
        <Text style={{ textAlign: "center", color: "#007AFF" }}>
          Sudah punya akun? Login di sini
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
  backgroundColor: "#34C759",
  padding: 12,
  borderRadius: 8,
  marginBottom: 10,
};
