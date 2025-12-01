import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../src/contexts/AuthContext";
import createApi from "../../src/services/api";

export default function UserProfile() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [pendingEventId, setPendingEventId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const isFocused = useIsFocused(); // ⬅️ Auto refresh after navigate
  const api = createApi(token);

  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  // LOAD EVENT
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

  // AUTO RELOAD saat halaman dibuka kembali
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
    <View style={{ flex: 1, backgroundColor: "#f9f9f9", padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        👤 Profil Saya
      </Text>

      {/* Profile Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 20,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#eee",
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
          }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
        />
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          {user?.name || "User"}
        </Text>
        <Text style={{ color: "#666" }}>{user?.email}</Text>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        📌 Event yang Kamu Ikuti
      </Text>

      {(loading || authLoading) && <ActivityIndicator size="large" />}

      {!loading && myEvents.length === 0 && (
        <Text style={{ color: "#666" }}>
          Kamu belum mendaftar event apa pun.
        </Text>
      )}

      <FlatList
        data={myEvents}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              borderRadius: 14,
              backgroundColor: "#fff",
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#eee",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 2,
              position: "relative",
            }}
          >
            {/* Tombol batal */}
            <Pressable
              onPress={() => confirmCancel(item.id)}
              style={({ hovered, pressed }) => ({
                position: "absolute",
                right: 10,
                top: 10,
                backgroundColor: hovered || pressed ? "#e12b2b" : "#ff4444",
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 12,
                elevation: 3,
              })}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                Batal
              </Text>
            </Pressable>

            <Text
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#E8EFFF",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
                color: "#3159DE",
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              {item.category || "Tanpa Kategori"}
            </Text>

            <Text style={{ fontWeight: "bold", fontSize: 17 }}>
              {item.title}
            </Text>
            <Text>📅 {formatDate(item.date)}</Text>
            <Text>📍 {item.location}</Text>
          </View>
        )}
      />

      {/* Modal Konfirmasi */}
      <Modal transparent visible={showModal} animationType="fade">
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
              width: "86%",
              borderRadius: 22,
              padding: 25,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                marginBottom: 12,
                color: "#222",
              }}
            >
              Yakin Batalkan?
            </Text>

            <Text
              style={{
                textAlign: "center",
                marginBottom: 28,
                color: "#555",
                fontSize: 16,
              }}
            >
              Kamu tidak akan bisa mengikuti event ini lagi setelah dibatalkan.
            </Text>

            <View style={{ flexDirection: "row", width: "100%", gap: 14 }}>
              {/* Tombol Tidak */}
              <Pressable
                onPress={() => setShowModal(false)}
                style={({ hovered, pressed }) => ({
                  flex: 1,
                  backgroundColor: hovered || pressed ? "#e0e0e0" : "#efefef",
                  paddingVertical: 12,
                  borderRadius: 12,
                })}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Tidak
                </Text>
              </Pressable>

              {/* Tombol Ya */}
              <Pressable
                onPress={handleCancelRegistration}
                style={({ hovered, pressed }) => ({
                  flex: 1,
                  backgroundColor: hovered || pressed ? "#e12b2b" : "#ff4444",
                  paddingVertical: 12,
                  borderRadius: 12,
                })}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  Ya, Batalkan
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading cancel overlay */}
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
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      <Toast />
    </View>
  );
}
