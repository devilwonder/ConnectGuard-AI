import { Vehicle, VehicleStatus, TelemetryPoint } from '../types';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

// Generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const createMockVehicle = (index: number): Vehicle => {
  const isHorizontal = index % 2 === 0;
  return {
    id: generateId(),
    type: Math.random() > 0.8 ? 'truck' : Math.random() > 0.5 ? 'suv' : 'sedan',
    x: isHorizontal ? Math.random() * MAP_WIDTH : MAP_WIDTH / 2 + (Math.random() * 40 - 20),
    y: isHorizontal ? MAP_HEIGHT / 2 + (Math.random() * 40 - 20) : Math.random() * MAP_HEIGHT,
    heading: isHorizontal ? (Math.random() > 0.5 ? 0 : 180) : (Math.random() > 0.5 ? 90 : 270),
    speed: 60 + Math.random() * 40, // 60-100 km/h
    status: VehicleStatus.NORMAL,
    history: [],
    driverId: `DRV-${Math.floor(Math.random() * 1000)}`,
    lastUpdate: Date.now(),
  };
};

export const updateVehiclePosition = (v: Vehicle, dt: number): Vehicle => {
  if (v.status === VehicleStatus.ACCIDENT) return v; // Don't move if crashed

  // Simple movement logic
  const rads = (v.heading * Math.PI) / 180;
  const speedPx = v.speed * 0.5; // Scale speed for map pixels
  let newX = v.x + Math.cos(rads) * speedPx * dt;
  let newY = v.y + Math.sin(rads) * speedPx * dt;

  // Wrap around map
  if (newX > MAP_WIDTH) newX = 0;
  if (newX < 0) newX = MAP_WIDTH;
  if (newY > MAP_HEIGHT) newY = 0;
  if (newY < 0) newY = MAP_HEIGHT;

  // Simulate Telemetry
  const newPoint: TelemetryPoint = {
    timestamp: Date.now(),
    speed: v.speed,
    gForceX: (Math.random() - 0.5) * 0.1, // Normal vibration
    gForceY: (Math.random() - 0.5) * 0.1,
    brakeForce: 0,
  };

  const newHistory = [...v.history, newPoint].slice(-50); // Keep last 50 points

  return {
    ...v,
    x: newX,
    y: newY,
    history: newHistory,
    lastUpdate: Date.now(),
  };
};

export const simulateCrash = (v: Vehicle): Vehicle => {
  const crashPoint: TelemetryPoint = {
    timestamp: Date.now(),
    speed: 0,
    gForceX: (Math.random() * 10) + 5, // High G-force impact
    gForceY: (Math.random() * 10) - 5,
    brakeForce: 1.0,
  };

  return {
    ...v,
    status: VehicleStatus.ACCIDENT,
    speed: 0,
    history: [...v.history, crashPoint].slice(-50),
  };
};