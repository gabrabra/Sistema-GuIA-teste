import React, { useMemo } from 'react';
import { motion } from 'motion/react';
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

  return (
    <div className="py-4 px-2">
      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const hasAction = stage.dueToday > 0;
            const isActive = stage.total > 0;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start gap-4"
              >
                {/* Icon Node */}
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-800 transition-colors duration-300 ${isActive ? stage.borderColor : 'border-gray-200 dark:border-gray-700'} ${isActive ? stage.color : 'text-gray-400'}`}>
                  <Icon size={20} />
                  {/* Pulse effect if action is needed today */}
                  {hasAction && (
                    <span className={`absolute -top-1 -right-1 flex h-3 w-3`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stage.bg.replace('100', '400')}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${stage.bg.replace('100', '500')}`}></span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pt-1 ${isActive ? '' : 'opacity-50'}`}>
                  <h4 className={`font-semibold ${themeClasses.text}`}>{stage.label}</h4>
                  
                  <div className="mt-1 flex flex-wrap gap-2 text-sm">
                    {stage.id === 'concluido' ? (
                      <span className="text-gray-500">
                        {stage.total} tópicos finalizados
                      </span>
                    ) : (
                      <>
                        <span className="text-gray-500">
                          {stage.total} no fluxo
                        </span>
                        {stage.dueToday > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stage.bg} ${stage.color}`}>
                            {stage.dueToday} para hoje/atrasado
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
