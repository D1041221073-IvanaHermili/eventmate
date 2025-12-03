import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import createApi from "../../src/services/api";

export default function AdminEvents() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const api = createApi(token);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const formatTime = (time) => {
    if (!time) return "-";
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  };

  const formatDate = (dateStr) => {
  if (!dateStr) return "-";

  // tanggal backend 100% pasti "YYYY-MM-DD"
  const [y, m, d] = dateStr.split("-");

  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

    return `${d} ${bulan[Number(m) - 1]} ${y}`;
  };


  const loadEvents = async () => {
    try {
      const res = await api.get("/events");
      console.log("EVENTS>>>", res.data.events);

      setEvents(res.data.events || []);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal memuat event",
        text2: err.message || "Terjadi kesalahan",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (isFocused) {
    setLoading(true);  // biar indikator muncul lagi
    loadEvents();
  }
}, [isFocused]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      Toast.show({ type: "success", text1: "Event dihapus", position: "top" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal menghapus",
        text2: err.message || "Terjadi kesalahan",
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          logout();
          router.replace("/(auth)/login");
        }}
      >
        <Ionicons name="log-out-outline" size={26} color="red" />
      </TouchableOpacity>

      <Text style={styles.title}>📋 Kelola Event</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>

              {/* KATEGORI */}
              <Text style={styles.category}>{item.category || "Tanpa Kategori"}</Text>

              <Text style={styles.eventTitle}>{item.title}</Text>

              <Text style={styles.info}>
                {formatDate(item.date)} • {formatTime(item.start_time)} -{" "}
                {formatTime(item.end_time)}
              </Text>

              <Text style={styles.location}>{item.location}</Text>

              {/* Tombol kanan */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => router.push(`/(admin)/edit-event/${item.id}`)}
                >
                  <Ionicons name="create-outline" size={22} color="#ffaa00" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(admin)/add-event")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Toast position="top" topOffset={50} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

  logoutBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 5,
    zIndex: 10,
  },

  card: {
    backgroundColor: "#f2f6ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },

  category: {
    alignSelf: "flex-start",
    backgroundColor: "#dce7ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#2f60ff",
    fontWeight: "600",
    marginBottom: 6,
  },

  eventTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },

  info: { color: "#444", marginBottom: 4 },

  location: { color: "#666", marginBottom: 10 },

  actionRow: {
    position: "absolute",
    right: 10,
    top: 10,
    flexDirection: "row",
    gap: 12,
  },

  iconBtn: { padding: 6 },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
