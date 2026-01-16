import React, { useEffect, useState } from 'react';
import { Vehicle, VehicleStatus, AccidentReport } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, Cpu, Activity, Navigation, FileText, CheckCircle } from 'lucide-react';

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  onAnalyze: (v: Vehicle) => void;
  report: AccidentReport | undefined;
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle, onAnalyze, report }) => {
  if (!vehicle) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border border-slate-800 rounded-lg bg-slate-900/50">
        <Navigation size={48} className="mb-4 opacity-50" />
        <p className="text-lg">Select a vehicle from the map to view real-time telemetry.</p>
      </div>
    );
  }

  const isAccident = vehicle.status === VehicleStatus.ACCIDENT;

  // Format history for charts
  const chartData = vehicle.history.map((h, i) => ({
    time: i,
    speed: Math.round(h.speed),
    gForce: parseFloat(Math.sqrt(h.gForceX**2 + h.gForceY**2).toFixed(2))
  }));

  return (
    <div className="h-full flex flex-col gap-4 bg-slate-900 border border-slate-800 p-4 rounded-lg overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {vehicle.type.toUpperCase()} <span className="text-slate-500 text-sm font-mono">#{vehicle.id}</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <span className={`px-2 py-0.5 rounded text-xs font-bold ${isAccident ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {vehicle.status}
             </span>
             <span className="text-slate-500 text-xs">Driver: {vehicle.driverId}</span>
          </div>
        </div>
        {isAccident && !report?.aiAnalysis && (
          <button 
            onClick={() => onAnalyze(vehicle)}
            disabled={report?.aiLoading}
            className="flex items-center gap-2 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border border-neon-blue/50 px-3 py-1.5 rounded transition-all disabled:opacity-50"
          >
            {report?.aiLoading ? <Cpu className="animate-spin" size={16} /> : <Cpu size={16} />}
            {report?.aiLoading ? 'Analyzing...' : 'AI Analyze'}
          </button>
        )}
      </div>

      {/* Accident Report Panel */}
      {isAccident && report && (
        <div className="bg-slate-950 border border-red-900/50 rounded p-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-2 text-red-400">
             <AlertTriangle size={18} />
             <h3 className="font-bold">Accident Detected</h3>
          </div>
          
          {report.aiAnalysis ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-300">
                {report.aiAnalysis}
              </div>
              <div className="flex justify-end mt-2">
                 <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12}/> Analysis Verified</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic">
              Awaiting AI analysis of telemetry data...
            </p>
          )}
        </div>
      )}

      {/* Telemetry Charts */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
          <h4 className="text-slate-400 text-xs font-bold mb-2 flex items-center gap-2"><Activity size={14}/> SPEED (KM/H)</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 120]} stroke="#475569" fontSize={10} tickFormatter={(v) => `${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  itemStyle={{ color: '#0aff64' }}
                />
                <Line type="monotone" dataKey="speed" stroke="#0aff64" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950/50 p-3 rounded border border-slate-800">
          <h4 className="text-slate-400 text-xs font-bold mb-2 flex items-center gap-2"><Activity size={14}/> G-FORCE IMPACT</h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 10]} stroke="#475569" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                  itemStyle={{ color: '#ff003c' }}
                />
                <ReferenceLine y={4} stroke="red" strokeDasharray="3 3" label={{ value: 'CRITICAL', fill: 'red', fontSize: 10 }} />
                <Line type="monotone" dataKey="gForce" stroke="#ff003c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Raw Data Preview */}
      <div className="mt-auto">
        <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
            <FileText size={12} />
            LIVE PACKET STREAM
        </div>
        <div className="font-mono text-[10px] text-slate-400 bg-black p-2 rounded h-24 overflow-hidden opacity-70">
            {vehicle.history.slice(-5).reverse().map((h, i) => (
                <div key={i} className="mb-1 border-b border-slate-900 pb-1">
                    TS:{h.timestamp} | V:{h.speed.toFixed(1)} | Gx:{h.gForceX.toFixed(2)} | Gy:{h.gForceY.toFixed(2)}
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default VehicleDetails;