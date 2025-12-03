import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/contexts/ThemeContext";
import createApi from "../../src/services/api";

export default function UserHome() {
  const { logout, user, token } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const api = useMemo(() => createApi(token), [token]);

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [userRegisteredEvents, setUserRegisteredEvents] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const scaleAnim = new Animated.Value(1);
  const isFocused = useIsFocused();

  const getCategoryStyle = (category) => {
    const cat = category || "Tanpa Kategori";
    return theme.categories[cat] || theme.categories["Tanpa Kategori"];
  };

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

  useEffect(() => {
  if (isFocused && token) {
    loadEvents();
    loadUserRegistrations();
  }
}, [isFocused]);


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

    // FILTER SEARCH
    if (searchQuery.trim() !== "") {
      const lower = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          (e.category || "Tanpa Kategori").toLowerCase().includes(lower) ||
          e.location.toLowerCase().includes(lower)
      );
    }

    setFilteredEvents(list);
  }, [selectedCategory, selectedDateFilter, events, searchQuery]);

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

  const handleCardPress = (item) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    setSelectedEvent(item);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
     
{/* HEADER */}
<View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30, // Diubah dari 15 jadi 30 agar sama dengan profile
    backgroundColor: theme.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 6 }, // Diubah dari 4 jadi 6 agar sama dengan profile
    shadowOpacity: 0.3,
    shadowRadius: 10, // Diubah dari 8 jadi 10 agar sama dengan profile
    elevation: 10, // Diubah dari 8 jadi 10 agar sama dengan profile
  }}
>
  <View>
    <Text style={{ fontSize: 22, fontWeight: "bold", color: "#FFFFFF" }}>
      Eventify
    </Text>
    <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
      Welcome back👋
    </Text>
  </View>

  <View style={{ flexDirection: "row", gap: 20 }}>
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
      }}
    >
      <MaterialIcons
        name={isDark ? "light-mode" : "dark-mode"}
        size={24}
        color="#FFFFFF"
      />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={logout}
      style={{
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
      }}
    >
      <MaterialIcons name="logout" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
</View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, marginTop: 20 }}
        showsVerticalScrollIndicator={false}
      >

{/* SEARCH BAR */}
<View
  style={{
    backgroundColor: theme.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: searchQuery ? theme.primary : theme.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: searchQuery ? 0.2 : 0.08,
    shadowRadius: 8,
    elevation: searchQuery ? 6 : 3,
  }}
>
  <View
    style={{
      backgroundColor: theme.primaryLight,
      padding: 8,
      borderRadius: 10,
      marginRight: 12,
    }}
  >
    <MaterialIcons 
      name="search" 
      size={22} 
      color={theme.primary}
    />
  </View>
  
  <TextInput
    placeholder="Cari event berdasarkan judul..."
    placeholderTextColor={theme.textSecondary}
    value={searchQuery}
    onChangeText={setSearchQuery}
    style={{
      flex: 1,
      color: theme.text,
      fontSize: 15,
      fontWeight: "500",
    }}
  />
  
  {searchQuery.length > 0 && (
    <TouchableOpacity
      onPress={() => setSearchQuery("")}
      style={{
        backgroundColor: theme.border,
        padding: 6,
        borderRadius: 8,
        marginLeft: 8,
      }}
    >
      <MaterialIcons 
        name="close" 
        size={18} 
        color={theme.textSecondary}
      />
    </TouchableOpacity>
  )}
