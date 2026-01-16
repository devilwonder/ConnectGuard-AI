export enum VehicleStatus {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  ACCIDENT = 'ACCIDENT',
  OFFLINE = 'OFFLINE'
}

export interface TelemetryPoint {
  timestamp: number;
  speed: number;
  gForceX: number;
  gForceY: number;
  brakeForce: number;
}

export interface Vehicle {
  id: string;
  type: 'sedan' | 'truck' | 'suv';
  x: number;
  y: number;
  heading: number;
  speed: number;
  status: VehicleStatus;
  history: TelemetryPoint[];
  driverId: string;
  lastUpdate: number;
}

export interface AccidentReport {
  id: string;
  vehicleId: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'critical' | 'unknown';
  location: { x: number; y: number };
  aiAnalysis?: string;
  aiLoading: boolean;
  telemetrySnapshot: TelemetryPoint[];
}

export interface SystemStats {
  totalVehicles: number;
  accidentsDetected: number;
  avgResponseTime: number; // in seconds
  falsePositivesPrevented: number;
}