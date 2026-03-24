import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../controllers/context/ThemeContext';

interface FrequencyChartProps {
  materias: any[];
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({ materias }) => {
  const { themeClasses } = useTheme();

  const data = useMemo(() => {
    // Mocking frequency data for the last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
        horas: Math.floor(Math.random() * 5) + 1, // Mock data
      };
    });
    return last7Days;
  }, [materias]);

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
