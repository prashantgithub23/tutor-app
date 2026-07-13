import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

// On launch: check session, then route to tutor or parent portal based on role.
export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.replace('/auth/login');
      return;
    }

    const { data: tutor } = await supabase
      .from('tutors')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();

    if (tutor) {
      router.replace('/tutor/schedule');
    } else {
      router.replace('/parent/schedule');
    }
    setChecking(false);
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {checking && <ActivityIndicator />}
    </View>
  );
}
