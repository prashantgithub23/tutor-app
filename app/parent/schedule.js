import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';

// Parent portal: switch between children, see that child's schedule and
// any recent absence alerts.
export default function ParentSchedule() {
  const [children, setChildren] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedId) loadAlerts(selectedId);
  }, [selectedId]);

  async function loadChildren() {
    const { data } = await supabase.from('students').select('id, full_name');
    setChildren(data ?? []);
    if (data?.length) setSelectedId(data[0].id);
  }

  async function loadAlerts(studentId) {
    const { data } = await supabase
      .from('attendance')
      .select('session_date, status, classes(subject)')
      .eq('student_id', studentId)
      .eq('status', 'absent')
      .order('session_date', { ascending: false })
      .limit(3);
    setAlerts(data ?? []);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My children</Text>
      <View style={styles.avatarRow}>
        {children.map((child) => (
          <Pressable key={child.id} onPress={() => setSelectedId(child.id)}>
            <View
              style={[
                styles.avatar,
                selectedId === child.id && styles.avatarSelected,
              ]}
            >
              <Text style={styles.avatarText}>
                {child.full_name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {alerts.length > 0 && (
        <FlatList
          data={alerts}
          keyExtractor={(item, i) => `${item.session_date}-${i}`}
          renderItem={({ item }) => (
            <View style={styles.alertCard}>
              <Text style={styles.alertTitle}>Marked absent</Text>
              <Text style={styles.alertMeta}>
                {item.classes?.subject}, {item.session_date}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  heading: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  avatarRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#eee',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarSelected: { borderWidth: 2, borderColor: '#3378dd' },
  avatarText: { fontWeight: '600' },
  alertCard: {
    backgroundColor: '#fbe9e9', borderRadius: 10, padding: 10, marginBottom: 8,
  },
  alertTitle: { fontSize: 13, fontWeight: '600', color: '#a32d2d' },
  alertMeta: { fontSize: 12, color: '#a32d2d', marginTop: 2 },
});
