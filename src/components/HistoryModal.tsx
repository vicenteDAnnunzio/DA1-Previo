import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Equipment, Reading } from '../domain/types';

type Props = {
  equipment: Equipment | null;
  readings: Reading[];
  onClose: () => void;
};

export function HistoryModal({ equipment, readings, onClose }: Props) {
  return (
    <Modal visible={equipment !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.box}>
          <Text style={styles.title}>Historial de {equipment?.id}</Text>
          {readings.length === 0 && <Text style={styles.empty}>Todavía no hay lecturas guardadas para este equipo.</Text>}
          <ScrollView>
            {readings.map((reading) => (
              <View key={reading.id} style={styles.row}>
                <Text style={styles.date}>{new Date(reading.createdAt).toLocaleString('es-AR', { hour12: false })}</Text>
                <Text style={styles.text}>{reading.temperature.toFixed(1)} °C · {reading.source}</Text>
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 18, justifyContent: 'center' },
  box: { backgroundColor: '#FFF', borderRadius: 14, padding: 18, gap: 10, maxHeight: '80%' },
  title: { fontSize: 17, fontWeight: '800', color: '#14233E' },
  empty: { color: '#687990', paddingVertical: 16 },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#DFE7F2' },
  date: { fontSize: 11, color: '#687990' },
  text: { fontSize: 14, fontWeight: '700', color: '#14233E' },
  button: { height: 42, borderRadius: 10, backgroundColor: '#2365C7', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontWeight: '800' },
});
