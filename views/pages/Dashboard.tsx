import React, { useState, useEffect } from 'react';
import { useStudy } from '../../controllers/context/StudyContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { formatTime, formatTimeWithSeconds } from '../../models/utils/timeUtils';
import { Play, Pause, Award, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { StudyHeatmap } from '../components/ui/StudyHeatmap';

export const Dashboard: React.FC = () => {
  const { 
    horasEstudadasHoje, 
    horasSemanaMeta, 
    historicoEstudos, 
    concursoSelecionado, 
    isTimerRunning, 
    iniciarCronometro, 
    pausarCronometro,
    disciplinas
  } = useStudy();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState<{days: number, h: number, m: number, s: number} | null>(null);

  // Daily Goal (Mocked as 3 hours for demo, but could be dynamic)
  const metaDiariaSegundos = 3 * 3600; 
  const progressoDiario = metaDiariaSegundos > 0 ? (horasEstudadasHoje / metaDiariaSegundos) * 100 : 0;

  // Weekly Goal
  const totalEstudadoSemana = historicoEstudos.reduce((acc, curr) => acc + curr.segundos, 0);
  const progressoSemanal = horasSemanaMeta > 0 ? (totalEstudadoSemana / (horasSemanaMeta * 3600)) * 100 : 0;

  // Streak Calculation (Simple check for non-zero days)
  const streakDias = historicoEstudos.filter(d => d.segundos > 0).length;

  useEffect(() => {
    if (!concursoSelecionado?.dataProva) {
      setTimeLeft(null);
      return;
    }
    
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(concursoSelecionado.dataProva!);
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, h, m, s });
      } else {
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [concursoSelecionado]);

  // Transform data for Recharts
  const chartData = historicoEstudos.map(h => ({
    name: h.data,
    horas: parseFloat((h.segundos / 3600).toFixed(1))
  }));

  const handleStartStudy = () => {
    if (!concursoSelecionado) {
      navigate('/planeja');
    } else {
      iniciarCronometro();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Bem-vindo de volta! Vamos bater a meta hoje?</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
           {isTimerRunning ? (
             <Button variant="secondary" onClick={pausarCronometro} className="animate-pulse w-full sm:w-auto">
               <Pause size={18} /> Pausar
             </Button>
           ) : (
             <Button variant="primary" onClick={handleStartStudy} className="w-full sm:w-auto">
               <Play size={18} /> INICIAR ESTUDO
             </Button>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Card Tempo Hoje */}
        <Card title="Tempo Hoje" className="relative">
           {isTimerRunning && (
              <div className="absolute top-6 right-6">
                 <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
           )}
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-2">
            <span className={`text-3xl lg:text-4xl font-bold ${isTimerRunning ? 'text-blue-600 font-mono tracking-tight' : 'text-blue-600'}`}>
              {isTimerRunning ? formatTimeWithSeconds(horasEstudadasHoje) : formatTime(horasEstudadasHoje)}
            </span>
            <span className="text-gray-400 font-medium whitespace-nowrap">/ {formatTime(metaDiariaSegundos)}</span>
          </div>
          <ProgressBar progress={progressoDiario} color={isTimerRunning ? "bg-green-500" : "bg-blue-600"} height="h-3" />
          <p className="text-sm text-gray-500 mt-2 text-right">
             {isTimerRunning ? (
                <span className="block truncate">
                  Estudando: <strong>{disciplinas.find(d => d.id === activeSubjectId)?.nome || '...'}</strong>
                  {activeTopic && ` - ${activeTopic}`}
                </span>
             ) : `${Math.round(progressoDiario)}% da meta diária`}
          </p>
        </Card>

        {/* Card Constancia */}
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl shrink-0">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white/90">Constância</h3>
              <p className="mt-2 font-medium leading-tight">
                Você está há <span className="text-yellow-300 font-bold text-lg">{streakDias} dias</span> sem falhar!
              </p>
              <p className="text-sm text-white/70 mt-1">
                {streakDias === 0 ? "Comece hoje a construir seu hábito!" : `Mantenha o foco!`}
              </p>
            </div>
          </div>
        </Card>

        {/* Card Data Prova */}
        <Card className="md:col-span-2 xl:col-span-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar size={64} />
          </div>
          <h3 className="font-semibold text-gray-700 mb-2">Contagem Regressiva</h3>
          {concursoSelecionado ? (
            concursoSelecionado.dataProva && timeLeft ? (
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-gray-800">{timeLeft.days} dias</div>
                <div className="text-gray-500 font-mono text-lg">
                   {timeLeft.h.toString().padStart(2, '0')}:{timeLeft.m.toString().padStart(2, '0')}:{timeLeft.s.toString().padStart(2, '0')}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Concurso: {concursoSelecionado.orgao ? `${concursoSelecionado.orgao} - ` : ''}{concursoSelecionado.nome}<br/>
                Data da prova não definida.
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-gray-400">
              <span className="block mb-1">Nenhum concurso configurado</span>
              <button onClick={() => navigate('/planeja')} className="text-xs text-blue-500 underline hover:text-blue-700">
                Configurar agora
              </button>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Meta Semanal */}
        <Card title="Desempenho Semanal" className="md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
               <span className="text-2xl font-bold text-gray-800">{formatTime(totalEstudadoSemana)}</span>
               <span className="text-gray-400 ml-2">/ {horasSemanaMeta}h</span>
            </div>
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${progressoSemanal > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {Math.round(progressoSemanal)}% Alcançado
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="horas" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.horas > 0 ? '#3B82F6' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Card Motivacional */}
        <Card className="md:col-span-1 flex flex-col justify-center items-center bg-blue-50 border-blue-100">
          <div className="text-center italic text-gray-700 space-y-2 font-medium">
            <p>"Você não está atrasado."</p>
            <p>"Você está resistindo."</p>
            <p>"Cansar faz parte."</p>
            <p className="text-blue-600 font-bold">"Desistir é opcional."</p>
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <StudyHeatmap disciplinas={disciplinas} />
    </div>
  );
};