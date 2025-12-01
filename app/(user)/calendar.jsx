import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../src/contexts/AuthContext";
import createApi from "../../src/services/api";

// ==============================
// Libur Nasional (dummy)
// ==============================
const HOLIDAYS = {
  "2025-01-01": "Tahun Baru Masehi",
  "2025-03-31": "Nyepi",
  "2025-04-18": "Wafat Isa Almasih",
  "2025-04-20": "Idul Fitri",
  "2025-04-21": "Cuti Bersama Idul Fitri",
  "2025-05-01": "Hari Buruh",
  "2025-05-29": "Kenaikan Isa Almasih",
  "2025-06-01": "Hari Lahir Pancasila",
  "2025-08-17": "Hari Kemerdekaan RI",
  "2025-11-01": "Libur Semester Ganjil",
  "2025-12-25": "Natal",
};

// Normalize MySQL date
const normalizeDate = (iso) => (iso ? iso.split("T")[0] : null);

// Format dd-mm-yyyy
const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

export default function UserCalendar() {
  const { token } = useAuth();
  const api = useMemo(() => createApi(token), [token]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [month, setMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

  // Modal Detail Event
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ==============================
  // LOAD EVENT USER — AUTO REFRESH
  // (Setiap layar fokus)
  // ==============================
  const loadMyEvents = async () => {
    try {
      const res = await api.get("/user/events");

      const formatted = res.data.events.map((e) => ({
        ...e,
        start_date: normalizeDate(e.date),
      }));

      setMyEvents(formatted);
    } catch (err) {
      console.log("Error load user events:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (token) loadMyEvents();
    }, [token])
  );

  // ==============================
  // MARKED DATES
  // ==============================
  const marked = {};

  // Event User (biru)
  myEvents.forEach((ev) => {
    const date = ev.start_date;
    if (!date) return;
    if (!marked[date]) marked[date] = { dots: [] };
    marked[date].dots.push({ color: "#007AFF" });

    if (date === selectedDate) {
      marked[date].selected = true;
      marked[date].selectedColor = "#007AFF";
    }
  });

  // Libur nasional (merah)
  Object.keys(HOLIDAYS).forEach((date) => {
    if (!marked[date]) marked[date] = { dots: [] };
    marked[date].dots.push({ color: "#FF3B30" });
  });

  // Hari Minggu REAL TIME (semua tanggal minggu pada bulan ini)
  const dateCursor = new Date(month.year, month.month - 1, 1);

  while (dateCursor.getMonth() === month.month - 1) {
    if (dateCursor.getDay() === 0) {
      const y = dateCursor.getFullYear();
      const m = String(dateCursor.getMonth() + 1).padStart(2, "0");
      const d = String(dateCursor.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;

      if (!marked[key]) marked[key] = {};
      marked[key].customStyles = {
        text: { color: "red", fontWeight: "bold" },
      };
    }
    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  // Filter event yg cocok dgn tanggal dipilih
  const eventsOfDay = selectedDate
    ? myEvents.filter((e) => e.start_date === selectedDate)
    : [];

  const selectedHoliday = selectedDate ? HOLIDAYS[selectedDate] : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        🗓️ Kalender Event Kamu
      </Text>

      <Calendar
        markedDates={marked}
        markingType="multi-dot"
        onDayPress={(day) => setSelectedDate(day.dateString)}
        onMonthChange={(m) => setMonth({ year: m.year, month: m.month })}
        theme={{
          selectedDayBackgroundColor: "#007AFF",
          selectedDayTextColor: "#fff",
          todayTextColor: "#007AFF",
          arrowColor: "#007AFF",
        }}
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          elevation: 3,
          marginBottom: 20,
        }}
      />

      {selectedHoliday && (
        <View
          style={{
            backgroundColor: "#FFEAEA",
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#FFCCCC",
            marginBottom: 15,
          }}
        >
          <Text style={{ color: "#C00", fontWeight: "bold" }}>
            📍 Libur Nasional: {selectedHoliday}
          </Text>
        </View>
      )}

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        {selectedDate ? `Event pada ${formatDate(selectedDate)}` : "Pilih tanggal"}
      </Text>

      {eventsOfDay.length > 0 ? (
        eventsOfDay.map((ev) => (
          <TouchableOpacity
            key={ev.id}
            onPress={() => {
              setSelectedEvent(ev);
              setModalVisible(true);
            }}
            style={{
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#eee",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>{ev.title}</Text>
            <Text>🕒 {ev.start_time} - {ev.end_time}</Text>
            <Text>📍 {ev.location}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={{ textAlign: "center", color: "#777", marginTop: 30 }}>
          Tidak ada event di tanggal ini.
        </Text>
      )}

      {/* ============================== */}
      {/* MODAL DETAIL EVENT */}
      {/* ============================== */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 20,
            }}
          >
            {selectedEvent && (
              <>
                <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                  {selectedEvent.title}
                </Text>

                <Text>📍 {selectedEvent.location}</Text>
                <Text>
                  🕒 {selectedEvent.start_time} - {selectedEvent.end_time}
                </Text>
                <Text style={{ marginTop: 10 }}>{selectedEvent.description}</Text>
              </>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: "#007AFF",
                padding: 12,
                borderRadius: 8,
                marginTop: 20,
              }}
            >
              <Text style={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}>
                Tutup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
