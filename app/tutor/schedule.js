import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Tutor's weekly schedule: recurring classes + ad-hoc classes.
export default function TutorSchedule() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('id, subject, day_of_week, start_time, end_time, class_students(student_id)')
      .order('day_of_week');

    if (!error) setClasses(data ?? []);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>This week</Text>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.meta}>
              {item.start_time} - {item.end_time} · {item.class_students.length} students
            </Text>
          </View>
        )}
      />
      <Pressable style={styles.button} onPress={() => router.push('/tutor/attendance')}>
        <Text style={styles.buttonText}>Mark attendance</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  card: {
    borderWidth: 1, borderColor: '#eee', borderRadius: 10,
    padding: 12, marginBottom: 8,
  },
  subject: { fontSize: 15, fontWeight: '500' },
  meta: { fontSize: 13, color: '#666', marginTop: 2 },
  button: {
    backgroundColor: '#111', borderRadius: 8, padding: 14,
    alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
