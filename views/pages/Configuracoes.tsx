import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme, ThemeColor, ThemeIntensity } from '../../controllers/context/ThemeContext';

export const Configuracoes: React.FC = () => {
  const { currentTheme, setTheme, intensity, setIntensity, themeClasses } = useTheme();

  const themeOptions: { id: ThemeColor; name: string; color: string }[] = [
    { id: 'white', name: 'Branco', color: 'bg-white border-gray-200' },
    { id: 'pastel', name: 'Pastel', color: 'bg-orange-50 border-orange-200' },
    { id: 'blue', name: 'Azul', color: 'bg-blue-50 border-blue-200' },
    { id: 'pink', name: 'Rosa', color: 'bg-pink-50 border-pink-200' },
    { id: 'red', name: 'Vermelho', color: 'bg-red-50 border-red-200' },
    { id: 'green', name: 'Verde', color: 'bg-green-50 border-green-200' },
    { id: 'black', name: 'Escuro', color: 'bg-gray-900 border-gray-700' },
  ];

  const intensityOptions: { id: ThemeIntensity; name: string }[] = [
    { id: 'light', name: 'Claro' },
    { id: 'medium', name: 'Médio' },
    { id: 'dark', name: 'Forte' },
  ];

  const showIntensity = currentTheme !== 'white' && currentTheme !== 'black';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Configurações</h1>
        <p className="text-gray-500 mt-2">Gerencie suas preferências e dados da conta.</p>
      </header>

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Aparência</h2>
          <div className="space-y-6">
            <div>
              <h3 className={`font-medium mb-3 ${themeClasses.text}`}>Tema da Interface</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themeOptions.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                      ${currentTheme === theme.id 
                        ? 'border-blue-600 ring-2 ring-blue-100' 
                        : 'border-transparent hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full border shadow-sm ${theme.color}`}></div>
                    <span className={`text-sm font-medium ${themeClasses.text}`}>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {showIntensity && (
              <div>
                <h3 className={`font-medium mb-3 ${themeClasses.text}`}>Intensidade da Cor</h3>
                <div className="flex gap-3">
                  {intensityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setIntensity(opt.id)}
                      className={`
                        px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium
                        ${intensity === opt.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : `border-gray-200 text-gray-600 hover:bg-gray-50 ${themeClasses.text}`
                        }
                      `}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Perfil</h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Nome Completo</label>
              <input 
                type="text" 
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme === 'black' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="Seu nome"
                defaultValue="Estudante"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Email</label>
              <input 
                type="email" 
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentTheme === 'black' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="seu@email.com"
                defaultValue="estudante@exemplo.com"
              />
            </div>
            <Button>Salvar Alterações</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Preferências de Estudo</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-medium ${themeClasses.text}`}>Notificações de Pomodoro</h3>
                <p className="text-sm text-gray-500">Receber alertas quando o tempo acabar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-100">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Zona de Perigo</h2>
          <p className="text-sm text-gray-500 mb-4">Ações irreversíveis relacionadas à sua conta.</p>
          <Button variant="danger" className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
            Excluir Conta
          </Button>
        </Card>
      </div>
    </div>
  );
};
