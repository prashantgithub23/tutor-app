import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";
import { Student, AttendanceStatus } from "../../lib/types";

// Marking a student absent inserts an attendance row, then calls a Supabase
// Edge Function ("notify-absence") which looks up the parent's push token
// and sends the Expo push notification server-side. See supabase/functions/.

export default function TutorAttendanceScreen({ route }: any) {
  const { classId } = route.params;
  const today = new Date().toISOString().slice(0, 10);

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    supabase
      .from("class_students")
      .select("student_id, students(*)")
      .eq("class_id", classId)
      .then(({ data }) => {
        const list = (data ?? []).map((row: any) => row.students);
        setStudents(list);
      });
  }, [classId]);

  function setMark(studentId: string, status: AttendanceStatus) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  }

  async function saveAttendance() {
    const rows = Object.entries(marks).map(([student_id, status]) => ({
      class_id: classId,
      student_id,
      class_date: today,
      status,
    }));

    if (rows.length === 0) {
      Alert.alert("Mark at least one student first");
      return;
    }

    const { error } = await supabase.from("attendance").upsert(rows, {
      onConflict: "class_id,student_id,class_date",
    });

    if (error) {
      Alert.alert("Couldn't save attendance", error.message);
      return;
    }

    // Trigger the notify-absence edge function for anyone marked absent
    const absentIds = rows.filter((r) => r.status === "absent").map((r) => r.student_id);
    if (absentIds.length > 0) {
      await supabase.functions.invoke("notify-absence", {
        body: { studentIds: absentIds, classDate: today, classId },
      });
    }

    Alert.alert("Attendance saved");
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.full_name}</Text>
            <View style={styles.buttons}>
              <Pressable
                style={[styles.pill, marks[item.id] === "present" && styles.pillPresent]}
                onPress={() => setMark(item.id, "present")}
              >
                <Text style={marks[item.id] === "present" ? styles.pillTextActive : styles.pillText}>
                  Present
                </Text>
              </Pressable>
              <Pressable
                style={[styles.pill, marks[item.id] === "absent" && styles.pillAbsent]}
                onPress={() => setMark(item.id, "absent")}
              >
                <Text style={marks[item.id] === "absent" ? styles.pillTextActive : styles.pillText}>
                  Absent
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.saveButton} onPress={saveAttendance}>
        <Text style={styles.saveButtonText}>Save attendance</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: { fontSize: 14 },
  buttons: { flexDirection: "row", gap: 6 },
  pill: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  pillPresent: { backgroundColor: "#e7f5e7", borderColor: "#8cc98c" },
  pillAbsent: { backgroundColor: "#fbe7e7", borderColor: "#e39a9a" },
  pillText: { fontSize: 12, color: "#888" },
  pillTextActive: { fontSize: 12, fontWeight: "500" },
  saveButton: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 16 },
  saveButtonText: { color: "#fff", fontWeight: "500" },
});
