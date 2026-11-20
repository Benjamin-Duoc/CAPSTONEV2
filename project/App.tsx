import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PressReleaseUploadPage from './components/PressReleaseUploadPage';
import HomePage from './components/HomePage';
import CoursesModule from './components/CoursesModule';
import EntrepreneurshipModule from './components/EntrepreneurshipModule';
import FreelanceServicesModule from './components/FreelanceServicesModule';
import OpportunitiesModule from './components/OpportunitiesModule';
import NewsModule from './components/NewsModule';
import CommunityAdsModule from './components/CommunityAdsModule';
import SpecialistsModule from './components/SpecialistsModule';
import PhotoGalleryModule from './components/PhotoGalleryModule';
import ResourcesModule from './components/ResourcesModule';
import FundingModule from './components/FundingModule';
import EventsModule from './components/EventsModule';
import LegalModule from './components/LegalModule';
import PhotojournalismModule from './components/PhotojournalismModule';
import AdminPanel from './components/admin/AdminPanel';
import SponsorDetailPage from './components/SponsorDetailPage';
import NewsDetailPage from './components/NewsDetailPage';
import JobDetailPage from './components/JobDetailPage';
import PressReleasesModule from './components/PressReleasesModule';
import PressReleaseDetailPage from './components/PressReleaseDetailPage';
import CourseDetailPage from './components/CourseDetailPage';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import CommunityPostPage from './components/CommunityPostPage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import PhotojournalismDetailPage from './components/PhotojournalismDetailPage';
import UserDashboard from './components/UserDashboard';
import ClienteDashboard from './components/ClienteDashboard';
import FreeDashboard from './components/FreeDashboard';
import DestacadosModule from './components/DestacadosModule';
import SpecialistDetailPage from './components/SpecialistDetailPage';
import FundingDetailPage from './components/FundingDetailPage';
import TalentDetailPage from './components/TalentDetailPage';
import CiPressModal, { CiPressModalType } from './components/common/CiPressModal';

import type { Page, User, Entrepreneurship, Course, Job, NewsArticle, PremiumSponsor, HeroHeading, PhotojournalismPost, Resource, FundingOpportunity, Specialist, ShareablePhoto, PressRelease, ShortCollaboration, EntrepreneurshipTip, SponsoredAd, CommunityPost, SpecialAd, Event, SiteStat, PartnerLogo, TalentProfile, FreelanceService, CommunityAd, NgoSpotlight, LegalTopic, PromoVideo, DestacadoArticle } from './types';

