// import { useEffect, useState } from "react";
// import { FlatList, Text, View } from "react-native";

// export default function Participants() {
//   const [participants, setParticipants] = useState([]);

//   useEffect(() => {
//     // Dummy data peserta
//     setParticipants([
//       { id: 1, name: "Ivana Hermili", event: "Workshop React Native" },
//       { id: 2, name: "Budi Santoso", event: "Seminar Teknologi AI" },
//     ]);
//   }, []);

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
//         👥 Daftar Peserta
//       </Text>
//       <FlatList
//         data={participants}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View
//             style={{
//               padding: 15,
//               borderWidth: 1,
//               borderColor: "#ccc",
//               borderRadius: 10,
//               marginBottom: 10,
//             }}
//           >
//             <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
//             <Text>Event: {item.event}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// }
