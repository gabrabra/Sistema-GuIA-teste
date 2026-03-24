import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Calendar, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../../controllers/context/ThemeContext';

interface CycleFlowProps {
  materias: any[];
}

export const CycleFlow: React.FC<CycleFlowProps> = ({ materias }) => {
  const { themeClasses } = useTheme();

  const stages = useMemo(() => {
    const counts = {
      estudo: { total: 0, dueToday: 0 },
      rev24h: { total: 0, dueToday: 0 },
      rev7d: { total: 0, dueToday: 0 },
      rev30d: { total: 0, dueToday: 0 },
      concluido: { total: 0, dueToday: 0 }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    materias.forEach(m => {
      (m.assuntos || []).forEach((a: any) => {
        if (!a.concluido) {
          counts.estudo.total++;
          counts.estudo.dueToday++; // Teoria sempre pendente
        } else {
          const studyDate = new Date(a.dataEstudo || new Date());
          studyDate.setHours(0, 0, 0, 0);
          const revs = a.revisoesConcluidas || [];

          if (!revs.includes('24h')) {
            counts.rev24h.total++;
            const due = new Date(studyDate);
            due.setDate(due.getDate() + 1);
            if (due <= today) counts.rev24h.dueToday++;
          } else if (!revs.includes('7d')) {
            counts.rev7d.total++;
            const due = new Date(studyDate);
            due.setDate(due.getDate() + 7);
            if (due <= today) counts.rev7d.dueToday++;
          } else if (!revs.includes('30d')) {
            counts.rev30d.total++;
            const due = new Date(studyDate);
            due.setDate(due.getDate() + 30);
            if (due <= today) counts.rev30d.dueToday++;
          } else {
            counts.concluido.total++;
          }
        }
      });
    });

    return [
      {
        id: 'estudo',
        label: 'Estudo Teórico',
        icon: BookOpen,
        color: 'text-blue-500',
        bg: 'bg-blue-100',
        borderColor: 'border-blue-500',
        ...counts.estudo
      },
      {
        id: 'rev24h',
        label: 'Revisão 24h',
        icon: Clock,
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        borderColor: 'border-yellow-500',
        ...counts.rev24h
      },
      {
        id: 'rev7d',
        label: 'Revisão 7d',
        icon: Calendar,
        color: 'text-orange-500',
        bg: 'bg-orange-100',
        borderColor: 'border-orange-500',
        ...counts.rev7d
      },
      {
        id: 'rev30d',
        label: 'Revisão 30d',
        icon: CalendarCheck,
        color: 'text-purple-500',
        bg: 'bg-purple-100',
        borderColor: 'border-purple-500',
        ...counts.rev30d
      },
      {
        id: 'concluido',
        label: 'Ciclo Completo',
        icon: CheckCircle2,
        color: 'text-green-500',
        bg: 'bg-green-100',
        borderColor: 'border-green-500',
        ...counts.concluido
      }
    ];
  }, [materias]);

  const totalTopics = stages.reduce((acc, stage) => acc + stage.total, 0);

  return (
    <div className="py-8 px-4 flex justify-center items-center w-full overflow-hidden">
      <div className="relative w-full max-w-[500px] aspect-square min-h-[400px]">
        
        {/* Circular Track SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-gray-300 dark:text-gray-600" 
            strokeDasharray="2 2" 
          />
          {/* Add directional arrows along the circle */}
          {stages.map((_, i) => {
            // Position arrows halfway between nodes
            const angle = (i * 72) - 90 + 36; // +36 degrees to put it in the middle
            const rad = angle * Math.PI / 180;
            const x = 50 + 35 * Math.cos(rad);
            const y = 50 + 35 * Math.sin(rad);
            // Rotation of the arrow: tangent to the circle
            // Tangent angle = angle + 90
            const rot = angle + 90;
            
            return (
              <g key={`arrow-${i}`} transform={`translate(${x}, ${y}) rotate(${rot})`}>
                <path d="M -2 -2 L 2 0 L -2 2" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-500" />
              </g>
            );
          })}
        </svg>

        {/* Center Content */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-full w-24 h-24 shadow-sm border border-gray-100 dark:border-gray-700 z-0">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalTopics}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tópicos</span>
        </div>

        {/* Nodes */}
        {stages.map((stage, i) => {
          const angle = (i * 72) - 90;
          const rad = angle * Math.PI / 180;
          const x = 50 + 35 * Math.cos(rad);
          const y = 50 + 35 * Math.sin(rad);
          
          const Icon = stage.icon;
          const hasAction = stage.dueToday > 0;
          const isActive = stage.total > 0;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 120 }}
              className="absolute flex flex-col items-center justify-center z-10"
              style={{ 
                left: `${x}%`, 
                top: `${y}%`, 
                transform: 'translate(-50%, -50%)',
                width: '120px'
              }}
            >
              {/* Icon Circle */}
              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${isActive ? stage.borderColor : 'border-gray-200 dark:border-gray-700'} ${isActive ? stage.color : 'text-gray-400'}`}>
                <Icon size={24} />
                
                {/* Pulse effect if action is needed today */}
                {hasAction && (
                  <span className={`absolute -top-1 -right-1 flex h-4 w-4`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stage.bg.replace('100', '400')}`}></span>
                    <span className={`relative inline-flex rounded-full h-4 w-4 ${stage.bg.replace('100', '500')}`}></span>
                  </span>
                )}
              </div>

              {/* Label & Counts */}
              <div className={`mt-2 text-center ${isActive ? '' : 'opacity-50'}`}>
                <h4 className={`text-xs font-bold ${themeClasses.text} leading-tight`}>{stage.label}</h4>
                
                <div className="mt-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {stage.total} no fluxo
                  </span>
                  {stage.dueToday > 0 && stage.id !== 'concluido' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.bg} ${stage.color}`}>
                      {stage.dueToday} pendente
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
