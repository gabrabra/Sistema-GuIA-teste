import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../../controllers/context/ThemeContext';

interface WeeklyCalendarProps {
  materias: any[];
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ materias }) => {
  const { themeClasses } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get start of the week (Sunday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate revisions
  const getRevisionDates = (dateString?: string, completedRevisions: string[] = []) => {
    if (!dateString) return [];
    
    const studyDate = new Date(dateString);
    studyDate.setHours(0, 0, 0, 0);
    
    const rev1 = new Date(studyDate); rev1.setDate(studyDate.getDate() + 1);
    const rev7 = new Date(studyDate); rev7.setDate(studyDate.getDate() + 7);
    const rev30 = new Date(studyDate); rev30.setDate(studyDate.getDate() + 30);

    const revisions = [
      { date: rev1, label: '24h' },
      { date: rev7, label: '7d' },
      { date: rev30, label: '30d' }
    ];

    return revisions.filter(r => !completedRevisions.includes(r.label));
  };

  const allRevisions = useMemo(() => {
    const revs: { date: Date, label: string, assunto: string, materia: string }[] = [];
    materias.forEach(materia => {
      (materia.assuntos || []).forEach((assunto: any) => {
        if (assunto.concluido) {
          const pendingRevs = getRevisionDates(assunto.dataEstudo, assunto.revisoesConcluidas);
          pendingRevs.forEach(r => {
            revs.push({
              date: r.date,
              label: r.label,
              assunto: assunto.nome,
              materia: materia.nome
            });
          });
        }
      });
    });
    return revs;
  }, [materias]);

  const getRevisionsForDate = (date: Date) => {
    return allRevisions.filter(r => 
      r.date.getDate() === date.getDate() &&
      r.date.getMonth() === date.getMonth() &&
      r.date.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-500" />
          <span className={`font-semibold ${themeClasses.text}`}>
            {monthNames[startOfWeek.getMonth()]} {startOfWeek.getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors">Hoje</button>
          <div className="flex border rounded-lg overflow-hidden border-gray-200">
            <button onClick={prevWeek} className="p-1 hover:bg-gray-100 text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={nextWeek} className="p-1 hover:bg-gray-100 text-gray-600 transition-colors border-l border-gray-200"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {weekDays.map((day, i) => {
          const revs = getRevisionsForDate(day);
          const today = isToday(day);
          
          return (
            <div key={i} className={`flex flex-col border rounded-lg overflow-hidden ${today ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className={`text-center py-1 text-xs font-medium border-b ${today ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                {dayNames[day.getDay()]}
                <div className={`text-lg ${today ? 'font-bold' : ''}`}>{day.getDate()}</div>
              </div>
              <div className="flex-1 p-1 overflow-y-auto max-h-[200px] space-y-1">
                {revs.length > 0 ? (
                  revs.map((rev, idx) => (
                    <div key={idx} className="text-[10px] p-1 rounded bg-white border border-gray-200 shadow-sm leading-tight" title={`${rev.materia}: ${rev.assunto} (${rev.label})`}>
                      <div className="font-semibold text-blue-600 truncate">{rev.label}</div>
                      <div className="truncate text-gray-700">{rev.assunto}</div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-300 text-xs">
                    -
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
