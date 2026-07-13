import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { Homework, Message, Student } from "../../lib/types";
import ChildSwitcher from "../../components/ChildSwitcher";

export default function ParentHomeworkScreen() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

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
    if (!selectedChildId || !profile) return;

    // Homework for classes this child is enrolled in
    supabase
      .from("class_students")
      .select("classes(id, tutor_id), homework:homework(*)")
      .eq("student_id", selectedChildId)
      .then(() => {
        // class_students doesn't join homework directly in Supabase's PostgREST syntax;
        // fetch class ids first, then homework for those classes.
      });

    supabase
      .from("class_students")
      .select("class_id")
      .eq("student_id", selectedChildId)
      .then(async ({ data: rosterRows }) => {
        const classIds = (rosterRows ?? []).map((r: any) => r.class_id);
        if (classIds.length === 0) {
          setHomework([]);
          return;
        }
        const { data: hwRows } = await supabase
          .from("homework")
          .select("*")
          .in("class_id", classIds)
          .order("due_date", { ascending: true });
        setHomework(hwRows ?? []);
      });

    // Messages: broadcasts from this child's tutor + messages targeted at this child
    const child = children.find((c) => c.id === selectedChildId);
    if (child) {
      supabase
        .from("messages")
        .select("*")
        .eq("tutor_id", child.tutor_id)
        .or(`student_id.is.null,student_id.eq.${selectedChildId}`)
        .order("created_at", { ascending: false })
        .then(({ data }) => setMessages(data ?? []));
    }
  }, [selectedChildId, profile, children]);

  return (
    <View style={styles.container}>
      <ChildSwitcher
        children={children}
        selectedId={selectedChildId}
        onSelect={setSelectedChildId}
      />

      <Text style={styles.sectionHeader}>Homework</Text>
      <FlatList
        data={homework}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.meta}>Due {item.due_date}</Text>
            <Text style={styles.body}>{item.details}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No homework posted yet.</Text>}
      />

      <Text style={styles.sectionHeader}>Messages</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.meta}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  sectionHeader: { fontSize: 16, fontWeight: "500", marginTop: 16, marginBottom: 8 },
  card: { borderWidth: 1, borderColor: "#eee", borderRadius: 10, padding: 12, marginBottom: 8 },
  meta: { fontSize: 12, color: "#666", marginBottom: 4 },
  body: { fontSize: 14 },
  empty: { fontSize: 13, color: "#999" },
});
