export type ScheduleStatus =
  | 'upcoming'
  | 'due'
  | 'dispensed'
  | 'taken'
  | 'unclaimed_alert'
  | 'missed';

export interface ScheduleItem {
  id: string;
  time: string; // HH:mm format, e.g. "08:00"
  label: string;
  chamberId: number;
  status: ScheduleStatus;
  dispensedAt?: number;
  takenAt?: number;
}

export class ScheduleManager {
  private static instance: ScheduleManager;

  private schedules: ScheduleItem[] = [
    {
      id: 'sch-1',
      time: '08:00',
      label: 'Morning Dose',
      chamberId: 1, // Lisinopril
      status: 'taken',
      dispensedAt: Date.now() - 3600000 * 4,
      takenAt: Date.now() - 3600000 * 4 + 120000,
    },
    {
      id: 'sch-2',
      time: '12:30',
      label: 'Noon Dose',
      chamberId: 2, // Omega-3 Capsule
      status: 'upcoming',
    },
    {
      id: 'sch-3',
      time: '18:00',
      label: 'Dinner Dose',
      chamberId: 3, // Metformin
      status: 'upcoming',
    },
    {
      id: 'sch-4',
      time: '21:30',
      label: 'Bedtime Dose',
      chamberId: 4, // Fragile Melatonin/Sedative
      status: 'upcoming',
    },
  ];

  public static getInstance(): ScheduleManager {
    if (!ScheduleManager.instance) {
      ScheduleManager.instance = new ScheduleManager();
    }
    return ScheduleManager.instance;
  }

  public getSchedules(): ScheduleItem[] {
    return [...this.schedules].sort((a, b) => a.time.localeCompare(b.time));
  }

  public getNextUpcomingDose(): ScheduleItem | null {
    const sorted = this.getSchedules();
    const upcoming = sorted.find((s) => s.status === 'upcoming' || s.status === 'due');
    return upcoming ?? sorted[0] ?? null;
  }

  public markDispensed(id: string): void {
    const item = this.schedules.find((s) => s.id === id);
    if (item) {
      item.status = 'dispensed';
      item.dispensedAt = Date.now();
    }
  }

  public markUnclaimed(id: string): void {
    const item = this.schedules.find((s) => s.id === id);
    if (item) {
      item.status = 'unclaimed_alert';
    }
  }

  public markTaken(id: string): void {
    const item = this.schedules.find((s) => s.id === id);
    if (item) {
      item.status = 'taken';
      item.takenAt = Date.now();
    }
  }

  public addSchedule(time: string, label: string, chamberId: number): ScheduleItem {
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      time,
      label,
      chamberId,
      status: 'upcoming',
    };
    this.schedules.push(newItem);
    return newItem;
  }

  public deleteSchedule(id: string): boolean {
    const idx = this.schedules.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.schedules.splice(idx, 1);
      return true;
    }
    return false;
  }
}
