import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Student } from "../lib/types";

interface Props {
  children: Student[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ChildSwitcher({ children, selectedId, onSelect }: Props) {
  if (children.length <= 1) return null;

  return (
    <View style={styles.switcher}>
      {children.map((child) => (
        <Pressable key={child.id} style={styles.avatarWrap} onPress={() => onSelect(child.id)}>
          <View style={[styles.avatar, child.id === selectedId && styles.avatarActive]}>
            <Text style={styles.avatarInitials}>
              {child.full_name.split(" ").map((n) => n[0]).join("")}
            </Text>
          </View>
          <Text style={styles.avatarLabel}>{child.full_name.split(" ")[0]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", gap: 12, marginBottom: 16 },
  avatarWrap: { alignItems: "center", gap: 4 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  avatarActive: { borderWidth: 2, borderColor: "#377" },
  avatarInitials: { fontWeight: "500", fontSize: 13 },
  avatarLabel: { fontSize: 11, color: "#666" },
});
