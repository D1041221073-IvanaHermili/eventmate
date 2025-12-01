import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../src/contexts/AuthContext";
import createApi from "../../../src/services/api";

const CATEGORIES = [
  "Seminar",
  "Workshop",
  "Lomba",
  "Webinar",
  "Seminar Kerja Praktik",
  "Seminar Proposal",
  "Sidang Terbuka",
];

export default function EditEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const api = createApi(token);

  const [eventData, setEventData] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const loadEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      const e = res.data.event;

      setEventData({
        ...e,
        category: e.category || "",
        date: e.date ? new Date(e.date) : new Date(),
        start_time: new Date(`1970-01-01T${e.start_time}`),
        end_time: new Date(`1970-01-01T${e.end_time}`),
        price: e.price ? String(e.price) : "0",
      });
    } catch {
      console.log("Gagal load data");
    }
  };

  useEffect(() => {
    loadEvent();
  }, []);

  if (!eventData) return null;

  const formatDate = (d) => d.toISOString().split("T")[0];
  const formatTime = (t) =>
    t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const handleSave = async () => {
    try {
      await api.put(`/events/${id}`, {
        title: eventData.title,
        category: eventData.category,
        date: formatDate(eventData.date),
        start_time: formatTime(eventData.start_time),
        end_time: formatTime(eventData.end_time),
        location: eventData.location,
        description: eventData.description,
        price: Number(eventData.price),
      });

      Toast.show({
        type: "success",
        text1: "Event diperbarui",
      });

      setTimeout(() => router.replace("/(admin)"), 800);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal update",
        text2: err.response?.data?.message || err.message,
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>✏️ Edit Event</Text>

      {/* JUDUL */}
      <TextInput
        style={styles.input}
        value={eventData.title}
        onChangeText={(v) => setEventData({ ...eventData, title: v })}
      />

      {/* KATEGORI (SAMA PERSIS SEPERTI ADD) */}
      <Text style={styles.label}>Kategori Event</Text>

      <View style={styles.dropdown}>
        {Platform.OS === "web" ? (
          <select
            value={eventData.category}
            onChange={(e) =>
              setEventData({ ...eventData, category: e.target.value })
            }
            style={{ width: "100%", padding: 12, borderRadius: 8 }}
          >
            <option value="">Pilih kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        ) : (
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() =>
              setEventData({
                ...eventData,
                openDropdown: !eventData.openDropdown,
              })
            }
          >
            <Text>{eventData.category || "Pilih kategori"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {eventData.openDropdown && Platform.OS !== "web" && (
        <View style={styles.dropdownList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.dropdownItem}
              onPress={() =>
                setEventData({
                  ...eventData,
                  category: cat,
                  openDropdown: false,
                })
              }
            >
              <Text>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* TANGGAL */}
      <Text style={styles.label}>Tanggal Event</Text>

      {Platform.OS === "web" ? (
        <input
          type="date"
          value={formatDate(eventData.date)}
          onChange={(e) =>
            setEventData({ ...eventData, date: new Date(e.target.value) })
          }
          className="web-input"
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate(eventData.date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={eventData.date}
              mode="date"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected)
                  setEventData({ ...eventData, date: selected });
              }}
            />
          )}
        </>
      )}

      {/* TIME ROW — SAMA PERSIS DENGAN ADD */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Jam Mulai</Text>

          {Platform.OS === "web" ? (
  <input
    type="time"
    value={formatTime(eventData.start_time)}
    onChange={(e) =>
      setEventData({
        ...eventData,
        start_time: new Date(`1970-01-01T${e.target.value}`),
      })
    }
    className="web-input"
  />
) : (
  <>
    <TouchableOpacity
      style={styles.input}
      onPress={() => setShowStartPicker(true)}
    >
      <Text>{formatTime(eventData.start_time)}</Text>
    </TouchableOpacity>

    {showStartPicker && (
      <DateTimePicker
        value={eventData.start_time}
        mode="time"
        is24Hour
        onChange={(e, selected) => {
          setShowStartPicker(false);
          if (selected)
            setEventData({ ...eventData, start_time: selected });
        }}
      />
    )}
  </>
)}

        </View>

        <Text style={styles.strip}>—</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Jam Selesai</Text>

          {Platform.OS === "web" ? (
  <input
    type="time"
    value={formatTime(eventData.end_time)}
    onChange={(e) =>
      setEventData({
        ...eventData,
        end_time: new Date(`1970-01-01T${e.target.value}`),
      })
    }
    className="web-input"
  />
) : (
  <>
    <TouchableOpacity
      style={styles.input}
      onPress={() => setShowEndPicker(true)}
    >
      <Text>{formatTime(eventData.end_time)}</Text>
    </TouchableOpacity>

    {showEndPicker && (
      <DateTimePicker
        value={eventData.end_time}
        mode="time"
        is24Hour
        onChange={(e, selected) => {
          setShowEndPicker(false);
          if (selected)
            setEventData({ ...eventData, end_time: selected });
        }}
      />
    )}
  </>
)}

        </View>
      </View>

      {/* INPUT LAINNYA */}
      <TextInput
        style={styles.input}
        value={eventData.location}
        onChangeText={(v) => setEventData({ ...eventData, location: v })}
      />

      <TextInput
        style={styles.input}
        value={eventData.description}
        onChangeText={(v) =>
          setEventData({ ...eventData, description: v })
        }
      />

      <TextInput
        style={styles.input}
        value={eventData.price}
        onChangeText={(v) => setEventData({ ...eventData, price: v })}
        keyboardType="numeric"
      />

      {/* BUTTONS */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={styles.btnText}>Simpan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => router.back()}
        >
          <Text style={styles.btnOutlineText}>Kembali</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "white" },

  title: { fontSize: 24, fontWeight: 700, marginBottom: 20 },

  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },

  dropdown: { marginBottom: 12 },

  dropdownBtn: {
    borderWidth: 1,
    borderColor: "#bbb",
    padding: 14,
    borderRadius: 8,
  },

  dropdownList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },

  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  row: { flexDirection: "row", marginTop: 12, marginBottom: 18 },

  strip: {
    fontSize: 22,
    marginHorizontal: 12,
    alignSelf: "center",
    fontWeight: "bold",
    marginTop: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },

  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  btn: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },

  btnText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },

  btnOutline: {
    borderWidth: 2,
    borderColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },

  btnOutlineText: {
    textAlign: "center",
    color: "#007AFF",
    fontWeight: "bold",
  },
});
