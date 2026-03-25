import React, { useMemo } from 'react';
import { useTheme } from '../../../controllers/context/ThemeContext';
import { Disciplina } from '../../../models/types';
import { Target, CheckCircle, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PriorityGuideProps {
  disciplinas: Disciplina[];
  onStudyClick: (id: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#14b8a6', '#06b6d4'];

export const PriorityGuide: React.FC<PriorityGuideProps> = ({ disciplinas, onStudyClick }) => {
  const { themeClasses } = useTheme();

  const cycleSlots = useMemo(() => {
    const slots: { id: string; nome: string; color: string; subjectIndex: number }[] = [];
    const remaining = disciplinas.map((d, index) => ({
      ...d,
      remaining: Math.max(1, Math.round(d.peso)),
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.remaining - a.remaining);

    const totalSlots = remaining.reduce((sum, d) => sum + d.remaining, 0);
    let lastId: string | null = null;

    for (let i = 0; i < totalSlots; i++) {
      // Pick candidates that are not the last subject
      let candidates = remaining.filter(d => d.remaining > 0 && d.id !== lastId);
      
      if (candidates.length === 0) {
        // If only the last subject remains, pick it
        candidates = remaining.filter(d => d.remaining > 0);
      }

      if (candidates.length > 0) {
        // Pick the one with most remaining weight among candidates
        candidates.sort((a, b) => b.remaining - a.remaining);
        const pick = candidates[0];
        slots.push({
          id: pick.id,
          nome: pick.nome,
          color: pick.color,
          subjectIndex: slots.filter(s => s.id === pick.id).length
        });
        pick.remaining--;
        lastId = pick.id;
      }
    }
    return slots;
  }, [disciplinas]);

  if (disciplinas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma disciplina configurada.
      </div>
    );
  }

  const chartData = useMemo(() => {
    // Track how much time each subject has "consumed" across slots
    const subjectProgress: Record<string, number> = {};
    disciplinas.forEach(d => {
      subjectProgress[d.id] = d.horasEstudadasHoje;
    });

    let foundNext = false;

    return cycleSlots.map((slot) => {
      const progress = subjectProgress[slot.id];
      const isStudied = progress >= 3600; // 1 hour per slot
      
      let isNext = false;
      if (!isStudied && !foundNext) {
        isNext = true;
        foundNext = true;
      }

      // Consume 1 hour from progress for this subject
      subjectProgress[slot.id] = Math.max(0, progress - 3600);

      return {
        ...slot,
        value: 1,
        studied: isStudied,
        isNext: isNext
      };
    });
  }, [cycleSlots, disciplinas]);

  const nextSlot = chartData.find(s => s.isNext);
  const allStudied = !nextSlot;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`font-bold ${themeClasses.text}`}>{data.nome}</p>
          <p className={`text-xs mt-1 font-medium ${data.studied ? 'text-green-500' : 'text-blue-500'}`}>
            {data.studied ? 'Concluído neste ciclo' : data.isNext ? 'Próxima indicação' : 'Pendente'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {allStudied ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <CheckCircle size={48} className="text-green-500 mb-4" />
          <h3 className={`text-lg font-bold text-green-700 dark:text-green-400 mb-2`}>
            Parabéns! Você completou o ciclo de hoje.
          </h3>
          <p className="text-sm text-green-600 dark:text-green-500">
            Todas as disciplinas prioritárias foram estudadas.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                Próxima Indicação
              </p>
              <h3 className={`text-xl font-bold ${themeClasses.text} flex items-center gap-2`}>
                <Target size={20} className="text-blue-500" />
                {nextSlot.nome}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Sessão {nextSlot.subjectIndex + 1} de {disciplinas.find(d => d.id === nextSlot.id)?.peso}
              </p>
            </div>
            <button
              onClick={() => onStudyClick(nextSlot.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              Estudar <ArrowRight size={16} />
            </button>
          </div>

          <h4 className={`text-sm font-bold ${themeClasses.text} mb-2 px-1 text-center`}>Ordem do Ciclo de Estudos</h4>
          <div className="flex-1 min-h-[450px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={150}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  onClick={(data: any) => {
                    if (!data.studied) {
                      onStudyClick(data.id);
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke={entry.isNext ? '#2563eb' : 'transparent'}
                      strokeWidth={entry.isNext ? 4 : 0}
                      className="transition-all duration-300 hover:opacity-80 outline-none"
                      fillOpacity={entry.studied ? 0.2 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  content={(props) => {
                    const { payload } = props;
                    // Unique subjects for legend
                    const uniqueSubjects = disciplinas.map((d, i) => ({
                      name: d.nome,
                      color: COLORS[i % COLORS.length],
                      studied: d.horasEstudadasHoje >= d.peso * 3600
                    }));

                    return (
                      <ul className="flex flex-wrap justify-center gap-3 mt-4">
                        {uniqueSubjects.map((entry: any, index: number) => (
                          <li key={`item-${index}`} className={`flex items-center text-xs text-gray-500 dark:text-gray-400 ${entry.studied ? 'opacity-50' : ''}`}>
                            <span 
                              className="w-3 h-3 rounded-full mr-1.5" 
                              style={{ backgroundColor: entry.color, opacity: entry.studied ? 0.3 : 1 }}
                            />
                            <span className={entry.studied ? 'line-through' : ''}>
                              {entry.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {chartData.filter(d => !d.studied).length}
              </span>
              <span className="block text-[10px] text-gray-500 uppercase tracking-wider">
                Sessões Restantes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
