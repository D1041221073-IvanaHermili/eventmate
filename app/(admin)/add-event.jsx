import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { useAuth } from "../../src/contexts/AuthContext";
import createApi from "../../src/services/api";

const CATEGORIES = [
  "Seminar",
  "Workshop",
  "Lomba",
  "Webinar",
  "Seminar Kerja Praktik",
  "Seminar Proposal",
  "Sidang Terbuka",
];

export default function AddEvent() {
  const router = useRouter();
  const { token } = useAuth();
  const api = createApi(token);

  const [category, setCategory] = useState(""); // 🆕 KATEGORI
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const formatDate = () => date.toISOString().split("T")[0];
  const formatTime = (t) =>
    t.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        category, // 🆕 KATEGORI
        date: formatDate(),
        start_time: formatTime(startTime),
        end_time: formatTime(endTime),
        location,
        description,
        price: price ? Number(price) : 0,
      };

      await api.post("/events", payload);
      Toast.show({ type: "success", text1: "Event berhasil ditambahkan" });
      setTimeout(() => router.replace("/(admin)"), 800);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Gagal menambah",
        text2: err.message,
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}
>
      <Text style={styles.title}>➕ Tambah Event</Text>

      {/* INPUT LAINNYA TIDAK DIUBAH */}
      <TextInput
        style={styles.input}
        placeholder="Judul"
        value={title}
        onChangeText={setTitle}
      />

            {/* 🆕 KATEGORI */}
      <Text style={styles.label}>Kategori Event</Text>

      <View style={styles.dropdown}>
        {Platform.OS === "web" ? (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8 }}
          >
            <option value="">Pilih kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        ) : (
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setCategory(category === "" ? CATEGORIES[0] : "")}
          >
            <Text>{category || "Pilih kategori"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {category === "" && Platform.OS !== "web" && (
        <View style={styles.dropdownList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.dropdownItem}
              onPress={() => setCategory(cat)}
            >
              <Text>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Tanggal Event</Text>

      {Platform.OS === "web" ? (
        <input
          type="date"
          value={formatDate()}
          onChange={(e) => setDate(new Date(e.target.value))}
          className="web-input"
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formatDate()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </>
      )}

      {/* TIME */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Jam Mulai</Text>

          {Platform.OS === "web" ? (
            <input
              type="time"
              value={formatTime(startTime)}
              onChange={(e) =>
                setStartTime(new Date(`1970-01-01T${e.target.value}`))
              }
              className="web-input"
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{formatTime(startTime)}</Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowStartPicker(false);
                    if (selected) setStartTime(selected);
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
              value={formatTime(endTime)}
              onChange={(e) =>
                setEndTime(new Date(`1970-01-01T${e.target.value}`))
              }
              className="web-input"
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{formatTime(endTime)}</Text>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowEndPicker(false);
                    if (selected) setEndTime(selected);
                  }}
                />
              )}
            </>
          )}
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Lokasi"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Deskripsi"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Harga"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Tambah</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={() => router.back()}>
          <Text style={styles.btnOutlineText}>Kembali</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "white" },

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
