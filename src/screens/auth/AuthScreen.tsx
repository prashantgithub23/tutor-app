import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { supabase } from "../../lib/supabase";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"tutor" | "parent">("parent");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setBusy(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role, full_name: fullName } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert("Couldn't sign in", err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TutorTrack</Text>

      {isSignUp && (
        <>
          <View style={styles.roleRow}>
            <Pressable
              style={[styles.roleButton, role === "parent" && styles.roleButtonActive]}
              onPress={() => setRole("parent")}
            >
              <Text style={role === "parent" ? styles.roleTextActive : styles.roleText}>Parent</Text>
            </Pressable>
            <Pressable
              style={[styles.roleButton, role === "tutor" && styles.roleButtonActive]}
              onPress={() => setRole("tutor")}
            >
              <Text style={role === "tutor" ? styles.roleTextActive : styles.roleText}>Tutor</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={busy}>
        <Text style={styles.submitText}>{isSignUp ? "Create account" : "Log in"}</Text>
      </Pressable>

      <Pressable onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.switchText}>
          {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "500", marginBottom: 32, textAlign: "center" },
  roleRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  roleButtonActive: { borderColor: "#111", backgroundColor: "#111" },
  roleText: { color: "#111" },
  roleTextActive: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  switchText: { textAlign: "center", marginTop: 16, color: "#555" },
});
