import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // No validation, just redirect
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <GraduationCap size={40} className="text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h2>
          <p className="mt-2 text-gray-600">Entre na sua conta para continuar estudando</p>
        </div>

        <Card className="p-8 shadow-lg border-none">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                  Lembrar de mim
                </label>
              </div>
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" fullWidth className="py-3 text-lg">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Cadastre-se gratuitamente
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};
