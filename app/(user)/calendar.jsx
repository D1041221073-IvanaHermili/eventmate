import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/contexts/ThemeContext";
import createApi from "../../src/services/api";

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

/* 🔥 FIX: SAFE PARSER — tidak pakai new Date() */
const extractDate = (val) => {
  if (!val) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val; // kalau sudah format YYYY-MM-DD
  
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
};


/* 🔥 FIX: Format tanggal tanpa Date() */
const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

export default function UserCalendar() {
  const { token } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const api = useMemo(() => createApi(token), [token]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [month, setMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadMyEvents = async () => {
    try {
      const res = await api.get("/user/events");

      const formatted = res.data.events.map((e) => ({
        ...e,
        start_date: extractDate(e.date), // 🔥 fix timezone
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

  /* ============================
      MARKED DATES
     ============================ */
  const marked = {};

  myEvents.forEach((ev) => {
    const date = ev.start_date;
    if (!date) return;

    if (!marked[date]) marked[date] = { dots: [] };
    marked[date].dots.push({ color: theme.primary });

    if (date === selectedDate) {
      marked[date].selected = true;
      marked[date].selectedColor = theme.primary;
    }
  });

  Object.keys(HOLIDAYS).forEach((date) => {
    if (!marked[date]) marked[date] = { dots: [] };
    marked[date].dots.push({ color: theme.error });
  });

  /* ============================
      SUNDAY STYLING
     ============================ */
  const dateCursor = new Date(month.year, month.month - 1, 1);

  while (dateCursor.getMonth() === month.month - 1) {
    if (dateCursor.getDay() === 0) {
      const y = dateCursor.getFullYear();
      const m = String(dateCursor.getMonth() + 1).padStart(2, "0");
      const d = String(dateCursor.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;

      if (!marked[key]) marked[key] = {};
      marked[key].customStyles = {
        text: { color: theme.error, fontWeight: "bold" },
      };
    }
    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  const eventsOfDay = selectedDate
    ? myEvents.filter((e) => e.start_date === selectedDate)
    : [];

  const selectedHoliday = selectedDate ? HOLIDAYS[selectedDate] : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style ={{
        flexDirection: "row",
        justifyContent:"space-between",
        alignItems: "center",
        marginBottom: 10
      }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 10,
          color: theme.text,
        }}
      >
        🗓️ Kalender Event Kamu
      </Text>

        <TouchableOpacity 
          onPress={toggleTheme}
          style={{
            padding: 10,
            backgroundColor: theme.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.border,
            elevation: 2,
          }}
        >
          <MaterialIcons
            name={isDark ? "light-mode" : "dark-mode"}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      <Calendar
        markedDates={marked}
        markingType="multi-dot"
        onDayPress={(day) => setSelectedDate(day.dateString)} // aman
        onMonthChange={(m) => setMonth({ year: m.year, month: m.month })}
        theme={{
          calendarBackground: theme.card,
          textSectionTitleColor: theme.textSecondary,
          selectedDayBackgroundColor: theme.primary,
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: theme.primary,
          dayTextColor: theme.text,
          textDisabledColor: theme.textTertiary,
          arrowColor: theme.primary,
          monthTextColor: theme.text,
          textDayFontWeight: "400",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 14,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
        }}
        style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          elevation: 3,
          marginBottom: 20,
        }}
      />

      {selectedHoliday && (
        <View
          style={{
            backgroundColor: theme.errorLight,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.error,
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              color: theme.error,
              fontWeight: "bold",
              fontSize: 15,
            }}
          >
            📍 Libur Nasional: {selectedHoliday}
          </Text>
        </View>
      )}

      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          color: theme.text,
        }}
      >
        {selectedDate
          ? `Event pada ${formatDate(selectedDate)}`
          : "Pilih tanggal"}
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
              backgroundColor: theme.card,
              padding: 15,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              marginBottom: 10,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: theme.text,
                marginBottom: 6,
              }}
            >
              {ev.title}
            </Text>

            <View
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text style={{ marginLeft: 6, color: theme.textSecondary }}>
                {ev.start_time} - {ev.end_time}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text style={{ marginLeft: 6, color: theme.textSecondary }}>
                {ev.location}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Ionicons
            name="calendar-outline"
            size={60}
            color={theme.textTertiary}
          />
          <Text
            style={{
              textAlign: "center",
              color: theme.textSecondary,
              marginTop: 16,
              fontSize: 15,
            }}
          >
            Tidak ada event di tanggal ini.
          </Text>
        </View>
      )}

      {/* MODAL */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 20,
              elevation: 10,
            }}
          >
            {selectedEvent && (
              <>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 10,
                    color: theme.text,
                  }}
                >
                  {selectedEvent.title}
                </Text>

                <View
                  style={{
                    backgroundColor: theme.borderLight,
                    height: 1,
                    marginBottom: 12,
                  }}
                />

                <View style={{ gap: 8, marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="location" size={18} color={theme.primary} />
                    <Text style={{ marginLeft: 8, color: theme.text }}>
                      {selectedEvent.location}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="time" size={18} color={theme.primary} />
                    <Text style={{ marginLeft: 8, color: theme.text }}>
                      {selectedEvent.start_time} - {selectedEvent.end_time}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: theme.textSecondary, lineHeight: 22 }}>
                  {selectedEvent.description}
                </Text>
              </>
            )}

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                backgroundColor: theme.primary,
                padding: 12,
                borderRadius: 12,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                Tutup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}