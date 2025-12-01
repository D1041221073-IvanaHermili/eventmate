import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import createApi from "../../src/services/api";

export default function UserHome() {
  const { logout, user, token } = useAuth();
  const api = useMemo(() => createApi(token), [token]);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [userRegisteredEvents, setUserRegisteredEvents] = useState([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");

  // ============================================================
  // LOAD ALL EVENTS
  // ============================================================
  const loadEvents = async () => {
    try {
      const res = await api.get("/events");
      const data = res.data.events || res.data;
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) {
      console.log("Error load events:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD USER REGISTERED EVENTS
  // ============================================================
  const loadUserRegistrations = async () => {
    try {
      const res = await api.get("/user/events");
      const eventList = res.data.events || [];
      const ids = eventList.map((e) => e.id);
      setUserRegisteredEvents(ids);
    } catch (err) {
      console.log("Error load registrations:", err.message);
    }
  };

  useEffect(() => {
    if (token) {
      loadEvents();
      loadUserRegistrations();
    }
  }, [token]);

  // ============================================================
  // FORMAT HELPERS
  // ============================================================
  const formatTime = (t) => (t ? t.substring(0, 5) : "-");
  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const categories = [
    "All",
    ...new Set(events.map((e) => e.category || "Tanpa Kategori")),
  ];

  const dateFilters = ["All", "Hari Ini", "Besok", "Minggu Ini", "Bulan Ini"];

  // ============================================================
  // FILTER LOGIC
  // ============================================================
  useEffect(() => {
    let list = events;
    const now = new Date();

    if (selectedCategory !== "All") {
      list = list.filter(
        (e) => (e.category || "Tanpa Kategori") === selectedCategory
      );
    }

    if (selectedDateFilter === "Hari Ini") {
      list = list.filter(
        (e) => new Date(e.date).toDateString() === now.toDateString()
      );
    }

    if (selectedDateFilter === "Besok") {
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      list = list.filter(
        (e) => new Date(e.date).toDateString() === tmr.toDateString()
      );
    }

    if (selectedDateFilter === "Minggu Ini") {
      const start = new Date(now);
      const end = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      end.setDate(start.getDate() + 6);
      list = list.filter((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }

    if (selectedDateFilter === "Bulan Ini") {
      const m = now.getMonth();
      const y = now.getFullYear();
      list = list.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === m && d.getFullYear() === y;
      });
    }

    setFilteredEvents(list);
  }, [selectedCategory, selectedDateFilter, events]);

  // ============================================================
  // REGISTER EVENT
  // ============================================================
  const handleRegister = async () => {
    if (!selectedEvent) return;

    if (userRegisteredEvents.includes(selectedEvent.id)) {
      Toast.show({
        type: "info",
        text1: "Kamu sudah terdaftar di event ini",
      });
      return;
    }

    try {
      setRegistering(true);
      await api.post(`/events/${selectedEvent.id}/register`);

      Toast.show({
        type: "success",
        text1: "Berhasil daftar!",
        text2: selectedEvent.title,
      });

      setUserRegisteredEvents((prev) => [...prev, selectedEvent.id]);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal daftar event",
      });
    } finally {
      setRegistering(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f9f9f9" }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>🎟️ Event Tersedia</Text>
        <TouchableOpacity onPress={logout} style={{ padding: 6 }}>
          <Ionicons name="log-out-outline" size={28} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {user && (
        <Text style={{ marginBottom: 15, color: "#333" }}>
          👋 Hi, {user.name || "User"}
        </Text>
      )}

      {/* ===================================== */}
      {/* FILTER BAR — ESTETIK CHIP STYLE */}
      {/* ===================================== */}
      <View style={{ marginBottom: 15 }}>
        {/* CATEGORY */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor:
                  selectedCategory === cat ? "#2f60ff" : "#e5e7eb",
                borderRadius: 20,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedCategory === cat ? "#fff" : "#333",
                  fontWeight: "600",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DATE FILTER */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {dateFilters.map((df) => (
            <TouchableOpacity
              key={df}
              onPress={() => setSelectedDateFilter(df)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor:
                  selectedDateFilter === df ? "#007AFF" : "#e5e7eb",
                borderRadius: 20,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedDateFilter === df ? "#fff" : "#333",
                  fontWeight: "600",
                }}
              >
                {df}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* EVENT LIST */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedEvent(item)}
            style={{
              padding: 15,
              borderRadius: 12,
              backgroundColor: "#fff",
              marginBottom: 12,
              elevation: 2,
            }}
          >
            <Text
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#dce7ff",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                color: "#2f60ff",
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              {item.category || "Tanpa Kategori"}
            </Text>

            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.title}</Text>
            <Text>📅 {formatDate(item.date)}</Text>
            <Text>
              🕒 {formatTime(item.start_time)} - {formatTime(item.end_time)}
            </Text>
            <Text>📍 {item.location}</Text>
          </TouchableOpacity>
        )}
      />

      {/* MODAL DETAIL */}
      <Modal
        visible={!!selectedEvent}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              maxWidth: 420,
              elevation: 10,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
              {selectedEvent?.title}
            </Text>

            <Text
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#dce7ff",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                color: "#2f60ff",
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              {selectedEvent?.category || "Tanpa Kategori"}
            </Text>

            <Text>📅 {formatDate(selectedEvent?.date)}</Text>
            <Text>
              🕒 {formatTime(selectedEvent?.start_time)} —{" "}
              {formatTime(selectedEvent?.end_time)}
            </Text>
            <Text>📍 {selectedEvent?.location}</Text>
            <Text>💰 Rp {Number(selectedEvent?.price).toLocaleString()}</Text>

            <View
              style={{
                height: 1,
                backgroundColor: "#eee",
                marginVertical: 12,
              }}
            />

            <Text style={{ color: "#666", marginBottom: 15 }}>
              {selectedEvent?.description}
            </Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
              <Pressable
                disabled={
                  registering ||
                  userRegisteredEvents.includes(selectedEvent?.id)
                }
                onPress={handleRegister}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: userRegisteredEvents.includes(
                    selectedEvent?.id
                  )
                    ? "#999"
                    : "#28a745",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {userRegisteredEvents.includes(selectedEvent?.id)
                    ? "Sudah Terdaftar"
                    : registering
                    ? "Mendaftar..."
                    : "Daftar Event"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedEvent(null)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: "#007AFF",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  Tutup
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
}
