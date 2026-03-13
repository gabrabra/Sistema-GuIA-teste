import React, { useState } from 'react';
import { useProducts, Product } from '../../controllers/context/ProductContext';
import { useTheme } from '../../controllers/context/ThemeContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, Image, Link as LinkIcon, AlertCircle } from 'lucide-react';

export const ConfiguracoesProdutos: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { themeClasses } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setTitle(product.title);
      setDescription(product.description);
      setImage(product.image);
      setLink(product.link);
    } else {
      setEditingProduct(null);
      setTitle('');
      setDescription('');
      setImage('');
      setLink('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    if (!title || !link) {
      alert('Título e Link são obrigatórios.');
      return;
    }

    const productData = {
      title,
      description,
      image: image || 'https://picsum.photos/seed/default/400/300',
      link
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Gerenciar Produtos</h1>
          <p className="text-gray-500 mt-2">Adicione, edite ou remova produtos da vitrine.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" />
          Novo Produto
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Comece adicionando produtos para que seus usuários possam vê-los na vitrine.</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus size={18} className="mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="flex flex-col md:flex-row gap-6 p-6 items-start">
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative group">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/400/300';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className={`text-lg font-bold truncate ${themeClasses.text}`}>{product.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                <a 
                  href={product.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline flex items-center gap-1 mt-2 inline-block"
                >
                  <LinkIcon size={14} />
                  {product.link}
                </a>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center mt-4 md:mt-0">
                <Button variant="outline" onClick={() => handleOpenModal(product)} title="Editar">
                  <Edit2 size={18} />
                </Button>
                <Button variant="danger" onClick={() => handleDelete(product.id)} title="Excluir">
                  <Trash2 size={18} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
      >
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Título do Produto *</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder="Ex: Curso de Direito Penal"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Descrição</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              placeholder="Breve descrição do produto..."
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>URL da Imagem</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Image size={18} />
              </div>
              <input 
                type="text" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Deixe em branco para usar uma imagem aleatória.</p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>Link de Destino *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <LinkIcon size={18} />
              </div>
              <input 
                type="text" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses.bg === 'bg-gray-950' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                placeholder="https://exemplo.com/produto"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Produto
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
