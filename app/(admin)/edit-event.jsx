// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// import Toast from "react-native-toast-message";
// import { useAuth } from "../../src/contexts/AuthContext";
// import createApi from "../../src/services/api";

// export default function EditEvent() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();
//   const { token } = useAuth();
//   const api = createApi(token);

//   const [eventData, setEventData] = useState(null);
//   const [loadError, setLoadError] = useState(false);

//   const loadEvent = async () => {
//     if (!id) {
//       setLoadError(true);
//       return;
//     }

//     try {
//       const res = await api.get(`/events/${id}`);
//       setEventData(res.data.event);
//     } catch (err) {
//       setLoadError(true);
//     }
//   };

//   useEffect(() => {
//     loadEvent();
//   }, [id]);

//   // ===========================
//   // IF EVENT TIDAK ADA
//   // ===========================
//   if (loadError) {
//     return (
//       <View style={styles.container}>
//         <Text style={{ fontSize: 18, marginBottom: 20 }}>❌ Event tidak ditemukan</Text>

//         <TouchableOpacity
//           style={styles.btn}
//           onPress={() => router.replace("/(admin)")}
//         >
//           <Text style={styles.btnText}>Kembali ke Dashboard</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   if (!eventData) return null;

//   const handleSave = async () => {
//     try {
//       await api.put(`/events/${id}`, eventData);
//       Toast.show({ type: "success", text1: "Event diperbarui" });
//       setTimeout(() => router.replace("/(admin)"), 1200);
//     } catch (err) {
//       Toast.show({ type: "error", text1: "Gagal update", text2: err.message });
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>✏️ Edit Event</Text>

//       <TextInput
//         style={styles.input}
//         value={eventData.title}
//         onChangeText={(v) => setEventData({ ...eventData, title: v })}
//       />

//       <TextInput
//         style={styles.input}
//         value={eventData.date}
//         onChangeText={(v) => setEventData({ ...eventData, date: v })}
//       />

//       <TextInput
//         style={styles.input}
//         value={eventData.start_time}
//         placeholder="Jam Mulai (HH:MM)"
//         onChangeText={(v) => setEventData({ ...eventData, start_time: v })}
//       />

//       <TextInput
//         style={styles.input}
//         value={eventData.end_time}
//         placeholder="Jam Selesai (HH:MM)"
//         onChangeText={(v) => setEventData({ ...eventData, end_time: v })}
//       />

//       <TextInput
//         style={styles.input}
//         value={eventData.location}
//         onChangeText={(v) => setEventData({ ...eventData, location: v })}
//       />

//       <TextInput
//         style={styles.input}
//         value={eventData.description}
//         onChangeText={(v) => setEventData({ ...eventData, description: v })}
//       />

//       <TextInput
//         style={styles.input}
//         value={String(eventData.price)}
//         onChangeText={(v) => setEventData({ ...eventData, price: Number(v) })}
//         keyboardType="numeric"
//       />

//       <TouchableOpacity style={styles.btn} onPress={handleSave}>
//         <Text style={styles.btnText}>Simpan</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.back()}>
//         <Text style={styles.backText}>Kembali</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", flex: 1 },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   btn: {
//     backgroundColor: "#ffaa00",
//     padding: 12,
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
//   backText: { marginTop: 12, textAlign: "center", color: "#007AFF" },
// });
