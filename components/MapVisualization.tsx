import React, { useMemo } from 'react';
import { Vehicle, VehicleStatus } from '../types';

interface MapVisualizationProps {
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  selectedVehicleId: string | null;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ vehicles, onSelectVehicle, selectedVehicleId }) => {
  const width = 800;
  const height = 600;

  // Generate background grid/roads once
  const gridLines = useMemo(() => {
    const lines = [];
    // Horizontal highway
    lines.push(
      <rect key="road-h" x="0" y={height/2 - 30} width={width} height={60} fill="#1e293b" />,
      <line key="dash-h" x1="0" y1={height/2} x2={width} y2={height/2} stroke="#475569" strokeWidth="2" strokeDasharray="10,10" />
    );
    // Vertical highway
    lines.push(
      <rect key="road-v" x={width/2 - 30} y="0" width={60} height={height} fill="#1e293b" />,
      <line key="dash-v" x1={width/2} y1="0" x2={width/2} y2={height} stroke="#475569" strokeWidth="2" strokeDasharray="10,10" />
    );
    return lines;
  }, [width, height]);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden border border-slate-700 rounded-lg shadow-2xl">
      <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1 rounded text-xs text-slate-400 font-mono">
        LIVE TRAFFIC FEED • SECTOR 7G
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d">
        <defs>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <g opacity="0.2">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2={height} stroke="#334155" strokeWidth="1" />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 40} x2={width} y2={i * 40} stroke="#334155" strokeWidth="1" />
          ))}
        </g>

        {/* Roads */}
        {gridLines}

        {/* Vehicles */}
        {vehicles.map((v) => {
          const isSelected = v.id === selectedVehicleId;
          const isAccident = v.status === VehicleStatus.ACCIDENT;
          const color = isAccident ? '#ff003c' : isSelected ? '#00f3ff' : '#0aff64';
          
          return (
            <g 
              key={v.id} 
              transform={`translate(${v.x}, ${v.y}) rotate(${v.heading})`}
              onClick={() => onSelectVehicle(v)}
              className="cursor-pointer transition-all duration-300"
              style={{ cursor: 'pointer' }}
            >
               {/* Selection Ring */}
               {isSelected && (
                <circle r="12" fill="none" stroke="#00f3ff" strokeWidth="1" opacity="0.5" className="animate-ping" />
              )}
              
              {/* Accident Pulse */}
              {isAccident && (
                <circle r="20" fill="red" opacity="0.2" className="animate-pulse">
                  <animate attributeName="r" values="10;30;10" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Vehicle Body */}
              <rect x="-6" y="-3" width="12" height="6" fill={color} rx="2" filter={isAccident ? "url(#glow-red)" : ""} />
              
              {/* Headlights */}
              <path d="M 6 -2 L 15 -6 L 15 6 L 6 2 Z" fill="white" opacity="0.3" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default MapVisualization;