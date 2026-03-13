import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/produtos')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((p: any) => ({
          id: p.id,
          title: p.name,
          description: p.description,
          image: p.image,
          link: p.url
        }));
        setProducts(mapped);
      })
      .catch(err => console.error('Failed to fetch products', err));
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct = {
      id: crypto.randomUUID(),
      ...product
    };
    
    try {
      await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newProduct.id,
          name: newProduct.title,
          description: newProduct.description,
          image: newProduct.image,
          url: newProduct.link,
          type: 'course',
          price: 0,
          features: []
        })
      });
      setProducts(prev => [...prev, newProduct]);
    } catch (err) {
      console.error('Failed to add product', err);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const existing = products.find(p => p.id === id);
      if (!existing) return;
      const merged = { ...existing, ...updates };

      await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: merged.title,
          description: merged.description,
          image: merged.image,
          url: merged.link,
          type: 'course',
          price: 0,
          features: []
        })
      });
      setProducts(prev => prev.map(p => p.id === id ? merged : p));
    } catch (err) {
      console.error('Failed to update product', err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
    }
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
