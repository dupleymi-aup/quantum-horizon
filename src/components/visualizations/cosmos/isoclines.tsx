import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Info, ChevronRight, ChevronLeft } from 'lucide-react';

interface SaturnRing {
  name: string;
  innerRadius: number;
  outerRadius: number;
  description: string;
  color: string;
  opacity: number;
}

const saturnRings: SaturnRing[] = [
  {
    name: 'Кольцо D',
    innerRadius: 66900,
    outerRadius: 74510,
    description: 'Самое внутреннее и тусклое кольцо Сатурна. Открыто в 1969 году. Содержит мелкие частицы льда и пыли.',
    color: '#4a3728',
    opacity: 0.3,
  },
  {
    name: 'Кольцо C',
    innerRadius: 74658,
    outerRadius: 92000,
    description: 'Также известно как "креповое кольцо". Полупрозрачное, было открыто в 1850 году.',
    color: '#8b7355',
    opacity: 0.4,
  },
  {
    name: 'Кольцо B',
    innerRadius: 92000,
    outerRadius: 117580,
    description: 'Самое яркое и плотное из основных колец. Содержит множество узких колечек и пробелов.',
    color: '#c4a574',
    opacity: 0.7,
  },
  {
    name: 'Деление Кассини',
    innerRadius: 117580,
    outerRadius: 122170,
    description: 'Наиболее заметный пробел в системе колец Сатурна. Открыто Джованни Кассини в 1675 году.',
    color: '#1a1a2e',
    opacity: 0.1,
  },
  {
    name: 'Кольцо A',
    innerRadius: 122170,
    outerRadius: 136775,
    description: 'Второе по яркости кольцо. Содержит деление Энке и множество мелких структур.',
    color: '#d4b896',
    opacity: 0.6,
  },
  {
    name: 'Кольцо F',
    innerRadius: 140180,
    outerRadius: 140240,
    description: 'Узкое кольцо за пределами основного кольца A. Имеет сложную структуру с переплетениями.',
    color: '#e8d5c4',
    opacity: 0.5,
  },
];

interface Particle {
  x: number;
  y: number;
  angle: number;
  speed: number;
  radius: number;
}

