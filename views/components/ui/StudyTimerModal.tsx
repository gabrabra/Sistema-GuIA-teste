import React from 'react';
import { useStudy } from '../../../controllers/context/StudyContext';
import { useTheme } from '../../../controllers/context/ThemeContext';
import { Button } from './Button';
import { Play, CheckCircle, XCircle } from 'lucide-react';

export const StudyTimerModal: React.FC = () => {
  const { 
    isPauseModalOpen, 
    setIsPauseModalOpen, 
    isFinishModalOpen, 
    setIsFinishModalOpen,
    iniciarCronometro,
    salvarSessaoEstudo,
    activeSubjectId,
    activeTopic
  } = useStudy();
  
  const { themeClasses } = useTheme();

  if (!isPauseModalOpen && !isFinishModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`${themeClasses.cardBg} ${themeClasses.text} rounded-2xl p-6 max-w-md w-full shadow-2xl border ${themeClasses.borderColor} animate-fadeIn`}>
        
        {isPauseModalOpen && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Estudo Pausado</h2>
              <p className="text-gray-500">O que você deseja fazer agora?</p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full flex justify-center items-center gap-2 py-3" 
                onClick={() => {
                  setIsPauseModalOpen(false);
                  iniciarCronometro();
                }}
              >
                <Play size={20} />
                Continuar Estudando
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex justify-center items-center gap-2 py-3"
                onClick={() => {
                  setIsPauseModalOpen(false);
                  if (activeTopic) {
                    setIsFinishModalOpen(true);
                  } else {
                    salvarSessaoEstudo(false);
                  }
                }}
              >
                <CheckCircle size={20} />
                Finalizar Estudo
              </Button>
            </div>
          </div>
        )}

        {isFinishModalOpen && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Finalizar Tópico</h2>
              <p className="text-gray-500">Você concluiu o estudo do tópico <strong>{activeTopic || 'Estudo Livre'}</strong>?</p>
              <p className="text-sm text-gray-400 mt-2">Ao marcar como concluído, ele entrará no seu ciclo de revisões.</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 flex justify-center items-center gap-2"
                onClick={() => {
                  salvarSessaoEstudo(false);
                }}
              >
                <XCircle size={20} />
                Ainda não
              </Button>
              
              <Button 
                className="flex-1 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-transparent"
                onClick={() => {
                  salvarSessaoEstudo(true);
                }}
              >
                <CheckCircle size={20} />
                Sim, concluí
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
