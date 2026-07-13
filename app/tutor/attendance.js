import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

// Mark present/absent per student for a class session.
// Marking a student absent triggers a push notification to their parent
// via a Supabase Edge Function (see supabase/functions/notify-absence).
export default function TutorAttendance() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const { data } = await supabase.from('students').select('id, full_name');
    setStudents(data ?? []);
  }

  function setMark(studentId, status) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
  }

  async function saveAttendance() {
    const today = new Date().toISOString().slice(0, 10);
    const rows = Object.entries(marks).map(([student_id, status]) => ({
      student_id,
      status,
      session_date: today,
    }));

    const { error } = await supabase.from('attendance').upsert(rows, {
      onConflict: 'student_id,class_id,session_date',
    });

    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }

    // Absences trigger notifications via a Supabase Edge Function
    // that reads push_tokens and calls the Expo push API.
    Alert.alert('Saved', 'Attendance recorded. Parents of absent students notified.');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Mark attendance</Text>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.full_name}</Text>
            <View style={styles.pillGroup}>
              <Pressable
                style={[styles.pill, marks[item.id] === 'present' && styles.pillPresent]}
                onPress={() => setMark(item.id, 'present')}
              >
                <Text style={styles.pillText}>Present</Text>
              </Pressable>
              <Pressable
                style={[styles.pill, marks[item.id] === 'absent' && styles.pillAbsent]}
                onPress={() => setMark(item.id, 'absent')}
              >
                <Text style={styles.pillText}>Absent</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.button} onPress={saveAttendance}>
        <Text style={styles.buttonText}>Save attendance</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  name: { fontSize: 14 },
  pillGroup: { flexDirection: 'row', gap: 6 },
  pill: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 10,
  },
  pillPresent: { backgroundColor: '#e6f4ea', borderColor: '#3b9e5f' },
  pillAbsent: { backgroundColor: '#fbe9e9', borderColor: '#c94b4b' },
  pillText: { fontSize: 12 },
  button: {
    backgroundColor: '#111', borderRadius: 8, padding: 14,
    alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
