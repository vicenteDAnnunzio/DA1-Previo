import { useCallback, useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import type { Equipment, Reading, SyncMode } from '../domain/types';
import { findEquipment, getHistory, saveEquipmentState, saveMaxTemp } from '../data/localDb';
import { simulateCycle, syncReference } from '../data/plantRepository';

export function usePlantViewModel() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('Cargando equipos locales…');
  const [mode, setMode] = useState<SyncMode>('inicial');
  const [humidity, setHumidity] = useState<number | null>(null);
  const [vibration, setVibration] = useState<number | null>(null);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [limitText, setLimitText] = useState('');
  const [limitError, setLimitError] = useState('');
  const [historyOf, setHistoryOf] = useState<Equipment | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);

  const reload = useCallback(async (text: string) => {
    const rows = await findEquipment(text);
    setItems(rows);
  }, []);

  useEffect(() => {
    let alive = true;
    findEquipment('')
      .then((rows) => {
        if (alive) {
          setItems(rows);
          setNotice('Equipos locales listos.');
        }
      })
      .catch((error: unknown) => {
        if (alive) setNotice(`No se pudieron cargar equipos: ${String(error)}`);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    let subscription: { remove(): void } | undefined;
    Accelerometer.isAvailableAsync()
      .then((available) => {
        if (available && active) {
          Accelerometer.setUpdateInterval(1000);
          subscription = Accelerometer.addListener(({ x, y, z }) => {
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            setVibration(Math.round(Math.abs(magnitude - 1) * 100) / 100);
          });
        }
      })
      .catch(() => setVibration(null));
    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  const search = async (text: string) => {
    setFilter(text);
    try {
      await reload(text);
      setNotice('Listado actualizado.');
    } catch (error) {
      setNotice(`Error al filtrar: ${String(error)}`);
    }
  };

  const changeEnabled = async (id: string, enabled: boolean) => {
    setItems((current) => current.map((item) =>
      item.id === id ? { ...item, enabled: enabled ? 1 : 0 } : item
    ));
    try {
      await saveEquipmentState(id, enabled);
      setNotice(`Comando local aplicado a ${id}.`);
    } catch (error) {
      setNotice(`Error al guardar el estado: ${String(error)}`);
    }
  };

  const simulate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const all = await findEquipment('');
      await simulateCycle(all);
      await reload(filter);
      setMode('simulado');
      setNotice('Lecturas simuladas registradas en SQLite.');
    } catch (error) {
      setNotice(`No se pudo simular: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const all = await findEquipment('');
      await simulateCycle(all);
      const result = await syncReference();
      setHumidity(result.humidity);
      setMode('sincronizado');
      setNotice('Referencia ambiental recibida por HTTP y guardada.');
    } catch {
      setMode('simulado');
      setNotice('Sin conexión externa. Se registraron lecturas simuladas.');
    } finally {
      try {
        await reload(filter);
      } catch (error) {
        setNotice(`No se pudo actualizar la vista: ${String(error)}`);
      }
      setLoading(false);
    }
  };

  const openLimit = (item: Equipment) => {
    setEditing(item);
    setLimitText(String(item.maxTemp));
    setLimitError('');
  };

  const closeLimit = () => setEditing(null);

  const saveLimit = async () => {
    if (!editing) return;
    const value = Number(limitText.replace(',', '.'));
    if (limitText.trim() === '' || isNaN(value) || value <= 0 || value > 150) {
      setLimitError('El límite tiene que ser un número mayor a 0 y hasta 150');
      return;
    }
    try {
      await saveMaxTemp(editing.id, value);
      await reload(filter);
      setNotice(`Nuevo límite de ${editing.id}: ${value} °C`);
      setEditing(null);
    } catch (error) {
      setLimitError(`No se pudo guardar: ${String(error)}`);
    }
  };

  const openHistory = async (item: Equipment) => {
    try {
      setHistory(await getHistory(item.id));
      setHistoryOf(item);
    } catch (error) {
      setNotice(`No se pudo cargar el historial: ${String(error)}`);
    }
  };

  const closeHistory = () => setHistoryOf(null);

  return {
    items, filter, loading, notice, mode, humidity, vibration,
    editing, limitText, limitError, historyOf, history,
    search, changeEnabled, simulate, sync,
    openLimit, setLimitText, closeLimit, saveLimit,
    openHistory, closeHistory,
  };
}
