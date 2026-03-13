import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../../controllers/context/ThemeContext';
import { CreditCard, Calendar, User, CheckCircle } from 'lucide-react';

export const ConfiguracoesAssinatura: React.FC = () => {
  const { themeClasses } = useTheme();

  // Mock data for the subscription
  const subscriptionData = {
    planName: 'Plano Premium',
    status: 'active',
    subscriberName: 'Luã Lima',
    amount: 'R$ 49,90',
    nextBillingDate: '15 de Abril de 2026',
    paymentMethod: 'Cartão de Crédito final 4242',
    since: '10 de Janeiro de 2026'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Assinatura</h2>
        <p className="text-gray-500">Gerencie os detalhes do seu plano e pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card className="md:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-blue-100 mb-1">Plano Atual</p>
              <h3 className="text-3xl font-bold">{subscriptionData.planName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 bg-green-500/20 text-green-100 px-2 py-1 rounded-md text-sm font-medium">
                  <CheckCircle size={14} /> Ativo
                </span>
                <span className="text-blue-100 text-sm">Desde {subscriptionData.since}</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-blue-100 mb-1">Valor da Mensalidade</p>
              <p className="text-3xl font-bold">{subscriptionData.amount}</p>
              <p className="text-blue-100 text-sm mt-1">por mês</p>
            </div>
          </div>
        </Card>

        {/* Details Cards */}
        <Card title="Próxima Cobrança" className="flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Data do Vencimento</p>
              <p className={`text-lg font-bold ${themeClasses.text}`}>{subscriptionData.nextBillingDate}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-auto">Ver Histórico</Button>
        </Card>

        <Card title="Dados do Assinante" className="flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600">
              <User size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Nome na Assinatura</p>
              <p className={`text-lg font-bold ${themeClasses.text}`}>{subscriptionData.subscriberName}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-auto">Editar Dados</Button>
        </Card>

        <Card title="Forma de Pagamento" className="flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Método Atual</p>
              <p className={`text-lg font-bold ${themeClasses.text}`}>{subscriptionData.paymentMethod}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-auto">Alterar Cartão</Button>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <button className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors">
          Cancelar Assinatura
        </button>
      </div>
    </div>
  );
};
