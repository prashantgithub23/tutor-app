import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl } from "react-native";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { ClassSession } from "../../lib/types";

export default function TutorScheduleScreen({ navigation }: any) {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadClasses = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("tutor_id", profile.id)
      .order("day_of_week", { ascending: true });
    setClasses(data ?? []);
  }, [profile]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  async function onRefresh() {
    setRefreshing(true);
    await loadClasses();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={<Text style={styles.header}>This week</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("MarkAttendance", { classId: item.id })}
          >
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.time}>
              {item.start_time} – {item.end_time}
              {item.is_adhoc ? " · ad-hoc" : ""}
            </Text>
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable style={styles.addButton} onPress={() => navigation.navigate("AddClass")}>
            <Text style={styles.addButtonText}>+ Add ad-hoc class</Text>
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 18, fontWeight: "500", marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  subject: { fontSize: 15, fontWeight: "500" },
  time: { fontSize: 13, color: "#666", marginTop: 2 },
  addButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addButtonText: { color: "#377" },
});
