import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Materia } from '../../../models/types';

interface DonutChartProps {
  materias: Materia[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const DonutChart: React.FC<DonutChartProps> = ({ materias }) => {
  const data = materias.map(materia => ({
    name: materia.nome,
    value: (materia.assuntos || []).filter(a => a.concluido).length
  })).filter(item => item.value > 0);

  if (data.length === 0) {
    return <div className="text-center text-gray-500">Nenhum tópico estudado ainda.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
