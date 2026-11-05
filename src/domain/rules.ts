import type { Equipment } from './types';

export function isAlarm(item: Equipment) {
  return item.enabled === 1 && item.temperature >= item.maxTemp;
}
