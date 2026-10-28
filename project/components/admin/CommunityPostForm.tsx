import React, { useState, useEffect } from 'react';
import type { CommunityPost } from '../../types';

interface CommunityPostFormProps {
    post: CommunityPost | null;
    onSave: (post: CommunityPost | Omit<CommunityPost, 'id'>) => void;
    onClose: () => void;
}

const initialPostState: Omit<CommunityPost, 'id'> = {
    authorName: '',
    authorAvatarUrl: 'https://i.pravatar.cc/40',
    postTitle: '',
    postUrl: '',
    comment: '',
};

const CommunityPostForm: React.FC<CommunityPostFormProps> = ({ post, onSave, onClose }) => {
    const [formData, setFormData] = useState(initialPostState);

    useEffect(() => {
        if (post) {
            setFormData(post);
        } else {
            setFormData(initialPostState);
        }
    }, [post]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{post ? 'Editar Publicación' : 'Añadir Nueva Publicación'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título del Artículo Compartido</label>
                        <input type="text" name="postTitle" value={formData.postTitle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enlace (URL) del Artículo</label>
                        <input type="url" name="postUrl" value={formData.postUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Comentario</label>
                        <textarea name="comment" value={formData.comment} onChange={handleChange} maxLength={80} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        <p className="text-xs text-gray-500 mt-1">{formData.comment?.length || 0}/80 caracteres</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Autor</label>
                            <input type="text" name="authorName" value={formData.authorName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL del Avatar del Autor</label>
                            <input type="text" name="authorAvatarUrl" value={formData.authorAvatarUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommunityPostForm;