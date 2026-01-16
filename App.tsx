import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createMockVehicle, updateVehiclePosition, simulateCrash } from './services/simulationService';
import { analyzeCrashTelemetry } from './services/geminiService';
import { Vehicle, VehicleStatus, AccidentReport, SystemStats } from './types';
import MapVisualization from './components/MapVisualization';
import VehicleDetails from './components/VehicleDetails';
import StatsPanel from './components/StatsPanel';
import { AlertTriangle, PlusCircle, Play, Pause, RefreshCw } from 'lucide-react';

const INITIAL_VEHICLE_COUNT = 12;

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, AccidentReport>>({});
  const [isPaused, setIsPaused] = useState(false);

  // Stats
  const [stats, setStats] = useState<SystemStats>({
    totalVehicles: INITIAL_VEHICLE_COUNT,
    accidentsDetected: 0,
    avgResponseTime: 4.2,
    falsePositivesPrevented: 12
  });

  // Initialization
  useEffect(() => {
    const initialVehicles = Array.from({ length: INITIAL_VEHICLE_COUNT }).map((_, i) => createMockVehicle(i));
    setVehicles(initialVehicles);
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(v => updateVehiclePosition(v, 0.05)); // 0.05 is dt
      });
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handler: Select Vehicle
  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicleId(v.id);
  };

  // Handler: Simulate Crash for a random normal vehicle
  const triggerRandomCrash = () => {
    setVehicles(prev => {
      const normalVehicles = prev.filter(v => v.status === VehicleStatus.NORMAL);
      if (normalVehicles.length === 0) return prev;

      const victimIndex = Math.floor(Math.random() * normalVehicles.length);
      const victimId = normalVehicles[victimIndex].id;

      return prev.map(v => {
        if (v.id === victimId) {
          const crashedV = simulateCrash(v);
          // Auto select crashed vehicle
          setSelectedVehicleId(victimId);
          // Create Report placeholder
          createAccidentReport(crashedV);
          return crashedV;
        }
        return v;
      });
    });
  };

  const createAccidentReport = (vehicle: Vehicle) => {
    const report: AccidentReport = {
      id: `RPT-${Date.now()}`,
      vehicleId: vehicle.id,
      timestamp: Date.now(),
      severity: 'unknown',
      location: { x: vehicle.x, y: vehicle.y },
      aiLoading: false,
      telemetrySnapshot: vehicle.history
    };
    setReports(prev => ({ ...prev, [vehicle.id]: report }));
    setStats(prev => ({ ...prev, accidentsDetected: prev.accidentsDetected + 1 }));
  };

  // Handler: AI Analysis
  const handleAnalyzeCrash = async (vehicle: Vehicle) => {
    if (!process.env.API_KEY) {
      alert("Please set the API_KEY environment variable to use Gemini AI features.");
      return;
    }

    setReports(prev => ({
      ...prev,
      [vehicle.id]: { ...prev[vehicle.id], aiLoading: true }
    }));

    const analysis = await analyzeCrashTelemetry(vehicle.history, vehicle.type);

    setReports(prev => ({
      ...prev,
      [vehicle.id]: {
        ...prev[vehicle.id],
        aiLoading: false,
        aiAnalysis: analysis,
        severity: analysis.toLowerCase().includes('critical') ? 'critical' : 'medium'
      }
    }));
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || null;
  const currentReport = selectedVehicleId ? reports[selectedVehicleId] : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-6 flex flex-col h-screen overflow-hidden">

      {/* Header */}
      <header className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-neon-blue to-purple-500 bg-clip-text text-transparent">
            ConnectGuard AI
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">
            CONNECTED VEHICLE ACCIDENT DETECTION SYSTEM V1.0
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
          <button
            onClick={triggerRandomCrash}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors shadow-lg shadow-red-900/20"
          >
            <AlertTriangle size={18} />
            Simulate Crash
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="shrink-0">
        <StatsPanel stats={{ ...stats, totalVehicles: vehicles.length }} />
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">

        {/* Map Column */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <MapVisualization
              vehicles={vehicles}
              onSelectVehicle={handleSelectVehicle}
              selectedVehicleId={selectedVehicleId}
            />
          </div>

          {/* Legend / Status Bar */}
          <div className="h-12 mt-4 bg-slate-900 border border-slate-800 rounded flex items-center px-4 gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green"></span> Normal
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse"></span> Accident Detected
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-blue"></span> Selected
            </div>
            <div className="ml-auto font-mono text-xs opacity-50">
              SYSTEM STATUS: ONLINE | LATENCY: 24ms
            </div>
          </div>
        </div>

        {/* Details Column */}
        <div className="lg:col-span-1 min-h-0 h-full">
          <VehicleDetails
            vehicle={selectedVehicle}
            onAnalyze={handleAnalyzeCrash}
            report={currentReport}
          />
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-4 pt-4 border-t border-slate-800 text-center text-slate-500 text-xs shrink-0">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
          <p>© {new Date().getFullYear()} ConnectGuard AI • Developed by <span className="text-neon-blue font-semibold text-sm">Pratik Pandey</span></p>
          <div className="flex items-center gap-4">
            <a href="https://pratikdev.tech" target="_blank" rel="noopener noreferrer" className="hover:text-neon-blue transition-colors">pratikdev.tech</a>
            <a href="https://github.com/devilwonder" target="_blank" rel="noopener noreferrer" className="hover:text-neon-blue transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;