export const IsoclinesVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState<'isoclines' | 'trajectories'>('isoclines');
  const [showParticles, setShowParticles] = useState(true);
  const [showField, setShowField] = useState(true);
  const [selectedRing, setSelectedRing] = useState<SaturnRing | null>(null);
  const [scale, setScale] = useState(0.003);
  const [info, setInfo] = useState({
    equation: 'dy/dx = x² + y²',
    description: 'Изоклины — это линии равного наклона',
  });

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    saturnRings.forEach((ring) => {
      const avgRadius = (ring.innerRadius + ring.outerRadius) / 2;
      for (let i = 0; i < 20; i++) {
        const angle = (Math.random() * 2 * Math.PI);
        const radius = ring.innerRadius + Math.random() * (ring.outerRadius - ring.innerRadius);
        particles.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          angle,
          speed: 0.0001 / Math.sqrt(radius),
          radius,
        });
      }
    });
    particlesRef.current = particles;
  }, []);

  // Draw isoclines mode: dy/dx = x² + y²
  const drawIsoclinesMode = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw isoclines (circles of constant slope)
    if (showField) {
      const maxRadius = Math.min(width, height) / 2 * 0.9;
      const numIsoclines = 15;
      
      for (let i = 1; i <= numIsoclines; i++) {
        const radius = (i / numIsoclines) * maxRadius;
        const k = (radius * scale) ** 2; // slope = x² + y² = r²
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `hsla(${i * 24}, 70%, 50%, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw slope markers
        const numMarkers = 24;
        for (let j = 0; j < numMarkers; j++) {
          const angle = (j / numMarkers) * 2 * Math.PI;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Slope at this point is k = r²
          const slopeAngle = Math.atan(k);
          const markerLength = 8;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(slopeAngle);
          ctx.beginPath();
          ctx.moveTo(-markerLength / 2, 0);
          ctx.lineTo(markerLength / 2, 0);
          ctx.strokeStyle = `hsla(${i * 24}, 70%, 50%, 0.6)`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    
    // Draw Saturn rings
    saturnRings.forEach((ring) => {
      const innerR = ring.innerRadius * scale;
      const outerR = ring.outerRadius * scale;
      
      // Create gradient for ring
      const gradient = ctx.createRadialGradient(centerX, centerY, innerR, centerX, centerY, outerR);
      gradient.addColorStop(0, ring.color);
      gradient.addColorStop(1, ring.color);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerR, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerR, 2 * Math.PI, 0, true);
      ctx.fillStyle = ring.color;
      ctx.globalAlpha = ring.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Ring boundary
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerR, 0, 2 * Math.PI);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }, [scale, showField]);

  // Draw trajectories mode: dy/dx = -x/y
  const drawTrajectoriesMode = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw direction field for dy/dx = -x/y
    if (showField) {
      const gridSize = 30;
      const maxLen = 10;
      
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const dx = (x - centerX) * scale;
          const dy = (y - centerY) * scale;
          
          if (Math.abs(dy) < 0.001) continue; // Skip near y=0
          
          const slope = -dx / dy;
          const angle = Math.atan(slope);
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(-maxLen / 2, 0);
          ctx.lineTo(maxLen / 2, 0);
          ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    
    // Draw circular trajectories (orbits)
    const maxRadius = Math.min(width, height) / 2 * 0.9;
    const numOrbits = 20;
    
    for (let i = 1; i <= numOrbits; i++) {
      const radius = (i / numOrbits) * maxRadius;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(100, 200, 255, ${0.2 + i / numOrbits * 0.3})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw Saturn rings on top
    saturnRings.forEach((ring) => {
      const innerR = ring.innerRadius * scale;
      const outerR = ring.outerRadius * scale;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerR, 0, 2 * Math.PI);
      ctx.arc(centerX, centerY, innerR, 2 * Math.PI, 0, true);
      ctx.fillStyle = ring.color;
      ctx.globalAlpha = ring.opacity * 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }, [scale, showField]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, width, height);
      
      // Draw based on mode
      if (mode === 'isoclines') {
        drawIsoclinesMode(ctx, width, height);
      } else {
        drawTrajectoriesMode(ctx, width, height);
      }
      
      // Draw and update particles
      if (showParticles && isPlaying) {
        particlesRef.current.forEach((particle) => {
          // Update particle position
          particle.angle += particle.speed * (isPlaying ? 1 : 0);
          particle.x = Math.cos(particle.angle) * particle.radius;
          particle.y = Math.sin(particle.angle) * particle.radius;
          
          // Draw particle
          const screenX = width / 2 + particle.x * scale;
          const screenY = height / 2 + particle.y * scale;
          
          ctx.beginPath();
          ctx.arc(screenX, screenY, 2, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, showParticles, isPlaying, drawIsoclinesMode, drawTrajectoriesMode, scale]);

  const handleRingClick = (ring: SaturnRing) => {
    setSelectedRing(ring);
  };

  const resetView = () => {
    setScale(0.003);
    setSelectedRing(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-black rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white mb-2">
          🪐 Кольца Сатурна: Метод Изоклин
        </h2>
        <p className="text-slate-300 text-sm">
          Интерактивная визуализация дифференциальных уравнений через призму планетных колец
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Canvas */}
        <div className="flex-1 relative min-h-[400px] lg:min-h-0">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full object-contain"
            style={{ maxHeight: '60vh' }}
          />
          
          {/* Mode selector */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => {
                setMode('isoclines');
                setInfo({
                  equation: 'dy/dx = x² + y²',
                  description: 'Изоклины — окружности постоянного наклона',
                });
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'isoclines'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Изоклины
            </button>
            <button
              onClick={() => {
                setMode('trajectories');
                setInfo({
                  equation: 'dy/dx = -x/y',
                  description: 'Траектории — концентрические орбиты',
                });
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'trajectories'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Траектории
            </button>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              title={isPlaying ? 'Пауза' : 'Старт'}
            >
              {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
            </button>
            <button
              onClick={resetView}
              className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              title="Сбросить вид"
            >
              <RotateCcw size={20} className="text-white" />
            </button>
          </div>

          {/* Toggle options */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showParticles}
                onChange={(e) => setShowParticles(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-slate-300">Частицы</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={showField}
                onChange={(e) => setShowField(e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-slate-300">Поле направлений</span>
            </label>
          </div>
        </div>

        {/* Info panel */}
        <div className="w-full lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-slate-700 bg-slate-900/50 overflow-y-auto">
          {/* Current equation info */}
          <div className="mb-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Текущее уравнение</h3>
            <code className="block px-3 py-2 bg-slate-900 rounded text-blue-400 font-mono text-sm mb-2">
              {info.equation}
            </code>
            <p className="text-slate-300 text-sm">{info.description}</p>
          </div>

          {/* Educational content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">📘 Что такое изоклины?</h3>
            <div className="space-y-3 text-slate-300 text-sm">
              <p>
                <strong className="text-blue-400">Изоклина</strong> (от греческого "iso" — равный, "klino" — наклоняю) — 
                это линия на плоскости, вдоль которой касательные к решениям дифференциального уравнения имеют одинаковый наклон.
              </p>
              <p>
                <strong className="text-purple-400">Метод изоклин</strong> позволяет графически строить решения 
                дифференциальных уравнений первого порядка без их аналитического решения.
              </p>
              <div className="p-3 bg-slate-800 rounded-lg">
                <h4 className="font-medium text-white mb-2">Как работает метод:</h4>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Задаём значение наклона k</li>
                  <li>Находим линию, где dy/dx = k</li>
                  <li>Рисуем штрихи наклона k вдоль этой линии</li>
                  <li>Повторяем для разных k</li>
                  <li>Проводим кривые, касающиеся штрихов</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Rings info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">🌌 Кольца Сатурна</h3>
            <div className="space-y-2">
              {saturnRings.map((ring, index) => (
                <button
                  key={ring.name}
                  onClick={() => handleRingClick(ring)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedRing?.name === ring.name
                      ? 'bg-blue-900/50 border border-blue-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: ring.color, opacity: ring.opacity }}
                    />
                    <span className="text-white font-medium text-sm">{ring.name}</span>
                    {selectedRing?.name === ring.name && (
                      <ChevronRight size={16} className="text-blue-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected ring details */}
          {selectedRing && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-blue-500">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{selectedRing.name}</h4>
                <button
                  onClick={() => setSelectedRing(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-300 text-sm mb-3">{selectedRing.description}</p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>Внутренний радиус: {(selectedRing.innerRadius / 1000).toFixed(1)} тыс. км</p>
                <p>Внешний радиус: {(selectedRing.outerRadius / 1000).toFixed(1)} тыс. км</p>
                <p>Ширина: {((selectedRing.outerRadius - selectedRing.innerRadius) / 1000).toFixed(1)} тыс. км</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IsoclinesVisualization;
