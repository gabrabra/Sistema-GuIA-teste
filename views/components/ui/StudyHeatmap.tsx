import React, { useState } from 'react';
import { useTheme } from '../../../controllers/context/ThemeContext';
import { Disciplina } from '../../../models/types';
import { formatTime } from '../../../models/utils/timeUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StudyHeatmapProps {
  disciplinas: Disciplina[];
}

export const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ disciplinas }) => {
  const { themeClasses } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    seconds: number;
    subjects: string[];
    x: number;
    y: number;
  } | null>(null);

  // 1. Aggregate study data by date (YYYY-MM-DD)
  const studyData: Record<string, { seconds: number; subjects: Set<string> }> = {};

  disciplinas.forEach(disc => {
    if (disc.historico) {
      disc.historico.forEach(session => {
        const dateKey = session.data.split('T')[0];
        if (!studyData[dateKey]) {
            studyData[dateKey] = { seconds: 0, subjects: new Set() };
        }
        studyData[dateKey].seconds += session.segundos;
        // Add subject name or topic
        const label = session.assunto ? `${disc.nome}: ${session.assunto}` : disc.nome;
        studyData[dateKey].subjects.add(label);
      });
    }
  });

  // 2. Navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 3. Generate Month Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  // Array to hold the grid cells
  const calendarCells = [];

  // Empty cells for padding at start
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const data = studyData[dateKey] || { seconds: 0, subjects: new Set() };
    
    calendarCells.push({
      day: d,
      dateKey,
      seconds: data.seconds,
      subjects: Array.from(data.subjects)
    });
  }

  // Color helper
  const getColor = (seconds: number) => {
    if (seconds === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (seconds < 3600) return 'bg-green-200'; // < 1h
    if (seconds < 3600 * 2) return 'bg-green-300';
    if (seconds < 3600 * 3) return 'bg-green-400';
    if (seconds < 3600 * 4) return 'bg-green-500';
    if (seconds < 3600 * 5) return 'bg-green-600';
    return 'bg-green-700'; // > 5h
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className={`p-6 rounded-2xl shadow-sm border ${themeClasses.card} ${themeClasses.borderColor} w-full relative`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Histórico de Atividade</h3>
        
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className={`font-medium w-32 text-center ${themeClasses.text}`}>
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-xs mx-auto relative">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
            <div key={day} className="text-center text-[10px] text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            return (
              <div
                key={cell.dateKey}
                className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-default ${getColor(cell.seconds)} ${cell.seconds > 0 ? 'text-green-900' : 'text-gray-400'}`}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredDay({
                        date: `${cell.day}/${month + 1}/${year}`,
                        seconds: cell.seconds,
                        subjects: cell.subjects,
                        x: rect.left + rect.width / 2,
                        y: rect.top
                    });
                }}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Tooltip */}
      {hoveredDay && (
        <div 
            className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none w-48"
            style={{ 
                left: hoveredDay.x, 
                top: hoveredDay.y - 10,
                transform: 'translate(-50%, -100%)'
            }}
        >
            <div className="font-bold mb-1 border-b border-gray-700 pb-1 flex justify-between">
                <span>{hoveredDay.date}</span>
                <span>{formatTime(hoveredDay.seconds)}</span>
            </div>
            {hoveredDay.subjects.length > 0 ? (
                <ul className="space-y-1">
                    {hoveredDay.subjects.slice(0, 5).map((subj, i) => (
                        <li key={i} className="truncate text-gray-300">• {subj}</li>
                    ))}
                    {hoveredDay.subjects.length > 5 && (
                        <li className="text-gray-500 italic">+ {hoveredDay.subjects.length - 5} outros</li>
                    )}
                </ul>
            ) : (
                <span className="text-gray-500 italic">Sem atividades registradas</span>
            )}
            {/* Triangle */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-6 text-xs text-gray-500 justify-end">
        <span>Menos</span>
        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
        <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
        <span>Mais</span>
      </div>
    </div>
  );
};
