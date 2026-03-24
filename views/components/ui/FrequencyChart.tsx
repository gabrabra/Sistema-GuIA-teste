import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../controllers/context/ThemeContext';

interface FrequencyChartProps {
  disciplinas: any[];
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({ disciplinas }) => {
  const { themeClasses } = useTheme();

  const data = useMemo(() => {
    const studyTimePerDay = new Map<string, number>();
    
    // Initialize last 7 days
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      last7Days.push(dayName);
      studyTimePerDay.set(dayName, 0);
    }

    disciplinas.forEach(d => {
      (d.historico || []).forEach((s: any) => {
        const date = new Date(s.data || new Date());
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        if (studyTimePerDay.has(dayName)) {
          studyTimePerDay.set(dayName, (studyTimePerDay.get(dayName) || 0) + (s.segundos || 0) / 3600);
        }
      });
    });

    return last7Days.map(day => ({
      name: day,
      horas: parseFloat(studyTimePerDay.get(day)!.toFixed(1)),
    }));
  }, [disciplinas]);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={themeClasses.bg === 'bg-gray-950' ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey="name" stroke={themeClasses.bg === 'bg-gray-950' ? '#9ca3af' : '#6b7280'} fontSize={12} />
          <YAxis stroke={themeClasses.bg === 'bg-gray-950' ? '#9ca3af' : '#6b7280'} fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: themeClasses.bg === 'bg-gray-950' ? '#1f2937' : '#fff', borderColor: themeClasses.bg === 'bg-gray-950' ? '#374151' : '#e5e7eb' }}
            itemStyle={{ color: themeClasses.bg === 'bg-gray-950' ? '#f3f4f6' : '#111827' }}
          />
          <Line type="monotone" dataKey="horas" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
