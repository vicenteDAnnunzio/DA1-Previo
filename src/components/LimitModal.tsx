import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Equipment } from '../domain/types';

type Props = {
  item: Equipment | null;
  value: string;
  error: string;
  onChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function LimitModal({ item, value, error, onChange, onSave, onCancel }: Props) {
  return (
    <Modal visible={item !== null} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>Límite de {item?.id}</Text>
          <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="numeric" />
          {error !== '' && <Text style={styles.error}>{error}</Text>}
          <View style={styles.buttons}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onSave}>
              <Text style={styles.buttonText}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 24, paddingTop: 120 },
  box: { backgroundColor: '#FFF', borderRadius: 14, padding: 18, gap: 12 },
  title: { fontSize: 17, fontWeight: '800', color: '#14233E' },
  input: { borderWidth: 1, borderColor: '#CCD9E9', borderRadius: 10, height: 44, paddingHorizontal: 12, fontSize: 16, color: '#14233E' },
  error: { color: '#C45639', fontWeight: '700' },
  buttons: { flexDirection: 'row', gap: 9 },
  button: { flex: 1, height: 42, borderRadius: 10, backgroundColor: '#2365C7', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontWeight: '800' },
});