</View>

        {/* CATEGORY FILTER */}
        {/* <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 12 }}>
          <MaterialIcons name="category" size={16} /> Kategori
        </Text> */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
          {categories.map((cat) => {
            const catStyle = cat !== "All" ? getCategoryStyle(cat) : null;
            const isSelected = selectedCategory === cat;
            
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  backgroundColor: isSelected 
                    ? (catStyle?.bg || theme.primary) 
                    : theme.card,
                  borderRadius: 20,
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: isSelected 
                    ? (catStyle?.border || theme.primary) 
                    : theme.border,
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    color: isSelected 
                      ? (catStyle?.text || "#FFFFFF") 
                      : theme.text,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* DATE FILTER */}
        {/* <Text style={{ fontSize: 16, fontWeight: "600", color: theme.text, marginBottom: 12 }}>
          <MaterialIcons name="event" size={16} /> Waktu
        </Text> */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {dateFilters.map((df) => (
            <TouchableOpacity
              key={df}
              onPress={() => setSelectedDateFilter(df)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                backgroundColor:
                  selectedDateFilter === df ? theme.success : theme.card,
                borderRadius: 20,
                marginRight: 10,
                borderWidth: 1,
                borderColor: selectedDateFilter === df ? theme.success : theme.border,
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: selectedDateFilter === df ? "#FFFFFF" : theme.text,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {df}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* EVENT LIST */}
        <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.text, marginBottom: 15 }}>
          <MaterialIcons name="confirmation-number" size={18} /> Event Tersedia ({filteredEvents.length})
        </Text>

        {filteredEvents.map((item) => {
          const catStyle = getCategoryStyle(item.category);
          
          return (
            <Animated.View key={item.id} style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={() => handleCardPress(item)}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: theme.card,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                  shadowColor: theme.shadow,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text
                    style={{
                      backgroundColor: catStyle.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      color: catStyle.text,
                      fontWeight: "700",
                      fontSize: 12,
                      borderWidth: 1,
                      borderColor: catStyle.border,
                    }}
                  >
                    {item.category || "Tanpa Kategori"}
                  </Text>

                  {userRegisteredEvents.includes(item.id) && (
                    <View
                      style={{
                        backgroundColor: theme.successLight,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MaterialIcons name="check-circle" size={14} color={theme.success} />
                      <Text style={{ color: theme.success, fontWeight: "600", fontSize: 11 }}>
                        Terdaftar
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={{ fontWeight: "bold", fontSize: 17, color: theme.text, marginBottom: 8 }}>
                  {item.title}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <MaterialIcons name="event" size={16} color={theme.textSecondary} />
                  <Text style={{ marginLeft: 6, color: theme.textSecondary, fontSize: 14 }}>
                    {formatDate(item.date)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <MaterialIcons name="access-time" size={16} color={theme.textSecondary} />
                  <Text style={{ marginLeft: 6, color: theme.textSecondary, fontSize: 14 }}>
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="place" size={16} color={theme.textSecondary} />
                  <Text style={{ marginLeft: 6, color: theme.textSecondary, fontSize: 14 }}>
                    {item.location}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL DETAIL */}
      <Modal visible={!!selectedEvent} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              shadowColor: theme.shadow,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 16,
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.text, marginBottom: 12 }}>
              {selectedEvent?.title}
            </Text>

            {selectedEvent && (
              <Text
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: getCategoryStyle(selectedEvent.category).bg,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  color: getCategoryStyle(selectedEvent.category).text,
                  fontWeight: "700",
                  marginBottom: 16,
                  fontSize: 13,
                  borderWidth: 1,
                  borderColor: getCategoryStyle(selectedEvent.category).border,
                }}
              >
                {selectedEvent.category || "Tanpa Kategori"}
              </Text>
            )}

            <View style={{ backgroundColor: theme.borderLight, height: 1, marginBottom: 16 }} />

            <View style={{ gap: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.primaryLight,
                    padding: 8,
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                >
                  <MaterialIcons name="event" size={20} color={theme.primary} />
                </View>
                <Text style={{ color: theme.text, fontSize: 15 }}>
                  {formatDate(selectedEvent?.date)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.primaryLight,
                    padding: 8,
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                >
                  <MaterialIcons name="access-time" size={20} color={theme.primary} />
                </View>
                <Text style={{ color: theme.text, fontSize: 15 }}>
                  {formatTime(selectedEvent?.start_time)} - {formatTime(selectedEvent?.end_time)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.primaryLight,
                    padding: 8,
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                >
                  <MaterialIcons name="place" size={20} color={theme.primary} />
                </View>
                <Text style={{ color: theme.text, fontSize: 15, flex: 1 }}>
                  {selectedEvent?.location}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.successLight,
                    padding: 8,
                    borderRadius: 10,
                    marginRight: 12,
                  }}
                >
                  <MaterialIcons name="attach-money" size={20} color={theme.success} />
                </View>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600" }}>
                  Rp {Number(selectedEvent?.price).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: theme.borderLight, height: 1, marginBottom: 16 }} />

            <Text style={{ color: theme.textSecondary, lineHeight: 22, marginBottom: 20 }}>
              {selectedEvent?.description}
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                disabled={registering || userRegisteredEvents.includes(selectedEvent?.id)}
                onPress={handleRegister}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: userRegisteredEvents.includes(selectedEvent?.id)
                    ? theme.textTertiary
                    : theme.success,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    textAlign: "center",
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  {userRegisteredEvents.includes(selectedEvent?.id)
                    ? "✓ Terdaftar"
                    : registering
                    ? "Loading..."
                    : "Daftar"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedEvent(null)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: theme.border,
                }}
              >
                <Text
                  style={{
                    color: theme.text,
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