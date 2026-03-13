import React from 'react';
import { useProducts } from '../../controllers/context/ProductContext';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ExternalLink, ShoppingBag } from 'lucide-react';

export const Produtos: React.FC = () => {
  const { products } = useProducts();
  const { themeClasses } = useTheme();

  return (
    <div className="space-y-6">
      <header>
        <h2 className={`text-2xl font-bold ${themeClasses.text}`}>Produtos e Cursos</h2>
        <p className="text-gray-500">Recursos recomendados para potencializar seus estudos.</p>
      </header>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhum produto disponível</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Novos cursos e materiais serão adicionados em breve. Fique atento!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 overflow-hidden relative group">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/400/300';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${themeClasses.text}`}>
                  {product.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                  {product.description}
                </p>
                <a 
                  href={product.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto"
                >
                  <Button className="w-full flex items-center justify-center gap-2 group">
                    Ver Detalhes
                    <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
