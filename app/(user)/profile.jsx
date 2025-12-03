import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/contexts/ThemeContext";
import createApi from "../../src/services/api";

export default function UserProfile() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [pendingEventId, setPendingEventId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const isFocused = useIsFocused();
  const api = createApi(token);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const loadMyEvents = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await api.get("/user/events");
      setMyEvents(res.data.events || []);
    } catch (err) {
      Toast.show({ type: "error", text1: "Gagal memuat event" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused && token) loadMyEvents();
  }, [isFocused, token]);

  const confirmCancel = (eventId) => {
    setPendingEventId(eventId);
    setShowModal(true);
  };

  const handleCancelRegistration = async () => {
    if (!pendingEventId) return;

    setIsCancelling(true);
    setShowModal(false);

    try {
      await api.delete(`/user/events/${pendingEventId}/cancel`);
      Toast.show({ type: "success", text1: "Berhasil batalkan pendaftaran" });
      loadMyEvents();
    } catch (err) {
      Toast.show({ type: "error", text1: "Gagal membatalkan" });
    } finally {
      setIsCancelling(false);
      setPendingEventId(null);
    }
  };

  return (
  <View style={{ flex: 1, backgroundColor: theme.background }}>
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
    >
{/* HEADER PROFILE TANPA ANIMASI */}
<View
  style={{
    backgroundColor: theme.primary,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  }}
>
  <View 
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", gap: 20, flex: 1 }}>
      {/* Foto Bulat */}
      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: "#fff",
          overflow: "hidden",
          elevation: 6,
        }}
      >
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      {/* Nama + Username */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          {user?.name || "User"}
        </Text>

        <Text style={{ fontSize: 16, color: theme.primaryLight }}>
          @{user?.username || user?.email?.split("@")[0]}
        </Text>
      </View>
    </View>

    {/* ICON DARK MODE */}
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        marginRight: 10,
      }}
    >
      <MaterialIcons
        name={isDark ? "light-mode" : "dark-mode"}
        size={24}
        color="#FFFFFF"
      />
    </TouchableOpacity>

    {/* TOMBOL LOGOUT */}
    <TouchableOpacity
      onPress={logout}
      style={{
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
      }}
    >
      <MaterialIcons
        name="logout"
        size={24}
        color="#fff"
      />
    </TouchableOpacity>
  </View>
</View>


      {/* STATS SECTION */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          marginTop: -25,
          gap: 12,
        }}
      >
        {/* TOTAL */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.border,
            elevation: 4,
          }}
        >
          <Ionicons name="calendar-outline" size={28} color={theme.primary} />
          <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.text }}>
            {myEvents.length}
          </Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary }}>Total</Text>
        </View>

        {/* SELESAI */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.border,
            elevation: 4,
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={28} color={theme.success} />
          <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.text }}>
            {myEvents.filter((e) => new Date(e.date) < new Date()).length}
          </Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary }}>
            Selesai
          </Text>
        </View>

        {/* MENDATANG */}
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.border,
            elevation: 4,
          }}
        >
          <Ionicons name="time-outline" size={28} color={theme.warning} />
          <Text style={{ fontSize: 22, fontWeight: "bold", color: theme.text }}>
            {myEvents.filter((e) => new Date(e.date) >= new Date()).length}
          </Text>
          <Text style={{ fontSize: 13, color: theme.textSecondary }}>
            Mendatang
          </Text>
        </View>
      </View>

      {/* LIST EVENT */}
      <View style={{ paddingHorizontal: 20, marginTop: 25 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 16,
          }}
        >
          📌 Event yang Kamu Ikuti
        </Text>

        {(loading || authLoading) && (
          <ActivityIndicator size="large" color={theme.primary} />
        )}

        {!loading && myEvents.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons
              name="calendar-outline"
              size={80}
              color={theme.textTertiary}
            />
            <Text
              style={{
                color: theme.textSecondary,
                marginTop: 16,
                fontSize: 16,
              }}
            >
              Kamu belum mendaftar event apa pun.
            </Text>
          </View>
        )}

        {/* MANUAL LIST (bukan FlatList) */}
        {!loading &&
          myEvents.map((item) => (
            <View
              key={item.id}
              style={{
                padding: 18,
                borderRadius: 16,
                backgroundColor: theme.card,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: theme.border,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    backgroundColor: theme.primaryLight,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    color: theme.primary,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {item.category || "Tanpa Kategori"}
                </Text>

                <Pressable
                  onPress={() => confirmCancel(item.id)}
                  style={{
                    backgroundColor: theme.errorLight,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons name="close-circle" size={16} color={theme.error} />
                  <Text
                    style={{
                      color: theme.error,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    Batal
                  </Text>
                </Pressable>
              </View>

              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  color: theme.text,
                  marginBottom: 10,
                }}
              >
                {item.title}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={theme.textSecondary}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: theme.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {formatDate(item.date)}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={theme.textSecondary}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: theme.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {item.location}
                </Text>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>

      {/* MODAL KONFIRMASI */}
      <Modal transparent visible={showModal} animationType="fade">
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
              width: "90%",
              maxWidth: 400,
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              shadowColor: theme.shadow,
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: theme.errorLight,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="warning" size={36} color={theme.error} />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 12,
                color: theme.text,
              }}
            >
              Yakin Batalkan?
            </Text>

            <Text
              style={{
                textAlign: "center",
                marginBottom: 28,
                color: theme.textSecondary,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Kamu tidak akan bisa mengikuti event ini lagi setelah dibatalkan.
            </Text>

            <View style={{ flexDirection: "row", width: "100%", gap: 12 }}>
              <Pressable
                onPress={() => setShowModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: theme.border,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.text,
                  }}
                >
                  Tidak
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCancelRegistration}
                style={{
                  flex: 1,
                  backgroundColor: theme.error,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  Ya, Batalkan
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {isCancelling && (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              padding: 30,
              borderRadius: 20,
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: 16, color: theme.text, fontSize: 16 }}>
              Membatalkan...
            </Text>
          </View>
        </View>
      )}

      <Toast />
    </View>
  );
}