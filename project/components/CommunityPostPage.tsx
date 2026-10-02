import React, { useEffect, useState } from 'react';
import type { Page, CommunityPost, User } from '../types';
import { ArrowUpRightIcon } from './icons';

interface CommunityPostPageProps {
    posts: CommunityPost[];
    onAddPost: (post: Omit<CommunityPost, 'id' | 'authorName' | 'authorAvatarUrl' | 'createdBy'>) => void;
    onUpdatePost: (post: CommunityPost) => void | Promise<void>;
    onDeletePost: (postId: number) => void | Promise<void>;
    onNavigate: (page: Page) => void;
    currentUser: User | null;
    onBack: () => void;
}

const CommunityPostCard: React.FC<{
    post: CommunityPost;
    isOwner: boolean;
    onEdit: (post: CommunityPost) => void;
    onDelete: (postId: number) => void;
}> = ({ post, isOwner, onEdit, onDelete }) => (
    <div className="bg-surface p-4 rounded-lg border border-gray-200 relative overflow-hidden">
        {isOwner && (
            <div className="absolute top-2 right-2 z-10 flex space-x-2">
                <button
                    onClick={() => onEdit(post)}
                    className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-primary hover:text-orange-600 transition-colors"
                    title="Editar publicación"
                    aria-label="Editar publicación"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button
                    onClick={() => onDelete(post.id)}
                    className="bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-red-600 hover:text-red-800 transition-colors"
                    title="Eliminar publicación"
                    aria-label="Eliminar publicación"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        )}
        <div className="flex items-start space-x-3">
            <img src={post.authorAvatarUrl} alt={post.authorName} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
                <p className="font-semibold text-text-primary text-sm">{post.authorName}</p>
                <p className="text-sm text-text-secondary italic">"{post.comment}"</p>
            </div>
        </div>
        <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="mt-3 group flex items-center justify-between bg-background p-3 rounded-md hover:bg-gray-200 transition-colors">
            <span className="font-semibold text-sm text-primary group-hover:underline pr-2">{post.postTitle}</span>
            <ArrowUpRightIcon className="h-5 w-5 text-primary flex-shrink-0" />
        </a>
    </div>
);

