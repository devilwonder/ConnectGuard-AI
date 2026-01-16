import React from 'react';
import { Activity, Clock, ShieldCheck, Zap } from 'lucide-react';
import { SystemStats } from '../types';

interface StatsPanelProps {
  stats: SystemStats;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className={`bg-slate-800 border-l-4 ${color} p-4 rounded-r-lg shadow-lg flex items-center justify-between`}>
    <div>
      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-mono text-white font-semibold">{value}</p>
    </div>
    <div className="text-slate-500 opacity-50">{icon}</div>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        icon={<Activity size={24} />} 
        label="Active Vehicles" 
        value={stats.totalVehicles.toString()} 
        color="border-neon-blue" 
      />
      <StatCard 
        icon={<Zap size={24} />} 
        label="Accidents Detected" 
        value={stats.accidentsDetected.toString()} 
        color="border-neon-red" 
      />
      <StatCard 
        icon={<Clock size={24} />} 
        label="Resp. Time Saved" 
        value="15%" 
        color="border-neon-yellow" 
      />
      <StatCard 
        icon={<ShieldCheck size={24} />} 
        label="Accuracy Gain" 
        value="+20%" 
        color="border-neon-green" 
      />
    </div>
  );
};

export default StatsPanel;