import {
  initDatabase,
  getAllCourses, createCourse, updateCourse, deleteCourse,
  getAllJobs, createJob, updateJob, deleteJob,
  getAllEntrepreneurs, createEntrepreneur, updateEntrepreneur, deleteEntrepreneur,
  getAllNews, createNews, updateNews, deleteNews,
  getAllPressReleases, createPressRelease, updatePressRelease, deletePressRelease,
  getNgoSpotlight, createNgoSpotlight, updateNgoSpotlight, deleteNgoSpotlight,
  getFreelanceServices, createFreelanceService, updateFreelanceService, deleteFreelanceService,
  getCommunityAds, createCommunityAd, updateCommunityAd, deleteCommunityAd,
  getPremiumSponsors, createPremiumSponsor, updatePremiumSponsor, deletePremiumSponsor,
  getPromoVideos, createPromoVideo, updatePromoVideo, deletePromoVideo,
  getCommunityPosts, createCommunityPost, updateCommunityPost, deleteCommunityPost,
  getPhotojournalismPosts, createPhotojournalismPost, updatePhotojournalismPost, deletePhotojournalismPost,
  getSpecialists, createSpecialist, updateSpecialist, deleteSpecialist,
  getShareablePhotos, createShareablePhoto, updateShareablePhoto, deleteShareablePhoto,
  getResources, createResource, updateResource, deleteResource,
  getFundingOpportunities, createFundingOpportunity, updateFundingOpportunity, deleteFundingOpportunity,
  getEvents, createEvent, updateEvent, deleteEvent,
  getLegalTopics, createLegalTopic, updateLegalTopic, deleteLegalTopic,
  getHeroHeading, saveHeroHeading,
  getShortCollaborations, createShortCollaboration, updateShortCollaboration, deleteShortCollaboration,
  getEntrepreneurshipTips, createEntrepreneurshipTip, updateEntrepreneurshipTip, deleteEntrepreneurshipTip,
  getSponsoredAds, createSponsoredAd, updateSponsoredAd, deleteSponsoredAd,
  getSpecialAds, createSpecialAd, updateSpecialAd, deleteSpecialAd,
  getStats, updateStat,
  getPartnerLogos, createPartnerLogo, updatePartnerLogo, deletePartnerLogo,
  getTalentProfiles, createTalentProfile, updateTalentProfile, deleteTalentProfile,
  getRotationInterval, saveRotationInterval,
  getAllUsers, registerUser, updateUser, deleteUser,
  getDestacados, createDestacado, updateDestacado, deleteDestacado,
  getApiUrl
} from './utils/db';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [returnToPage, setReturnToPage] = useState<Page>('home');
  const [initialTab, setInitialTab] = useState<string | null>(null);

  // Selection states
  const [selectedEntrepreneur, setSelectedEntrepreneur] = useState<Entrepreneurship | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<PremiumSponsor | null>(null);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<NewsArticle | null>(null);
  const [selectedDestacado, setSelectedDestacado] = useState<DestacadoArticle | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedPressRelease, setSelectedPressRelease] = useState<PressRelease | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedPhotoPost, setSelectedPhotoPost] = useState<PhotojournalismPost | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedFunding, setSelectedFunding] = useState<FundingOpportunity | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [appModal, setAppModal] = useState<{
    isOpen: boolean;
    type?: CiPressModalType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showAppAlert = (title: string, message: string, type: CiPressModalType = 'info') => {
    setAppModal({
      isOpen: true,
      type,
      title,
      message,
      confirmText: 'Entendido',
      onConfirm: () => setAppModal(prev => ({ ...prev, isOpen: false }))
    });
  };

  const showAppConfirm = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    confirmText = 'Eliminar',
    type: CiPressModalType = 'danger'
  ) => {
    setAppModal({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText: 'Cancelar',
      onConfirm: () => {
        setAppModal(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      },
      onCancel: () => setAppModal(prev => ({ ...prev, isOpen: false }))
    });
  };


  const isAdminUser = (user: User | null) => {
    if (!user) return false;
    // Hardcoded fallback for the user's primary test account
    if (user.email === 'ana@administrador.cl') return true;

    const role = user.role;
    const roleStr = (typeof role === 'string' ? role : (role as any)?.name || '').toLowerCase();
    return roleStr.includes('admin') || roleStr === 'administrator';
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAdminMode(isAdminUser(user));
    // Persist user
    localStorage.setItem('cipress_user', JSON.stringify(user));
    localStorage.setItem('cipress_last_active', Date.now().toString());
    
    // Role-based navigation
    if (isAdminUser(user)) {
      handleNavigate('admin');
    } else {
      handleNavigate(returnToPage || 'dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminMode(false);
    localStorage.removeItem('cipress_user');
    localStorage.removeItem('cipress_last_active');
    handleNavigate('home');
  };

  // Data States (initialized empty, populated via API)

  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneurship[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [ngoSpotlight, setNgoSpotlight] = useState<NgoSpotlight[]>([]);
  const [freelanceServices, setFreelanceServices] = useState<FreelanceService[]>([]);
  const [communityAds, setCommunityAds] = useState<CommunityAd[]>([]);
  const [premiumSponsors, setPremiumSponsors] = useState<PremiumSponsor[]>([]);
  const [promoVideos, setPromoVideos] = useState<PromoVideo[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [photojournalismPosts, setPhotojournalismPosts] = useState<PhotojournalismPost[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [shareablePhotos, setShareablePhotos] = useState<ShareablePhoto[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [fundingOpportunities, setFundingOpportunities] = useState<FundingOpportunity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [legalTopics, setLegalTopics] = useState<LegalTopic[]>([]);
  const [destacados, setDestacados] = useState<DestacadoArticle[]>([]);
  const [heroHeading, setHeroHeading] = useState<HeroHeading>({
    mainText: 'Cargando...',
    highlightedText: '',
    featuredLabel: '',
    textColor: '#ffffff',
    subText: ''
  });
  const [shortCollaborations, setShortCollaborations] = useState<ShortCollaboration[]>([]);
  const [entrepreneurshipTips, setEntrepreneurshipTips] = useState<EntrepreneurshipTip[]>([]);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredAd[]>([]);
  const [specialAds, setSpecialAds] = useState<SpecialAd[]>([]);
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);
  const [talentProfiles, setTalentProfiles] = useState<TalentProfile[]>([]);
  const [rotationInterval, setRotationInterval] = useState<number>(1);
  const [users, setUsers] = useState<User[]>([]);

  // Load data from Backend on mount
  useEffect(() => {
    const loadInitialState = async () => {
      // 1. Restore User Session
      const savedUser = localStorage.getItem('cipress_user');
      const lastActive = localStorage.getItem('cipress_last_active');
      
      if (savedUser && lastActive) {
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        
        if (now - parseInt(lastActive) < tenMinutes) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setIsAdminMode(isAdminUser(user));
          localStorage.setItem('cipress_last_active', now.toString());

          // Sync user role with backend
          fetch(getApiUrl(`users/${user.id}`))
            .then(res => res.json())
            .then(data => {
              if (data && data.role) {
                const refreshedUser = { ...user, ...data };
                setCurrentUser(refreshedUser);
                setIsAdminMode(isAdminUser(refreshedUser));
                localStorage.setItem('cipress_user', JSON.stringify(refreshedUser));
                console.log("Sesión sincronizada con el servidor:", refreshedUser.role);
              }
            })
            .catch(err => console.error("Error sincronizando sesión:", err));
        } else {
          localStorage.removeItem('cipress_user');
          localStorage.removeItem('cipress_last_active');
        }
      }

      // 2. Handle Flow Redirect Parameters (Auto-Confirm)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Evitar múltiples pollings si ya se está procesando
        if (window.hasOwnProperty('_is_confirming_payment')) return;
        (window as any)._is_confirming_payment = true;

        // Assuming showNotification is defined elsewhere or needs to be added.
        // For the purpose of this edit, we'll assume it's available.
        // If not, it would need to be implemented (e.g., using a toast library).
        const showNotification = (message: string, type: 'info' | 'success' | 'error') => {
          showAppAlert(
            type === 'error' ? 'Error en Pago' : type === 'success' ? 'Pago Confirmado' : 'Estado del Pago',
            message,
            type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'
          );
        };

        showNotification('Verificando pago...', 'info');
        
        let attempts = 0;
        const maxAttempts = 10; // 20 segundos total
        const pollStatus = async () => {
          try {
            const response = await fetch(getApiUrl(`payments/status/${token}`));
            const data = await response.json();
            
            if (data.status === 'success' && data.paid) {
              // ¡ÉXITO!
              const updatedUser = { ...currentUser!, role: data.role || 'Colaborador Premium' };
              setCurrentUser(updatedUser);
              setIsAdminMode(isAdminUser(updatedUser));
              localStorage.setItem('cipress_user', JSON.stringify(updatedUser));
              
              showNotification('¡Pago exitoso! Tu perfil ha sido actualizado.', 'success');
              setCurrentPage('dashboard'); // Navigate to dashboard on success
              
              // Limpiar URL
              window.history.replaceState({}, document.title, "/");
              delete (window as any)._is_confirming_payment;
              return; // Detener polling
            }

            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 2000);
            } else {
              showNotification('El pago aún se está procesando. Por favor, revisa tu perfil en unos minutos.', 'info');
              window.history.replaceState({}, document.title, "/");
              delete (window as any)._is_confirming_payment;
            }
          } catch (error) {
            console.error("Error verificando pago:", error);
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 3000);
            } else {
              delete (window as any)._is_confirming_payment;
            }
          }
        };
        pollStatus();
      }

      // 3. Load DB Content
      try {
        await initDatabase();
        setCourses(await getAllCourses());
        setJobs(await getAllJobs());
        setEntrepreneurs(await getAllEntrepreneurs());
        setNewsArticles(await getAllNews());
        setPressReleases(await getAllPressReleases());
        setNgoSpotlight(await getNgoSpotlight());
        setFreelanceServices(await getFreelanceServices());
        setCommunityAds(await getCommunityAds());
        setPremiumSponsors(await getPremiumSponsors());
        setPromoVideos(await getPromoVideos());
        setCommunityPosts(await getCommunityPosts());
        setPhotojournalismPosts(await getPhotojournalismPosts());
        setSpecialists(await getSpecialists());
        setShareablePhotos(await getShareablePhotos());
        setResources(await getResources());
        setFundingOpportunities(await getFundingOpportunities());
        setEvents(await getEvents());
        setLegalTopics(await getLegalTopics());
        setHeroHeading(await getHeroHeading());
        setDestacados(await getDestacados());
        setShortCollaborations(await getShortCollaborations());
        setEntrepreneurshipTips(await getEntrepreneurshipTips());
        setSponsoredAds(await getSponsoredAds());
        setSpecialAds(await getSpecialAds());
        setStats(await getStats());
        setPartnerLogos(await getPartnerLogos());
        setTalentProfiles(await getTalentProfiles());
        setRotationInterval(await getRotationInterval());
        setUsers(await getAllUsers());
      } catch (e) {
        console.error("Error loading data from backend", e);
      }
    };
    loadInitialState();

    // 4. Inactivity Tracker
    const updateActivity = () => {
      if (localStorage.getItem('cipress_user')) {
        localStorage.setItem('cipress_last_active', Date.now().toString());
      }
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, []);

  const refreshPhotoPosts = async () => {
    const dbPosts = await getPhotojournalismPosts();
    setPhotojournalismPosts(dbPosts);
  };

  const refreshGalleries = async () => {
    try {
      setPhotojournalismPosts(await getPhotojournalismPosts());
      setShareablePhotos(await getShareablePhotos());
    } catch (e) {
      console.error("Error refreshing galleries", e);
    }
  };

  const refreshCommunityPosts = async () => {
    const dbPosts = await getCommunityPosts();
    setCommunityPosts(dbPosts);
  };

  const isCommunityPostOwner = (post: CommunityPost) => {
    if (isAdminMode || currentPage === 'admin') return true;
    if (!currentUser) return false;
    // Simple check: match email if available, or name as fallback
    // In a real app, use user ID from backend response
    if (post.authorName === `${currentUser.firstName} ${currentUser.lastName}`.trim()) return true;
    return false;
  };

  // --- Navigation & Selection Handlers ---

  const handleNavigate = (page: Page, subPage?: string) => {
    // 1. REGLA GLOBAL: Solo se permiten ciertas páginas sin login
    const publicPages: Page[] = ['home', 'about', 'privacy-policy', 'terms-of-service', 'login', 'register', 'destacados'];
    
    // Si no está logeado y moviéndose a una página protegida
    if (!currentUser && !publicPages.includes(page)) {
      setReturnToPage(page);
      setInitialTab(subPage || null);
      setCurrentPage('login');
      window.scrollTo(0, 0);
      return;
    }

    if (page === 'login' && currentPage !== 'login' && currentPage !== 'register') {
      setReturnToPage(currentPage);
    }
    setSelectedEntrepreneur(null);
    setSelectedSponsor(null);
    setSelectedNewsArticle(null);
    setSelectedDestacado(null);
    setSelectedJob(null);
    setSelectedPressRelease(null);
    setSelectedCourse(null);
    setSelectedPhotoPost(null);
    setSelectedSpecialist(null);
    setSelectedFunding(null);
    setSelectedTalent(null);
    setCurrentPage(page);
    setInitialTab(subPage || null);
    window.scrollTo(0, 0);
  };

  // Select Handlers
  const handleSelectEntrepreneur = (e: Entrepreneurship) => { setSelectedEntrepreneur(e); window.scrollTo(0, 0); };
  const handleSelectSponsor = (s: PremiumSponsor) => { setSelectedSponsor(s); window.scrollTo(0, 0); };
  const handleSelectNewsArticle = (a: NewsArticle) => { setSelectedNewsArticle(a); window.scrollTo(0, 0); };
  const handleSelectDestacado = (d: DestacadoArticle) => { setSelectedDestacado(d); window.scrollTo(0, 0); };
  const handleSelectJob = (j: Job) => { setSelectedJob(j); window.scrollTo(0, 0); };
  const handleSelectPressRelease = (p: PressRelease) => { setSelectedPressRelease(p); window.scrollTo(0, 0); };
  const handleSelectCourse = (c: Course) => { setSelectedCourse(c); window.scrollTo(0, 0); };
  const handleSelectPhotoPost = (p: PhotojournalismPost) => { setSelectedPhotoPost(p); window.scrollTo(0, 0); };
  const handleSelectSpecialist = (s: Specialist) => { setSelectedSpecialist(s); window.scrollTo(0, 0); };
  const handleSelectFunding = (f: FundingOpportunity) => { setSelectedFunding(f); window.scrollTo(0, 0); };
  const handleSelectTalent = (t: TalentProfile) => { setSelectedTalent(t); window.scrollTo(0, 0); };


  // --- CRUD Operations (Connected to Backend) ---

  // Courses
  const handleAddCourse = async (item: Omit<Course, 'id'>) => {
    try {
      const res = await createCourse(item);
      setCourses(prev => [...prev, res]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el curso.", "danger");
    }
  };
  const handleUpdateCourse = async (item: Course) => {
    try {
      const res = await updateCourse(item);
      setCourses(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el curso.", "danger");
    }
  };
  const handleDeleteCourse = (id: number) => {
    showAppConfirm('¿Eliminar Curso?', '¿Estás seguro de que deseas eliminar este curso?', async () => {
      try {
        await deleteCourse(id);
        setCourses(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el curso.", "danger");
      }
    });
  };

  // Jobs
  const executeAddJob = async (item: Omit<Job, 'id'>): Promise<Job> => {
    const res = await createJob(item);
    setJobs(prev => [res, ...prev]);
    return res;
  };
  const executeUpdateJob = async (item: Job): Promise<Job> => {
    const res = await updateJob(item);
    setJobs(prev => prev.map(i => i.id === res.id ? res : i));
    return res;
  };
  const executeDeleteJob = async (id: number): Promise<void> => {
    await deleteJob(id);
    setJobs(prev => prev.filter(i => i.id !== id));
  };
  const handleAddJob = async (item: Omit<Job, 'id'>) => {
    try {
      await executeAddJob(item);
    } catch (e) {
      showAppAlert("Error", "Error al crear la oferta laboral.", "danger");
    }
  };
  const handleUpdateJob = async (item: Job) => {
    try {
      await executeUpdateJob(item);
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la oferta laboral.", "danger");
    }
  };
  const handleDeleteJob = (id: number) => {
    showAppConfirm('¿Eliminar Oferta?', '¿Estás seguro de que deseas eliminar esta oferta laboral?', async () => {
      try {
        await executeDeleteJob(id);
      } catch (e) {
        showAppAlert("Error", "Error al eliminar la oferta laboral.", "danger");
      }
    });
  };

  // Entrepreneurs
  const handleAddEntrepreneur = async (item: Omit<Entrepreneurship, 'id'>) => {
    try {
      const res = await createEntrepreneur(item);
      setEntrepreneurs(prev => [...prev, res]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el emprendimiento.", "danger");
    }
  };
  const handleUpdateEntrepreneur = async (item: Entrepreneurship) => {
    try {
      const res = await updateEntrepreneur(item);
      setEntrepreneurs(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el emprendimiento.", "danger");
    }
  };
  const handleDeleteEntrepreneur = (id: number) => {
    showAppConfirm('¿Eliminar Emprendimiento?', '¿Estás seguro de que deseas eliminar este emprendimiento?', async () => {
      try {
        await deleteEntrepreneur(id);
        setEntrepreneurs(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el emprendimiento.", "danger");
      }
    });
  };

  // Freelance Services
  const executeAddFreelanceService = async (item: Omit<FreelanceService, 'id'>): Promise<FreelanceService> => {
    const res = await createFreelanceService(item);
    setFreelanceServices(prev => [res, ...prev]);
    return res;
  };
  const executeUpdateFreelanceService = async (item: FreelanceService): Promise<FreelanceService> => {
    const res = await updateFreelanceService(item);
    setFreelanceServices(prev => prev.map(i => i.id === res.id ? res : i));
    return res;
  };
  const executeDeleteFreelanceService = async (id: number): Promise<void> => {
    await deleteFreelanceService(id);
    setFreelanceServices(prev => prev.filter(i => i.id !== id));
  };
  const handleAddFreelanceService = async (item: Omit<FreelanceService, 'id'>) => {
    try {
      await executeAddFreelanceService(item);
    } catch (e) {
      showAppAlert("Error", "Error al crear el servicio freelance.", "danger");
    }
  };
  const handleUpdateFreelanceService = async (item: FreelanceService) => {
    try {
      await executeUpdateFreelanceService(item);
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el servicio freelance.", "danger");
    }
  };
  const handleDeleteFreelanceService = (id: number) => {
    showAppConfirm('¿Eliminar Servicio Freelance?', '¿Estás seguro de que deseas eliminar este servicio freelance?', async () => {
      try {
        await executeDeleteFreelanceService(id);
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el servicio freelance.", "danger");
      }
    });
  };

  // News
  const executeAddNewsArticle = async (item: Omit<NewsArticle, 'id'>): Promise<NewsArticle> => {
    const res = await createNews(item);
    setNewsArticles(prev => [res, ...prev]);
    return res;
  };
  const executeUpdateNewsArticle = async (item: NewsArticle): Promise<NewsArticle> => {
    const res = await updateNews(item);
    setNewsArticles(prev => prev.map(i => i.id === res.id ? res : i));
    return res;
  };
  const handleAddNewsArticle = async (item: Omit<NewsArticle, 'id'>) => {
    try {
      await executeAddNewsArticle(item);
      return true;
    } catch (e) {
      showAppAlert("Error", "Error al crear la noticia.", "danger");
      throw e;
    }
  };
  const handleUpdateNewsArticle = async (item: NewsArticle) => {
    try {
      await executeUpdateNewsArticle(item);
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la noticia.", "danger");
    }
  };
  const handleDeleteNewsArticle = (id: number) => {
    showAppConfirm('¿Eliminar Noticia?', '¿Estás seguro de que deseas eliminar esta noticia?', async () => {
      try {
        await deleteNews(id);
        setNewsArticles(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar la noticia.", "danger");
      }
    });
  };

  // Destacados
  const handleAddDestacado = async (item: Omit<DestacadoArticle, 'id'>) => {
    try {
      const res = await createDestacado(item);
      setDestacados(prev => [res, ...prev]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el artículo destacado.", "danger");
    }
  };
  const handleUpdateDestacado = async (item: DestacadoArticle) => {
    try {
      const res = await updateDestacado(item);
      setDestacados(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el artículo destacado.", "danger");
    }
  };
  const handleDeleteDestacado = (id: number) => {
    showAppConfirm('¿Eliminar Destacado?', '¿Estás seguro de que deseas eliminar este artículo destacado?', async () => {
      try {
        await deleteDestacado(id);
        setDestacados(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el artículo destacado.", "danger");
      }
    });
  };

  // Sponsors
  const executeAddSponsor = async (item: Omit<PremiumSponsor, 'id'>): Promise<PremiumSponsor> => {
    const res = await createPremiumSponsor(item);
    setPremiumSponsors(prev => [...prev, res]);
    return res;
  };
  const executeUpdateSponsor = async (item: PremiumSponsor): Promise<PremiumSponsor> => {
    const res = await updatePremiumSponsor(item);
    setPremiumSponsors(prev => prev.map(i => i.id === res.id ? res : i));
    return res;
  };
  const handleAddSponsor = async (item: Omit<PremiumSponsor, 'id'>) => {
    try {
      await executeAddSponsor(item);
    } catch (e) {
      showAppAlert("Error", "Error al crear el patrocinador.", "danger");
    }
  };
  const handleUpdateSponsor = async (item: PremiumSponsor) => {
    try {
      await executeUpdateSponsor(item);
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el patrocinador.", "danger");
    }
  };
  const handleDeleteSponsor = (id: number) => {
    showAppConfirm('¿Eliminar Patrocinador?', '¿Estás seguro de que deseas eliminar este patrocinador?', async () => {
      try {
        await deletePremiumSponsor(id);
        setPremiumSponsors(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el patrocinador.", "danger");
      }
    });
  };

  // Press Releases
  const executeAddPressRelease = async (item: Omit<PressRelease, 'id'>): Promise<PressRelease> => {
    const res = await createPressRelease(item);
    setPressReleases(prev => [res, ...prev]);
    return res;
  };
  const executeUpdatePressRelease = async (item: PressRelease): Promise<PressRelease> => {
    const res = await updatePressRelease(item);
    setPressReleases(prev => prev.map(i => i.id === res.id ? res : i));
    return res;
  };
  const handleAddPressRelease = async (item: Omit<PressRelease, 'id'>) => { 
    try { 
      await executeAddPressRelease(item); 
      return true; 
    } catch (e: any) { 
      showAppAlert("Error", e.message || "Error al crear el comunicado", "danger"); 
      return false; 
    } 
  };
  const handleUpdatePressRelease = async (item: PressRelease) => {
    try {
      await executeUpdatePressRelease(item);
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el comunicado.", "danger");
    }
  };
  const executeDeletePressRelease = async (id: number): Promise<void> => {
    await deletePressRelease(id);
    setPressReleases(prev => prev.filter(i => i.id !== id));
  };
  const handleDeletePressRelease = (id: number) => {
    showAppConfirm('¿Eliminar Comunicado?', '¿Estás seguro de que deseas eliminar este comunicado?', async () => {
      try {
        await executeDeletePressRelease(id);
        showAppAlert("Comunicado Eliminado", "El comunicado ha sido eliminado exitosamente.", "success");
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el comunicado.", "danger");
      }
    });
  };

  // Photojournalism
  const handleAddPhotojournalismPost = async (item: Omit<PhotojournalismPost, 'id'>) => {
    try {
      const res = await createPhotojournalismPost({ ...item, dateAdded: new Date().toISOString() });
      setPhotojournalismPosts(prev => [res, ...prev]);
    } catch (e) {
      showAppAlert("Error", "Error al crear la foto.", "danger");
    }
  };
  const handleUpdatePhotojournalismPost = async (item: PhotojournalismPost) => {
    try {
      const res = await updatePhotojournalismPost(item);
      setPhotojournalismPosts(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la foto.", "danger");
    }
  };
  const handleDeletePhotojournalismPost = (id: number) => {
    showAppConfirm('¿Eliminar Publicación Fotográfica?', '¿Estás seguro de que deseas eliminar esta fotografía?', async () => {
      try {
        await deletePhotojournalismPost(id);
        setPhotojournalismPosts(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar la publicación fotográfica.", "danger");
      }
    });
  };

  // Funding
  const handleAddFundingOpportunity = async (item: Omit<FundingOpportunity, 'id'>) => {
    try {
      const res = await createFundingOpportunity(item);
      setFundingOpportunities(prev => [...prev, res]);
    } catch (e) {
      showAppAlert("Error", "Error al crear la oportunidad de financiamiento.", "danger");
    }
  };
  const handleUpdateFundingOpportunity = async (item: FundingOpportunity) => {
    try {
      const res = await updateFundingOpportunity(item);
      setFundingOpportunities(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la oportunidad de financiamiento.", "danger");
    }
  };
  const handleDeleteFundingOpportunity = (id: number) => {
    showAppConfirm('¿Eliminar Fondo?', '¿Estás seguro de que deseas eliminar esta oportunidad de fondo?', async () => {
      try {
        await deleteFundingOpportunity(id);
        setFundingOpportunities(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el fondo.", "danger");
      }
    });
  };

  // Specialists
  const executeAddSpecialist = async (item: Omit<Specialist, 'id' | 'dateAdded'>): Promise<Specialist> => {
    const res = await createSpecialist({ ...item, dateAdded: new Date().toISOString().split('T')[0] });
    setSpecialists(prev => [res, ...prev]);
    return res;
  };
  const executeUpdateSpecialist = async (item: Specialist): Promise<Specialist> => {
    const res = await updateSpecialist(item);
    setSpecialists(prev => prev.map(i => i.id === res.id ? res : i));
    return res;
  };
  const executeDeleteSpecialist = async (id: number): Promise<void> => {
    await deleteSpecialist(id);
    setSpecialists(prev => prev.filter(i => i.id !== id));
  };
  const handleAddSpecialist = async (item: Omit<Specialist, 'id' | 'dateAdded'>) => {
    try {
      await executeAddSpecialist(item);
      return true;
    } catch (e) {
      showAppAlert("Error", "Error al crear la fuente especializada.", "danger");
      throw e;
    }
  };
  const handleUpdateSpecialist = async (item: Specialist) => {
    try {
      await executeUpdateSpecialist(item);
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la fuente especializada.", "danger");
    }
  };
  const handleDeleteSpecialist = (id: number) => {
    showAppConfirm('¿Eliminar Fuente?', '¿Estás seguro de que deseas eliminar esta fuente especializada?', async () => {
      try {
        await executeDeleteSpecialist(id);
      } catch (e) {
        showAppAlert("Error", "Error al eliminar la fuente.", "danger");
      }
    });
  };

  // Shareable Photos
  const handleAddShareablePhoto = async (item: Omit<ShareablePhoto, 'id' | 'dateAdded'>) => {
    try {
      const res = await createShareablePhoto({ ...item, dateAdded: new Date().toISOString() });
      setShareablePhotos(prev => [res, ...prev]);
    } catch (e) {
      showAppAlert("Error", "Error al crear la foto para descarga.", "danger");
    }
  };
  const handleUpdateShareablePhoto = async (item: ShareablePhoto) => {
    try {
      const res = await updateShareablePhoto(item);
      setShareablePhotos(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la foto para descarga.", "danger");
    }
  };
  const handleDeleteShareablePhoto = (id: number) => {
    showAppConfirm('¿Eliminar Foto?', '¿Estás seguro de que deseas eliminar esta fotografía para descarga?', async () => {
      try {
        await deleteShareablePhoto(id);
        setShareablePhotos(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar la foto.", "danger");
      }
    });
  };

  // Community Posts
  const handleAddCommunityPost = async (item: Omit<CommunityPost, 'id' | 'authorName' | 'authorAvatarUrl'>) => {
    if (!currentUser) {
      showAppAlert('Acceso Requerido', 'Debes iniciar sesión para publicar en la comunidad.', 'warning');
      return;
    }
    try {
      const userProfile = talentProfiles.find(p => p.userId === currentUser.id);
      const userAvatar = userProfile?.avatarUrl || 'https://i.pravatar.cc/150?u=' + currentUser.email;

      const newItem = {
        ...item,
        authorName: `${currentUser.firstName} ${currentUser.lastName}`,
        authorAvatarUrl: userAvatar,
        createdBy: currentUser.email
      };
      const res = await createCommunityPost(newItem);
      setCommunityPosts(prev => [res, ...prev]);
      showAppAlert('Publicado', '¡Publicación enviada con éxito!', 'success');
    } catch (e) {
      showAppAlert("Error", "Error al crear la publicación.", "danger");
    }
  };
  const handleAddCommunityPostAdmin = async (item: Omit<CommunityPost, 'id'>) => {
    try {
      const res = await createCommunityPost(item);
      setCommunityPosts(prev => [res, ...prev]);
    } catch (e) {
      showAppAlert("Error", "Error al crear la publicación.", "danger");
    }
  };
  const handleUpdateCommunityPost = async (item: CommunityPost) => {
    if (!isCommunityPostOwner(item)) {
      showAppAlert('Sin Permisos', 'No tienes permiso para editar esta publicación.', 'warning');
      return;
    }
    try {
      const res = await updateCommunityPost(item);
      setCommunityPosts(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la publicación.", "danger");
    }
  };
  const handleDeleteCommunityPost = (id: number) => {
    const post = communityPosts.find(p => p.id === id);
    if (post && !isCommunityPostOwner(post)) {
      showAppAlert('Sin Permisos', 'No tienes permiso para eliminar esta publicación.', 'warning');
      return;
    }
    showAppConfirm('¿Eliminar Publicación?', '¿Estás seguro de que deseas eliminar esta publicación de la comunidad?', async () => {
      try {
        await deleteCommunityPost(id);
        setCommunityPosts(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar la publicación.", "danger");
      }
    });
  };

  // Short Collaborations
  const executeAddShortCollaboration = async (item: Omit<ShortCollaboration, 'id'>): Promise<ShortCollaboration> => {
    const res = await createShortCollaboration(item);
    setShortCollaborations(prev => [res, ...prev]);
    return res;
  };
  const executeUpdateShortCollaboration = async (item: ShortCollaboration): Promise<ShortCollaboration> => {
    const res = await updateShortCollaboration(item);
    setShortCollaborations(prev => prev.map(i => i.id === res.id ? res : i));
    return res;
  };
  const handleAddShortCollaboration = async (item: Omit<ShortCollaboration, 'id'>) => {
    try {
      await executeAddShortCollaboration(item);
    } catch (e) {
      showAppAlert("Error", "Error al crear la colaboración urgente.", "danger");
    }
  };
  const handleUpdateShortCollaboration = async (item: ShortCollaboration) => {
    try {
      await executeUpdateShortCollaboration(item);
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la colaboración urgente.", "danger");
    }
  };
  const executeDeleteShortCollaboration = async (id: number): Promise<void> => {
    await deleteShortCollaboration(id);
    setShortCollaborations(prev => prev.filter(i => i.id !== id));
  };
  const handleDeleteShortCollaboration = (id: number) => {
    showAppConfirm('¿Eliminar Colaboración?', '¿Estás seguro de que deseas eliminar este aviso de colaboración urgente?', async () => {
      try {
        await executeDeleteShortCollaboration(id);
        showAppAlert("Colaboración Eliminada", "El aviso ha sido eliminado exitosamente.", "success");
      } catch (e) {
        showAppAlert("Error", "Error al eliminar la colaboración.", "danger");
      }
    });
  };

  // Tips
  const handleAddEntrepreneurshipTip = async (item: Omit<EntrepreneurshipTip, 'id'>) => {
    try {
      const res = await createEntrepreneurshipTip(item);
      setEntrepreneurshipTips(prev => [res, ...prev]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el consejo de emprendimiento.", "danger");
    }
  };
  const handleUpdateEntrepreneurshipTip = async (item: EntrepreneurshipTip) => {
    try {
      const res = await updateEntrepreneurshipTip(item);
      setEntrepreneurshipTips(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el consejo.", "danger");
    }
  };
  const handleDeleteEntrepreneurshipTip = (id: number) => {
    showAppConfirm('¿Eliminar Consejo?', '¿Estás seguro de que deseas eliminar este consejo?', async () => {
      try {
        await deleteEntrepreneurshipTip(id);
        setEntrepreneurshipTips(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el consejo.", "danger");
      }
    });
  };

  // Sponsored Ads
  const handleAddSponsoredAd = async (item: Omit<SponsoredAd, 'id'>) => {
    try {
      const res = await createSponsoredAd(item);
      setSponsoredAds(prev => [res, ...prev]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el anuncio patrocinado.", "danger");
    }
  };
  const handleUpdateSponsoredAd = async (item: SponsoredAd) => {
    try {
      const res = await updateSponsoredAd(item);
      setSponsoredAds(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el anuncio patrocinado.", "danger");
    }
  };
  const handleDeleteSponsoredAd = (id: number) => {
    showAppConfirm('¿Eliminar Anuncio?', '¿Estás seguro de que deseas eliminar este anuncio patrocinado?', async () => {
      try {
        await deleteSponsoredAd(id);
        setSponsoredAds(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el anuncio.", "danger");
      }
    });
  };

  // Events
  const handleAddEvent = async (item: Omit<Event, 'id'>) => {
    try {
      const res = await createEvent(item);
      setEvents(prev => [...prev, res]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el evento.", "danger");
    }
  };
  const handleUpdateEvent = async (item: Event) => {
    try {
      const res = await updateEvent(item);
      setEvents(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el evento.", "danger");
    }
  };
  const handleDeleteEvent = (id: number) => {
    showAppConfirm('¿Eliminar Evento?', '¿Estás seguro de que deseas eliminar este evento?', async () => {
      try {
        await deleteEvent(id);
        setEvents(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el evento.", "danger");
      }
    });
  };

  // Partner Logos
  const handleAddPartnerLogo = async (item: Omit<PartnerLogo, 'id'>) => {
    try {
      const res = await createPartnerLogo(item);
      setPartnerLogos(prev => [...prev, res]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el logo aliado.", "danger");
    }
  };
  const handleUpdatePartnerLogo = async (item: PartnerLogo) => {
    try {
      const res = await updatePartnerLogo(item);
      setPartnerLogos(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el logo aliado.", "danger");
    }
  };
  const handleDeletePartnerLogo = (id: number) => {
    showAppConfirm('¿Eliminar Logo?', '¿Estás seguro de que deseas eliminar este logo aliado?', async () => {
      try {
        await deletePartnerLogo(id);
        setPartnerLogos(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el logo aliado.", "danger");
      }
    });
  };

  // Talent Profiles
  const handleAddTalentProfile = async (item: Omit<TalentProfile, 'id'>) => {
    try {
      const res = await createTalentProfile(item);
      setTalentProfiles(prev => [res, ...prev]);
    } catch (e) {
      showAppAlert("Error", "Error al crear el perfil de talento.", "danger");
    }
  };
  const handleUpdateTalentProfile = async (item: TalentProfile) => {
    try {
      const res = await updateTalentProfile(item);
      setTalentProfiles(prev => prev.map(i => i.id === res.id ? res : i));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el perfil de talento.", "danger");
    }
  };
  const handleDeleteTalentProfile = (id: number) => {
    showAppConfirm('¿Eliminar Perfil?', '¿Estás seguro de que deseas eliminar este perfil de talento?', async () => {
      try {
        await deleteTalentProfile(id);
        setTalentProfiles(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el perfil de talento.", "danger");
      }
    });
  };

  // Special Updates
  const handleUpdateHeroHeading = async (h: HeroHeading) => {
    setHeroHeading(h);
    try {
      await saveHeroHeading(h);
      showAppAlert("Título Actualizado", "Los cambios en el título principal se han guardado correctamente.", "success");
    } catch (e) {
      console.error(e);
      showAppAlert("Error al Guardar", "Hubo un error al guardar los cambios del título.", "danger");
    }
  };
  const handleUpdateSpecialAd = async (ad: SpecialAd) => { setSpecialAds(prev => prev.map(a => a.id === ad.id ? ad : a)); try { await updateSpecialAd(ad); } catch (e) { console.error(e); } };
  const handleUpdateStat = async (stat: SiteStat) => {
    try {
      const res = await updateStat(stat);
      setStats(prev => prev.map(s => s.id === res.id ? res : s));
    } catch (e) {
      showAppAlert("Error", "Error al actualizar la estadística.", "danger");
    }
  };
  const handleUpdateRotationInterval = async (val: number) => { setRotationInterval(val); try { await saveRotationInterval(val); } catch (e) { console.error(e); } };
  const handleRateFreelanceService = async (id: number, rating: number) => {
    // Optimistic rating update logic could go here
    console.log("Rating service", id, rating);
  };

  // User Management
  const handleAddUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const res = await registerUser(user);
      if (res.success) {
        showAppAlert("Usuario Creado", res.message, "success");
        setUsers(await getAllUsers()); // Refresh list
      } else {
        showAppAlert("Aviso", res.message, "warning");
      }
    } catch (e) {
      showAppAlert("Error", "Error al crear el usuario.", "danger");
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      const res = await updateUser(user);
      if (res.success) {
        showAppAlert("Usuario Actualizado", res.message, "success");
        setUsers(await getAllUsers()); // Refresh list
      } else {
        showAppAlert("Aviso", res.message, "warning");
      }
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el usuario.", "danger");
    }
  };

  const handleDeleteUser = (id: number) => {
    showAppConfirm('¿Eliminar Usuario?', '¿Estás seguro de que deseas eliminar este usuario?', async () => {
      try {
        const res = await deleteUser(id);
        if (res.success) {
          showAppAlert("Usuario Eliminado", res.message, "success");
          setUsers(prev => prev.filter(u => u.id !== id));
        } else {
          showAppAlert("Aviso", res.message, "warning");
        }
      } catch (e) {
        showAppAlert("Error", "Error al eliminar el usuario.", "danger");
      }
    });
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    try {
      const res = await updateUser(updatedUser);
      if (res.success) {
        setCurrentUser(res.user || updatedUser);
        showAppAlert("Perfil Actualizado", res.message, "success");
        setUsers(await getAllUsers()); // Refresh global list too
      } else {
        showAppAlert("Aviso", res.message, "warning");
      }
    } catch (e) {
      showAppAlert("Error", "Error al actualizar el perfil.", "danger");
    }
  };


  const renderPage = () => {
    if (selectedSponsor) return <SponsorDetailPage sponsor={selectedSponsor} onBack={() => setSelectedSponsor(null)} />;
    if (selectedNewsArticle) return <NewsDetailPage article={selectedNewsArticle} onBack={() => setSelectedNewsArticle(null)} />;
    if (selectedDestacado) return <NewsDetailPage article={selectedDestacado as unknown as NewsArticle} onBack={() => setSelectedDestacado(null)} />;
    if (selectedJob) return <JobDetailPage job={selectedJob} currentUser={currentUser} onBack={() => setSelectedJob(null)} />;
    if (selectedPressRelease) return <PressReleaseDetailPage pressRelease={selectedPressRelease} onBack={() => setSelectedPressRelease(null)} />;
    if (selectedPhotoPost) return <PhotojournalismDetailPage post={selectedPhotoPost} onBack={() => setSelectedPhotoPost(null)} />;
    if (selectedCourse) return <CourseDetailPage course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
    if (selectedSpecialist) return <SpecialistDetailPage specialist={selectedSpecialist} onBack={() => setSelectedSpecialist(null)} />;
    if (selectedFunding) return <FundingDetailPage funding={selectedFunding} onBack={() => setSelectedFunding(null)} />;
    if (selectedTalent) return <TalentDetailPage profile={selectedTalent} onBack={() => setSelectedTalent(null)} />;

    switch (currentPage) {
      case 'admin':
        if (!isAdminUser(currentUser) || !isAdminMode) {
          return <LoginPage onNavigate={handleNavigate} returnTo="home" onLoginSuccess={handleLogin} />;
        }
        return <AdminPanel
          initialSection={initialTab}
          courses={courses} onAddCourse={handleAddCourse} onUpdateCourse={handleUpdateCourse} onDeleteCourse={handleDeleteCourse}
          jobs={jobs} onAddJob={handleAddJob} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob}
          freelanceServices={freelanceServices} onAddFreelanceService={handleAddFreelanceService} onUpdateFreelanceService={handleUpdateFreelanceService} onDeleteFreelanceService={handleDeleteFreelanceService}
          entrepreneurs={entrepreneurs} onAddEntrepreneur={handleAddEntrepreneur} onUpdateEntrepreneur={handleUpdateEntrepreneur} onDeleteEntrepreneur={handleDeleteEntrepreneur}
          newsArticles={newsArticles} onAddNewsArticle={handleAddNewsArticle} onUpdateNewsArticle={handleUpdateNewsArticle} onDeleteNewsArticle={handleDeleteNewsArticle}
          destacados={destacados} onAddDestacado={handleAddDestacado} onUpdateDestacado={handleUpdateDestacado} onDeleteDestacado={handleDeleteDestacado}
          sponsors={premiumSponsors} onAddSponsor={handleAddSponsor} onUpdateSponsor={handleUpdateSponsor} onDeleteSponsor={handleDeleteSponsor}
          pressReleases={pressReleases} onAddPressRelease={handleAddPressRelease} onUpdatePressRelease={handleUpdatePressRelease} onDeletePressRelease={handleDeletePressRelease}
          heroHeading={heroHeading} onUpdateHeroHeading={handleUpdateHeroHeading}
          photojournalismPosts={photojournalismPosts} onAddPhotojournalismPost={handleAddPhotojournalismPost} onUpdatePhotojournalismPost={handleUpdatePhotojournalismPost} onDeletePhotojournalismPost={handleDeletePhotojournalismPost}
          fundingOpportunities={fundingOpportunities} onAddFundingOpportunity={handleAddFundingOpportunity} onUpdateFundingOpportunity={handleUpdateFundingOpportunity} onDeleteFundingOpportunity={handleDeleteFundingOpportunity}
          specialists={specialists} onAddSpecialist={handleAddSpecialist} onUpdateSpecialist={handleUpdateSpecialist} onDeleteSpecialist={handleDeleteSpecialist}
          shareablePhotos={shareablePhotos} onAddShareablePhoto={handleAddShareablePhoto} onUpdateShareablePhoto={handleUpdateShareablePhoto} onDeleteShareablePhoto={handleDeleteShareablePhoto}
          shortCollaborations={shortCollaborations} onAddShortCollaboration={handleAddShortCollaboration} onUpdateShortCollaboration={handleUpdateShortCollaboration} onDeleteShortCollaboration={handleDeleteShortCollaboration}
          entrepreneurshipTips={entrepreneurshipTips} onAddEntrepreneurshipTip={handleAddEntrepreneurshipTip} onUpdateEntrepreneurshipTip={handleUpdateEntrepreneurshipTip} onDeleteEntrepreneurshipTip={handleDeleteEntrepreneurshipTip}
          sponsoredAds={sponsoredAds} onAddSponsoredAd={handleAddSponsoredAd} onUpdateSponsoredAd={handleUpdateSponsoredAd} onDeleteSponsoredAd={handleDeleteSponsoredAd}
          specialAds={specialAds} onUpdateSpecialAd={handleUpdateSpecialAd}
          communityPosts={communityPosts} onAddCommunityPost={handleAddCommunityPostAdmin} onUpdateCommunityPost={handleUpdateCommunityPost} onDeleteCommunityPost={handleDeleteCommunityPost}
          events={events} onAddEvent={handleAddEvent} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent}
          stats={stats} onUpdateStat={handleUpdateStat}
          partnerLogos={partnerLogos} onAddPartnerLogo={handleAddPartnerLogo} onUpdatePartnerLogo={handleUpdatePartnerLogo} onDeletePartnerLogo={handleDeletePartnerLogo}
          talentProfiles={talentProfiles} onAddTalentProfile={handleAddTalentProfile} onUpdateTalentProfile={handleUpdateTalentProfile} onDeleteTalentProfile={handleDeleteTalentProfile}
          rotationInterval={rotationInterval} onUpdateRotationInterval={handleUpdateRotationInterval}
          users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser}
        />;
      case 'courses': return <CoursesModule courses={courses} onSelectCourse={handleSelectCourse} onBack={() => handleNavigate('home')} />;
      case 'entrepreneurship': return <EntrepreneurshipModule entrepreneurships={entrepreneurs} onBack={() => handleNavigate('home')} />;
      case 'opportunities': return (
        <OpportunitiesModule 
          jobs={jobs} 
          shortCollaborations={shortCollaborations}
          onAddShortCollaboration={executeAddShortCollaboration}
          onUpdateShortCollaboration={executeUpdateShortCollaboration}
          onDeleteShortCollaboration={executeDeleteShortCollaboration}
          onSelectJob={handleSelectJob} 
          initialTab={initialTab || 'jobs'} 
          currentUser={currentUser} 
          onNavigate={handleNavigate} 
          rotationInterval={rotationInterval} 
          onSelectTalent={handleSelectTalent} 
          onBack={() => handleNavigate('home')} 
        />
      );
      case 'funding': return <FundingModule fundingOpportunities={fundingOpportunities} onSelectFunding={handleSelectFunding} onBack={() => handleNavigate('home')} />;
      case 'destacados': return <DestacadosModule destacados={destacados} onSelectDestacado={handleSelectDestacado} onBack={() => handleNavigate('home')} />;
      case 'analysis': return <NewsModule newsArticles={newsArticles} onSelectNewsArticle={handleSelectNewsArticle} onBack={() => handleNavigate('home')} />;
      case 'community-ads': return <CommunityAdsModule ads={communityAds} onBack={() => handleNavigate('home')} />;
      case 'specialists': return <SpecialistsModule specialists={specialists} onSelectSpecialist={handleSelectSpecialist} onBack={() => handleNavigate('home')} />;
      case 'photo-gallery': return <PhotoGalleryModule shareablePhotos={shareablePhotos} onBack={() => handleNavigate('home')} />;
      case 'photojournalism': return <PhotojournalismModule posts={photojournalismPosts} onSelectPost={handleSelectPhotoPost} currentUser={currentUser} onPostUpdated={refreshPhotoPosts} onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />;
      case 'resources': return <ResourcesModule resources={resources} onBack={() => handleNavigate('home')} />;
      case 'events': return <EventsModule events={events} onBack={() => handleNavigate('home')} />;
      case 'legal': return <LegalModule onBack={() => handleNavigate('home')} />;
      case 'press-releases': return <PressReleasesModule pressReleases={pressReleases} onSelectPressRelease={handleSelectPressRelease} onBack={() => handleNavigate('home')} />;
      case 'about': return <AboutPage onNavigate={handleNavigate} />;
      case 'privacy-policy': return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case 'terms-of-service': return <TermsOfServicePage onNavigate={handleNavigate} />;
      case 'community-post': return <CommunityPostPage posts={communityPosts} onAddPost={handleAddCommunityPost} onUpdatePost={handleUpdateCommunityPost} onDeletePost={handleDeleteCommunityPost} onNavigate={handleNavigate} currentUser={currentUser} onBack={() => handleNavigate('home')} />;
      case 'register': return <RegistrationPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'login': return <LoginPage onNavigate={handleNavigate} returnTo={returnToPage} onLoginSuccess={handleLogin} />;
      case 'dashboard': {
        if (!currentUser) return <LoginPage onNavigate={handleNavigate} returnTo="dashboard" onLoginSuccess={handleLogin} />;
        
        // Blindaje de Roles: Normalizar a minúsculas y aplicar lógica estricta con Fallback
        const userRole = (currentUser.role || '').toLowerCase();
        const isCliente = userRole === 'cliente';

        if (isCliente) {
           return <ClienteDashboard
             currentUser={currentUser}
             onLogout={handleLogout}
             premiumSponsors={premiumSponsors}
             onAddSponsor={executeAddSponsor}
             onUpdateSponsor={executeUpdateSponsor}
           />;
        } else {
           // Administrador, Colaborador Premium y Colaborador Gratis -> Panel Completo (Controlado internamente por rol)
           return <UserDashboard 
             currentUser={currentUser} 
             onLogout={handleLogout} 
             onNavigate={handleNavigate} 
             onUpdateProfile={handleUpdateProfile}
             premiumSponsors={premiumSponsors}
             onAddSponsor={executeAddSponsor}
             onUpdateSponsor={executeUpdateSponsor}
             pressReleases={pressReleases}
             onAddPressRelease={executeAddPressRelease}
             onUpdatePressRelease={executeUpdatePressRelease}
             onDeletePressRelease={executeDeletePressRelease}
             onGalleriesUpdated={refreshGalleries}
             shortCollaborations={shortCollaborations}
             onAddShortCollaboration={executeAddShortCollaboration}
             onUpdateShortCollaboration={executeUpdateShortCollaboration}
             onDeleteShortCollaboration={executeDeleteShortCollaboration}
             specialists={specialists}
             onAddSpecialist={executeAddSpecialist}
             onUpdateSpecialist={executeUpdateSpecialist}
             onDeleteSpecialist={executeDeleteSpecialist}
             freelanceServices={freelanceServices}
             onAddFreelanceService={executeAddFreelanceService}
             onUpdateFreelanceService={executeUpdateFreelanceService}
             onDeleteFreelanceService={executeDeleteFreelanceService}
             jobs={jobs}
             onAddJob={executeAddJob}
             onUpdateJob={executeUpdateJob}
             onDeleteJob={executeDeleteJob}
             users={users}
             initialSection={
               initialTab === 'talent' ? 'Mi Perfil de Talento' : 
               initialTab === 'comunicado' ? 'Redactar Comunicado' : 
               initialTab === 'emprendimiento' ? 'Confían en CiPress' : 
               initialTab === 'pyme' ? 'Mis Pymes' :
               initialTab === 'galeria' ? 'Mis Galerías' :
               initialTab === 'comunicados' ? 'Redactar Comunicado' :
               initialTab === 'specialist' ? 'Mis Fuentes Especializadas' :
               initialTab === 'urgentes' ? 'Colaboraciones Urgentes' :
               initialTab === 'freelance' ? 'Mis Servicios Freelance' :
               initialTab === 'jobs' || initialTab === 'ofertas' ? 'Publicar Oferta Laboral' :
               'Mi Perfil'
             }
           />;
        }
      }
      case 'home':
      default:
        return <HomePage
          currentUser={currentUser}
          onAddPressRelease={handleAddPressRelease}
          onAddSpecialist={handleAddSpecialist}
          onNavigate={handleNavigate}
          onSelectEntrepreneur={handleSelectEntrepreneur}
          onSelectSponsor={handleSelectSponsor}
          onSelectNewsArticle={handleSelectNewsArticle}
          onSelectDestacado={handleSelectDestacado}
          onSelectJob={handleSelectJob}
          onSelectPressRelease={handleSelectPressRelease}
          onSelectCourse={handleSelectCourse}
          onSelectSpecialist={(s) => setSelectedSpecialist(s)}
          onSelectFunding={handleSelectFunding}
          isAdminMode={isAdminMode}
          courses={courses}
          jobs={jobs}
          entrepreneurs={entrepreneurs}
          newsArticles={newsArticles}
          pressReleases={pressReleases}
          ngoSpotlight={ngoSpotlight}
          freelanceServices={freelanceServices}
          communityAds={communityAds}
          premiumSponsors={premiumSponsors}
          promoVideos={promoVideos}
          communityPosts={communityPosts}
          photojournalismPosts={photojournalismPosts}
          specialists={specialists}
          shareablePhotos={shareablePhotos}
          resources={resources}
          fundingOpportunities={fundingOpportunities}
          events={events}
          heroHeading={heroHeading}
          destacados={destacados}
          shortCollaborations={shortCollaborations}
          entrepreneurshipTips={entrepreneurshipTips}
          sponsoredAds={sponsoredAds}
          specialAds={specialAds}
          stats={stats}
          rotationInterval={rotationInterval}
        />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      {currentPage !== 'register' && currentPage !== 'login' && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isAdminMode={isAdminMode}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-grow">
        {renderPage()}
      </main>

      {!selectedEntrepreneur && !selectedSponsor && !selectedNewsArticle && !selectedDestacado && !selectedJob && !selectedPressRelease && !selectedCourse && !selectedPhotoPost && currentPage !== 'register' && currentPage !== 'login' && (
        <Footer onNavigate={handleNavigate} partnerLogos={partnerLogos} currentUser={currentUser} />
      )}

      <CiPressModal
        isOpen={appModal.isOpen}
        type={appModal.type}
        title={appModal.title}
        message={appModal.message}
        confirmText={appModal.confirmText}
        cancelText={appModal.cancelText}
        onConfirm={appModal.onConfirm}
        onCancel={appModal.onCancel || (() => setAppModal(prev => ({ ...prev, isOpen: false })))}
      />

    </div>
  );
};

export default App;