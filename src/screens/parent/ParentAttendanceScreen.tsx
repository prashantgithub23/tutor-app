import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { Student, AttendanceRecord } from "../../lib/types";
import ChildSwitcher from "../../components/ChildSwitcher";

export default function ParentAttendanceScreen() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("students")
      .select("*")
      .eq("parent_id", profile.id)
      .then(({ data }) => {
        setChildren(data ?? []);
        if (data && data.length > 0) setSelectedChildId((prev) => prev ?? data[0].id);
      });
  }, [profile]);

  useEffect(() => {
    if (!selectedChildId) return;
    // Last 30 days of attendance for this child
    const since = new Date();
    since.setDate(since.getDate() - 30);
    supabase
      .from("attendance")
      .select("*")
      .eq("student_id", selectedChildId)
      .gte("class_date", since.toISOString().slice(0, 10))
      .order("class_date", { ascending: false })
      .then(({ data }) => setRecords(data ?? []));
  }, [selectedChildId]);

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;

  return (
    <View style={styles.container}>
      <ChildSwitcher children={children} selectedId={selectedChildId} onSelect={setSelectedChildId} />

      <Text style={styles.header}>Last 30 days</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryPresent}>{presentCount} present</Text>
        <Text style={styles.summaryAbsent}>{absentCount} absent</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.date}>{item.class_date}</Text>
            <Text style={item.status === "present" ? styles.present : styles.absent}>
              {item.status === "present" ? "Present" : "Absent"}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No attendance records yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 18, fontWeight: "500", marginBottom: 8 },
  summaryRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  summaryPresent: { fontSize: 13, color: "#1a7a4c" },
  summaryAbsent: { fontSize: 13, color: "#b3261e" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  date: { fontSize: 14 },
  present: { fontSize: 13, color: "#1a7a4c" },
  absent: { fontSize: 13, color: "#b3261e", fontWeight: "500" },
  empty: { fontSize: 13, color: "#999" },
});