const CommunityPostPage: React.FC<CommunityPostPageProps> = ({ posts, onAddPost, onUpdatePost, onDeletePost, onNavigate, currentUser, onBack }) => {
    const [postTitle, setPostTitle] = useState('');
    const [postUrl, setPostUrl] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
    const [editPostTitle, setEditPostTitle] = useState('');
    const [editPostUrl, setEditPostUrl] = useState('');
    const [editComment, setEditComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const ITEMS_PER_PAGE = 12;

    const isPostOwner = (post: CommunityPost) => {
        if (!currentUser) return false;
        if (post.createdBy) {
            return post.createdBy === currentUser.email;
        }

        const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();
        return post.authorName === fullName;
    };

    // Sort posts by createdAt (descending) or id if createdAt is missing
    const sortedPosts = [...posts].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

        if (dateA !== dateB) {
            return dateB - dateA;
        }
        return b.id - a.id;
    });

    const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

    // Get current posts
    const indexOfLastPost = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstPost = indexOfLastPost - ITEMS_PER_PAGE;
    const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(Math.max(totalPages, 1));
        }
    }, [currentPage, totalPages]);

    // Change page
    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postTitle.trim() || !postUrl.trim() || !comment.trim()) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalUrl = postUrl.trim();
            if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }
            await onAddPost({ postTitle, postUrl: finalUrl, comment });
            setPostTitle('');
            setPostUrl('');
            setComment('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (post: CommunityPost) => {
        setEditingPost(post);
        setEditPostTitle(post.postTitle);
        setEditPostUrl(post.postUrl);
        setEditComment(post.comment);
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
        setEditPostTitle('');
        setEditPostUrl('');
        setEditComment('');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPost) return;
        if (!editPostTitle.trim() || !editPostUrl.trim() || !editComment.trim()) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        setIsUpdating(true);
        try {
            let finalUrl = editPostUrl.trim();
            if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
                finalUrl = 'https://' + finalUrl;
            }
            await onUpdatePost({
                ...editingPost,
                postTitle: editPostTitle,
                postUrl: finalUrl,
                comment: editComment,
            });
            handleCancelEdit();
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (editingPost?.id === postId) {
            handleCancelEdit();
        }
        await onDeletePost(postId);
    };

    return (
        <div className="bg-background min-h-screen py-12 animate-fade-in">
            <div className="container mx-auto px-4 max-w-4xl">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-primary font-bold mb-6 hover:translate-x-[-4px] transition-transform group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-extrabold font-serif text-text-primary">Actividad de la Comunidad</h1>
                    <p className="mt-4 text-lg text-text-secondary max-w-3xl mx-auto">Comparte artículos, inicia debates y conecta con otros periodistas innovadores.</p>
                </div>

                <div className="max-w-3xl mx-auto bg-surface p-8 rounded-lg shadow-lg border border-gray-200 mb-12">
                    <h2 className="text-2xl font-bold font-serif text-secondary mb-6">Compartir un nuevo artículo</h2>

                    {!currentUser ? (
                        <div className="text-center py-8">
                            <p className="text-lg text-text-secondary mb-4">Debes iniciar sesión para compartir artículos.</p>
                            <button
                                onClick={() => onNavigate('login')}
                                className="px-6 py-2 text-base font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors shadow-md"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700">Título del Artículo</label>
                                <input
                                    type="text"
                                    id="postTitle"
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                    placeholder="Ej: The Guardian lanza nueva experiencia digital pagada"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="postUrl" className="block text-sm font-medium text-gray-700">Enlace (URL)</label>
                                <input
                                    type="text"
                                    id="postUrl"
                                    value={postUrl}
                                    onChange={(e) => setPostUrl(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                    placeholder="https://www.ejemplo.com/articulo"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="relative">
                                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Tu Comentario o Resumen</label>
                                <textarea
                                    id="comment"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary resize-none"
                                    placeholder="¿Por qué es interesante este artículo? ¿Qué debate abre?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={80}
                                    required
                                    disabled={isSubmitting}
                                />
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                    {comment.length}/80 caracteres
                                </div>
                            </div>
                            <div className="text-right">
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-base font-bold text-white bg-primary rounded-md hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {editingPost && (
                    <div className="max-w-3xl mx-auto bg-surface p-6 rounded-lg shadow-md border border-gray-200 mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-text-primary">Editando publicación</h3>
                            <button onClick={handleCancelEdit} className="text-sm text-text-secondary hover:underline">Cancelar</button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label htmlFor="editPostTitle" className="block text-sm font-medium text-gray-700">Título del Artículo</label>
                                <input
                                    id="editPostTitle"
                                    type="text"
                                    value={editPostTitle}
                                    onChange={(e) => setEditPostTitle(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                    disabled={isUpdating}
                                />
                            </div>
                            <div>
                                <label htmlFor="editPostUrl" className="block text-sm font-medium text-gray-700">Enlace (URL)</label>
                                <input
                                    id="editPostUrl"
                                    type="text"
                                    value={editPostUrl}
                                    onChange={(e) => setEditPostUrl(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                    disabled={isUpdating}
                                />
                            </div>
                            <div>
                                <label htmlFor="editComment" className="block text-sm font-medium text-gray-700">Tu Comentario o Resumen</label>
                                <textarea
                                    id="editComment"
                                    rows={3}
                                    value={editComment}
                                    onChange={(e) => setEditComment(e.target.value)}
                                    maxLength={80}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                                    disabled={isUpdating}
                                />
                                <p className="text-xs text-gray-500 mt-1">{editComment.length}/80 caracteres</p>
                            </div>
                            <div className="text-right space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 text-sm font-semibold text-text-secondary bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
                                    disabled={isUpdating}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-base font-bold text-white bg-secondary rounded-md hover:bg-blue-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <h2 className="text-3xl font-bold font-serif text-text-primary mb-6 border-b-2 border-accent pb-2">Últimas publicaciones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentPosts.map(post => (
                        <CommunityPostCard
                            key={post.id}
                            post={post}
                            isOwner={isPostOwner(post)}
                            onEdit={handleStartEdit}
                            onDelete={handleDeletePost}
                        />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md border border-gray-300 bg-surface text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Página anterior"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>

                        <div className="flex items-center space-x-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === i + 1
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-surface text-text-secondary border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md border border-gray-300 bg-surface text-text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Página siguiente"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CommunityPostPage;
