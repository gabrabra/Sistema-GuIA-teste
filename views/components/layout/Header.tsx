import React, { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, AlertCircle, CheckCircle, Clock, Pause, LogOut } from 'lucide-react';
import { useStudy } from '../../../controllers/context/StudyContext';
import { useTheme } from '../../../controllers/context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { formatTimeWithSeconds } from '../../../models/utils/timeUtils';

export const Header: React.FC = () => {
  const { materias, isTimerRunning, currentSessionSeconds, activeSubjectId, activeTopic, disciplinas, pausarCronometro } = useStudy();
  const { themeClasses } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (timerDropdownRef.current && !timerDropdownRef.current.contains(event.target as Node)) {
        setIsTimerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to calculate revision dates (duplicated from Revisoes.tsx for now)
  const getRevisionDates = (dateString?: string, completedRevisions: string[] = []) => {
    if (!dateString) return { status: 'Não iniciado' };
    
    const studyDate = new Date(dateString);
    studyDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const rev1 = new Date(studyDate); rev1.setDate(studyDate.getDate() + 1);
    const rev7 = new Date(studyDate); rev7.setDate(studyDate.getDate() + 7);
    const rev30 = new Date(studyDate); rev30.setDate(studyDate.getDate() + 30);

    const revisions = [
      { date: rev1, label: '24h' },
      { date: rev7, label: '7d' },
      { date: rev30, label: '30d' }
    ];

    const nextRevision = revisions.find(r => !completedRevisions.includes(r.label));
    
    let status = 'Concluído';
    
    if (nextRevision) {
      if (nextRevision.date < today) {
        status = 'Atrasado';
      } else if (nextRevision.date.getTime() === today.getTime()) {
        status = 'Para hoje';
      } else {
        status = 'Em dia';
      }
    }
    
    return { next: nextRevision || null, status };
  };

  // Calculate notifications
  const notifications = materias.flatMap(materia => 
    materia.assuntos.map(assunto => {
      const { next, status } = getRevisionDates(assunto.dataEstudo, assunto.revisoesConcluidas);
      if (status === 'Para hoje' || status === 'Atrasado') {
        return {
          id: assunto.id,
          materia: materia.nome,
          assunto: assunto.nome,
          status,
          nextLabel: next?.label
        };
      }
      return null;
    })
  ).filter((n): n is NonNullable<typeof n> => n !== null);

  const count = notifications.length;

  // Get active subject name
  const activeSubject = disciplinas.find(d => d.id === activeSubjectId)?.nome || 'Estudo Livre';

  return (
    <div className="flex justify-end mb-6 gap-4 relative">
      
      {/* Timer Icon - Only visible when timer is running */}
      {isTimerRunning && (
        <div className="relative" ref={timerDropdownRef}>
          <button
            onClick={() => setIsTimerOpen(!isTimerOpen)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors relative ${themeClasses.text} animate-pulse`}
          >
            <Clock size={24} className="text-blue-600" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </button>

          {isTimerOpen && (
            <div className={`absolute right-0 top-12 w-64 rounded-xl shadow-lg border z-50 overflow-hidden ${themeClasses.cardBg} ${themeClasses.borderColor}`}>
              <div className="p-4">
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Estudando agora</p>
                  <h3 className={`font-bold text-lg ${themeClasses.text} truncate`}>{activeSubject}</h3>
                  {activeTopic && <p className="text-sm text-gray-500 truncate">{activeTopic}</p>}
                </div>
                
                <div className="text-center mb-6">
                  <span className="text-4xl font-mono font-bold text-blue-600">
                    {formatTimeWithSeconds(currentSessionSeconds)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    pausarCronometro();
                    setIsTimerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  <Pause size={18} />
                  Parar Estudo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notification Bell */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors relative ${themeClasses.text}`}
        >
          <Bell size={24} />
          {count > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {count}
            </span>
          )}
        </button>

        {isOpen && (
          <div className={`absolute right-0 top-12 w-80 rounded-xl shadow-lg border z-50 overflow-hidden ${themeClasses.cardBg} ${themeClasses.borderColor}`}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className={`font-semibold ${themeClasses.text}`}>Notificações</h3>
              <span className="text-xs text-gray-500">{count} pendentes</span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <CheckCircle size={32} className="mb-2 text-green-500 opacity-50" />
                  <p>Tudo em dia!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        navigate('/revisoes');
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-1.5 rounded-full ${notif.status === 'Atrasado' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {notif.status === 'Atrasado' ? <AlertCircle size={16} /> : <Calendar size={16} />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${themeClasses.text}`}>{notif.materia}</p>
                          <p className="text-xs text-gray-500 mb-1">{notif.assunto}</p>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded
                            ${notif.status === 'Atrasado' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            {notif.status} • {notif.nextLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                  onClick={() => {
                    navigate('/revisoes');
                    setIsOpen(false);
                  }}
                  className="text-sm text-blue-600 font-medium hover:text-blue-700"
                >
                  Ver todas as revisões
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className={`p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors`}
        title="Sair do sistema"
      >
        <LogOut size={24} />
      </button>
    </div>
  );
};
