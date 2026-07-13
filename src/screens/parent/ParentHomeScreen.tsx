import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { Student, ClassSession } from "../../lib/types";
import ChildSwitcher from "../../components/ChildSwitcher";

export default function ParentHomeScreen() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassSession[]>([]);

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

  const loadSchedule = useCallback(async () => {
    if (!selectedChildId) return;
    const { data } = await supabase
      .from("class_students")
      .select("classes(*)")
      .eq("student_id", selectedChildId);
    setClasses((data ?? []).map((row: any) => row.classes));
  }, [selectedChildId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <View style={styles.container}>
      <ChildSwitcher children={children} selectedId={selectedChildId} onSelect={setSelectedChildId} />

      <Text style={styles.header}>
        {selectedChild ? `${selectedChild.full_name.split(" ")[0]}'s schedule` : "Schedule"}
      </Text>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.time}>
              {item.start_time} – {item.end_time}
              {item.is_adhoc ? " · ad-hoc" : ""}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No classes scheduled.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 18, fontWeight: "500", marginBottom: 12 },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 12, marginBottom: 8 },
  subject: { fontSize: 15, fontWeight: "500" },
  time: { fontSize: 13, color: "#666", marginTop: 2 },
  empty: { fontSize: 13, color: "#999" },
});
