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

  const sortedDisciplinas = useMemo(() => {
    return [...disciplinas].sort((a, b) => {
      // 1. Studied today? (false comes first)
      const aStudied = a.horasEstudadasHoje > 0;
      const bStudied = b.horasEstudadasHoje > 0;
      if (aStudied !== bStudied) return aStudied ? 1 : -1;

      // 2. Weight (descending)
      const pesoA = Number(a.peso) || 0;
      const pesoB = Number(b.peso) || 0;
      if (pesoB !== pesoA) return pesoB - pesoA;

      // 3. Alphabetical
      return a.nome.localeCompare(b.nome);
    });
  }, [disciplinas]);

  if (disciplinas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma disciplina configurada.
      </div>
    );
  }

  const nextSubject = sortedDisciplinas.find(d => d.horasEstudadasHoje === 0);
  const allStudied = !nextSubject;

  const chartData = sortedDisciplinas.map((disc, index) => {
    const isStudied = disc.horasEstudadasHoje > 0;
    const isNext = disc.id === nextSubject?.id;
    
    // Always assign a color from the palette
    const color = COLORS[index % COLORS.length];

    return {
      id: disc.id,
      name: disc.nome,
      value: disc.peso,
      studied: isStudied,
      isNext: isNext,
      color: color
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`font-bold ${themeClasses.text}`}>{data.name}</p>
          <p className="text-sm text-gray-500">Peso: {data.value}</p>
          <p className={`text-xs mt-1 font-medium ${data.studied ? 'text-green-500' : 'text-blue-500'}`}>
            {data.studied ? 'Estudada hoje' : data.isNext ? 'Próxima indicação' : 'Pendente'}
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
                {nextSubject.nome}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Peso: {nextSubject.peso}
              </p>
            </div>
            <button
              onClick={() => onStudyClick(nextSubject.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              Estudar <ArrowRight size={16} />
            </button>
          </div>

          <h4 className={`text-sm font-bold ${themeClasses.text} mb-2 px-1 text-center`}>Distribuição de Prioridades (Peso)</h4>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  onClick={(data) => {
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
                      strokeWidth={entry.isNext ? 3 : 0}
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
                    return (
                      <ul className="flex flex-wrap justify-center gap-3 mt-4">
                        {payload?.map((entry: any, index: number) => (
                          <li key={`item-${index}`} className={`flex items-center text-xs text-gray-500 dark:text-gray-400 ${chartData[index].studied ? 'opacity-50' : ''}`}>
                            <span 
                              className="w-3 h-3 rounded-full mr-1.5" 
                              style={{ backgroundColor: entry.color, opacity: chartData[index].studied ? 0.3 : 1 }}
                            />
                            <span className={chartData[index].studied ? 'line-through' : ''}>
                              {entry.value}
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
                Pendentes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
