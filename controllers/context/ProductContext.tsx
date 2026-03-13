import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    image: 'https://picsum.photos/seed/course1/400/300',
    title: 'Curso Completo de Direito Constitucional',
    description: 'Domine a constituição com este curso abrangente para concursos.',
    link: 'https://exemplo.com/curso-constitucional'
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/course2/400/300',
    title: 'Mentoria para Magistratura',
    description: 'Acompanhamento personalizado para sua aprovação na magistratura.',
    link: 'https://exemplo.com/mentoria'
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/course3/400/300',
    title: 'Pacote de Questões Comentadas',
    description: 'Mais de 5000 questões comentadas por especialistas.',
    link: 'https://exemplo.com/questoes'
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: crypto.randomUUID()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
