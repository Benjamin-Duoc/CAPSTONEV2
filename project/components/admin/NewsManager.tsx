import React, { useState } from 'react';
// Importamos los tipos
import { NewsArticle } from '../../types';
import CiPressModal, { CiPressModalType } from '../common/CiPressModal';

interface NewsManagerProps {
  articles: NewsArticle[];
  onAddArticle: (article: Omit<NewsArticle, 'id'>) => Promise<any> | void;
  onDeleteArticle: (id: number) => void;
}

export const NewsManager: React.FC<NewsManagerProps> = ({ articles, onAddArticle, onDeleteArticle }) => {
  // ESTADO: Formulario para nueva noticia
  // Usamos Partial para que las propiedades sean opcionales inicialmente
  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: '',
    category: 'Tecnología',
    author: '',
    date: new Date().toLocaleDateString('es-CL'),
    imageUrl: '',
    summary: '',
  });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type?: CiPressModalType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showAlert = (title: string, message: string, type: CiPressModalType = 'success') => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      confirmText: 'Entendido',
      onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

  // --- FUNCIONES ---

  const handleDelete = (id: number) => {
    onDeleteArticle(id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Creamos la noticia nueva (sin ID, el padre lo asigna)
    const newArticle: Omit<NewsArticle, 'id'> = {
      title: formData.title || 'Sin Título',
      category: (formData.category as any) || 'Tecnología',
      author: formData.author || 'Redacción',
      date: formData.date || new Date().toLocaleDateString(),
      imageUrl: formData.imageUrl || 'https://via.placeholder.com/400',
      summary: formData.summary || '',
      reportContent: [] // Array vacío por ahora
    };

    try {
      // Llamamos al prop para agregar y esperamos confirmación
      await onAddArticle(newArticle);

      showAlert('Noticia Creada', '¡La noticia ha sido creada correctamente en CiPress!', 'success');

      // Limpiamos el formulario
      setFormData({
        title: '',
        category: 'Tecnología',
        author: '',
        date: new Date().toLocaleDateString('es-CL'),
        imageUrl: '',
        summary: '',
      });
    } catch (error) {
      // Si falla en App.tsx ya se muestra el modal de error y evitamos mostrar alerta falsa de éxito
    }
  };

  // --- VISTA (HTML/JSX) ---
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Panel de Noticias (Benjamín Morales)</h1>

      {/* Formulario */}
      <div className="bg-gray-100 p-6 rounded-lg mb-8 shadow-md">
        <h2 className="text-xl font-bold mb-4">📝 Crear Nueva Noticia</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="text" name="title" placeholder="Título principal" required
            value={formData.title} onChange={handleChange}
            className="p-2 border rounded"
          />

          <div className="flex gap-4">
            <select name="category" value={formData.category} onChange={handleChange} className="p-2 border rounded flex-1">
              <option value="Tecnología">Tecnología</option>
              <option value="Industria">Industria</option>
              <option value="Legislación">Legislación</option>
              <option value="Tendencias">Tendencias</option>
            </select>
            <input
              type="text" name="author" placeholder="Autor"
              value={formData.author} onChange={handleChange}
              className="p-2 border rounded flex-1"
            />
          </div>

          <textarea
            name="summary" placeholder="Bajada o resumen corto..." rows={3} required
            value={formData.summary} onChange={handleChange}
            className="p-2 border rounded"
          />

          <input
            type="text" name="imageUrl" placeholder="URL de la imagen"
            value={formData.imageUrl} onChange={handleChange}
            className="p-2 border rounded"
          />

          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">
            Guardar Noticia
          </button>
        </form>
      </div>

      {/* Lista */}
      <div>
        <h2 className="text-xl font-bold mb-4">Listado Actual ({articles.length})</h2>
        <div className="grid gap-4">
          {articles.map(news => (
            <div key={news.id} className="border p-4 rounded flex justify-between items-center bg-white shadow-sm">
              <div>
                <h3 className="font-bold text-lg">{news.title}</h3>
                <p className="text-sm text-gray-500">{news.category} | {news.author}</p>
              </div>
              <button
                onClick={() => handleDelete(news.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>

      <CiPressModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};