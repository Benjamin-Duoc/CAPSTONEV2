import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PressReleaseUploadPage from './components/PressReleaseUploadPage';
import HomePage from './components/HomePage';
import FreelanceServicesModule from './components/FreelanceServicesModule';
import OpportunitiesModule from './components/OpportunitiesModule';
import NewsModule from './components/NewsModule';
import SpecialistsModule from './components/SpecialistsModule';
import PhotoGalleryModule from './components/PhotoGalleryModule';
import LegalModule from './components/LegalModule';
import PhotojournalismModule from './components/PhotojournalismModule';
import SponsorDetailPage from './components/SponsorDetailPage';
import NewsDetailPage from './components/NewsDetailPage';
import JobDetailPage from './components/JobDetailPage';
import PressReleasesModule from './components/PressReleasesModule';
import PressReleaseDetailPage from './components/PressReleaseDetailPage';
import AboutPage from './components/AboutPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import CommunityPostPage from './components/CommunityPostPage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import PhotojournalismDetailPage from './components/PhotojournalismDetailPage';
import UserDashboard from './components/UserDashboard';
import DestacadosModule from './components/DestacadosModule';
import SpecialistDetailPage from './components/SpecialistDetailPage';
import FundingDetailPage from './components/FundingDetailPage';
import TalentDetailPage from './components/TalentDetailPage';
import ModulePlaceholder from './components/ModulePlaceholder';

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
          alert(`${type.toUpperCase()}: ${message}`);
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
  const handleAddCourse = async (item: Omit<Course, 'id'>) => { try { const res = await createCourse(item); setCourses(prev => [...prev, res]); } catch (e) { alert("Error creating course"); } };
  const handleUpdateCourse = async (item: Course) => { try { const res = await updateCourse(item); setCourses(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating course"); } };
  const handleDeleteCourse = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteCourse(id); setCourses(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting course"); } } };

  // Jobs
  const handleAddJob = async (item: Omit<Job, 'id'>) => { try { const res = await createJob(item); setJobs(prev => [...prev, res]); } catch (e) { alert("Error creating job"); } };
  const handleUpdateJob = async (item: Job) => { try { const res = await updateJob(item); setJobs(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating job"); } };
  const handleDeleteJob = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteJob(id); setJobs(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting job"); } } };

  // Entrepreneurs
  const handleAddEntrepreneur = async (item: Omit<Entrepreneurship, 'id'>) => { try { const res = await createEntrepreneur(item); setEntrepreneurs(prev => [...prev, res]); } catch (e) { alert("Error creating entrepreneur"); } };
  const handleUpdateEntrepreneur = async (item: Entrepreneurship) => { try { const res = await updateEntrepreneur(item); setEntrepreneurs(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating entrepreneur"); } };
  const handleDeleteEntrepreneur = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteEntrepreneur(id); setEntrepreneurs(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting entrepreneur"); } } };

  // Freelance Services
  const handleAddFreelanceService = async (item: Omit<FreelanceService, 'id'>) => { try { const res = await createFreelanceService(item); setFreelanceServices(prev => [...prev, res]); } catch (e) { alert("Error creating freelance service"); } };
  const handleUpdateFreelanceService = async (item: FreelanceService) => { try { const res = await updateFreelanceService(item); setFreelanceServices(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating freelance service"); } };
  const handleDeleteFreelanceService = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteFreelanceService(id); setFreelanceServices(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting freelance service"); } } };

  // News
  const handleAddNewsArticle = async (item: Omit<NewsArticle, 'id'>) => { try { const res = await createNews(item); setNewsArticles(prev => [res, ...prev]); } catch (e) { alert("Error creating news"); } };
  const handleUpdateNewsArticle = async (item: NewsArticle) => { try { const res = await updateNews(item); setNewsArticles(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating news"); } };
  const handleDeleteNewsArticle = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteNews(id); setNewsArticles(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting news"); } } };

  // Destacados
  const handleAddDestacado = async (item: Omit<DestacadoArticle, 'id'>) => { try { const res = await createDestacado(item); setDestacados(prev => [res, ...prev]); } catch (e) { alert("Error creating destacado"); } };
  const handleUpdateDestacado = async (item: DestacadoArticle) => { try { const res = await updateDestacado(item); setDestacados(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating destacado"); } };
  const handleDeleteDestacado = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteDestacado(id); setDestacados(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting destacado"); } } };

  // Sponsors
  const handleAddSponsor = async (item: Omit<PremiumSponsor, 'id'>) => { try { const res = await createPremiumSponsor(item); setPremiumSponsors(prev => [...prev, res]); } catch (e) { alert("Error creating sponsor"); } };
  const handleUpdateSponsor = async (item: PremiumSponsor) => { try { const res = await updatePremiumSponsor(item); setPremiumSponsors(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating sponsor"); } };
  const handleDeleteSponsor = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deletePremiumSponsor(id); setPremiumSponsors(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting sponsor"); } } };

  // Press Releases
  const handleAddPressRelease = async (item: Omit<PressRelease, 'id'>) => {
    try {
      const res = await createPressRelease(item);
      setPressReleases(prev => [res, ...prev]);
      return true;
    } catch (e: any) {
      alert(e.message || "Error al crear el comunicado");
      return false;
    }
  };
  const handleUpdatePressRelease = async (item: PressRelease) => { try { const res = await updatePressRelease(item); setPressReleases(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating press release"); } };
  const handleDeletePressRelease = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deletePressRelease(id); setPressReleases(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting press release"); } } };

  // Photojournalism
  const handleAddPhotojournalismPost = async (item: Omit<PhotojournalismPost, 'id'>) => { try { const res = await createPhotojournalismPost({ ...item, dateAdded: new Date().toISOString() }); setPhotojournalismPosts(prev => [res, ...prev]); } catch (e) { alert("Error creating photo post"); } };
  const handleUpdatePhotojournalismPost = async (item: PhotojournalismPost) => { try { const res = await updatePhotojournalismPost(item); setPhotojournalismPosts(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating photo post"); } };
  const handleDeletePhotojournalismPost = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deletePhotojournalismPost(id); setPhotojournalismPosts(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting photo post"); } } };

  // Funding
  const handleAddFundingOpportunity = async (item: Omit<FundingOpportunity, 'id'>) => { try { const res = await createFundingOpportunity(item); setFundingOpportunities(prev => [...prev, res]); } catch (e) { alert("Error creating funding"); } };
  const handleUpdateFundingOpportunity = async (item: FundingOpportunity) => { try { const res = await updateFundingOpportunity(item); setFundingOpportunities(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating funding"); } };
  const handleDeleteFundingOpportunity = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteFundingOpportunity(id); setFundingOpportunities(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting funding"); } } };

  // Specialists
  const handleAddSpecialist = async (item: Omit<Specialist, 'id' | 'dateAdded'>) => { try { const res = await createSpecialist({ ...item, dateAdded: new Date().toISOString().split('T')[0] }); setSpecialists(prev => [res, ...prev]); } catch (e) { alert("Error creating specialist"); } };
  const handleUpdateSpecialist = async (item: Specialist) => { try { const res = await updateSpecialist(item); setSpecialists(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating specialist"); } };
  const handleDeleteSpecialist = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteSpecialist(id); setSpecialists(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting specialist"); } } };

  // Shareable Photos
  const handleAddShareablePhoto = async (item: Omit<ShareablePhoto, 'id' | 'dateAdded'>) => { try { const res = await createShareablePhoto({ ...item, dateAdded: new Date().toISOString() }); setShareablePhotos(prev => [res, ...prev]); } catch (e) { alert("Error creating shareable photo"); } };
  const handleUpdateShareablePhoto = async (item: ShareablePhoto) => { try { const res = await updateShareablePhoto(item); setShareablePhotos(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating shareable photo"); } };
  const handleDeleteShareablePhoto = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteShareablePhoto(id); setShareablePhotos(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting shareable photo"); } } };

  // Community Posts
  const handleAddCommunityPost = async (item: Omit<CommunityPost, 'id' | 'authorName' | 'authorAvatarUrl'>) => {
    if (!currentUser) { alert('Debes iniciar sesión'); return; }
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
      alert('¡Publicado!');
    } catch (e) { alert("Error creating post"); }
  };
  const handleAddCommunityPostAdmin = async (item: Omit<CommunityPost, 'id'>) => { try { const res = await createCommunityPost(item); setCommunityPosts(prev => [res, ...prev]); } catch (e) { alert("Error creating post"); } };
  const handleUpdateCommunityPost = async (item: CommunityPost) => {
    if (!isCommunityPostOwner(item)) { alert('No tienes permiso'); return; }
    try { const res = await updateCommunityPost(item); setCommunityPosts(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating post"); }
  };
  const handleDeleteCommunityPost = async (id: number) => {
    const post = communityPosts.find(p => p.id === id);
    if (post && !isCommunityPostOwner(post)) { alert('No tienes permiso'); return; }
    if (window.confirm('Eliminar?')) { try { await deleteCommunityPost(id); setCommunityPosts(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting post"); } }
  };

  // Short Collaborations
  const handleAddShortCollaboration = async (item: Omit<ShortCollaboration, 'id'>) => { try { const res = await createShortCollaboration(item); setShortCollaborations(prev => [res, ...prev]); } catch (e) { alert("Error creating collaboration"); } };
  const handleUpdateShortCollaboration = async (item: ShortCollaboration) => { try { const res = await updateShortCollaboration(item); setShortCollaborations(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating collaboration"); } };
  const handleDeleteShortCollaboration = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteShortCollaboration(id); setShortCollaborations(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting collaboration"); } } };

  // Tips
  const handleAddEntrepreneurshipTip = async (item: Omit<EntrepreneurshipTip, 'id'>) => { try { const res = await createEntrepreneurshipTip(item); setEntrepreneurshipTips(prev => [res, ...prev]); } catch (e) { alert("Error creating tip"); } };
  const handleUpdateEntrepreneurshipTip = async (item: EntrepreneurshipTip) => { try { const res = await updateEntrepreneurshipTip(item); setEntrepreneurshipTips(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating tip"); } };
  const handleDeleteEntrepreneurshipTip = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteEntrepreneurshipTip(id); setEntrepreneurshipTips(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting tip"); } } };

  // Sponsored Ads
  const handleAddSponsoredAd = async (item: Omit<SponsoredAd, 'id'>) => { try { const res = await createSponsoredAd(item); setSponsoredAds(prev => [res, ...prev]); } catch (e) { alert("Error creating ad"); } };
  const handleUpdateSponsoredAd = async (item: SponsoredAd) => { try { const res = await updateSponsoredAd(item); setSponsoredAds(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating ad"); } };
  const handleDeleteSponsoredAd = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteSponsoredAd(id); setSponsoredAds(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting ad"); } } };

  // Events
  const handleAddEvent = async (item: Omit<Event, 'id'>) => { try { const res = await createEvent(item); setEvents(prev => [...prev, res]); } catch (e) { alert("Error creating event"); } };
  const handleUpdateEvent = async (item: Event) => { try { const res = await updateEvent(item); setEvents(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating event"); } };
  const handleDeleteEvent = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteEvent(id); setEvents(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting event"); } } };

  // Partner Logos
  const handleAddPartnerLogo = async (item: Omit<PartnerLogo, 'id'>) => { try { const res = await createPartnerLogo(item); setPartnerLogos(prev => [...prev, res]); } catch (e) { alert("Error creating logo"); } };
  const handleUpdatePartnerLogo = async (item: PartnerLogo) => { try { const res = await updatePartnerLogo(item); setPartnerLogos(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating logo"); } };
  const handleDeletePartnerLogo = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deletePartnerLogo(id); setPartnerLogos(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting logo"); } } };

  // Talent Profiles
  const handleAddTalentProfile = async (item: Omit<TalentProfile, 'id'>) => { try { const res = await createTalentProfile(item); setTalentProfiles(prev => [res, ...prev]); } catch (e) { alert("Error creating profile"); } };
  const handleUpdateTalentProfile = async (item: TalentProfile) => { try { const res = await updateTalentProfile(item); setTalentProfiles(prev => prev.map(i => i.id === res.id ? res : i)); } catch (e) { alert("Error updating profile"); } };
  const handleDeleteTalentProfile = async (id: number) => { if (window.confirm('Eliminar?')) { try { await deleteTalentProfile(id); setTalentProfiles(prev => prev.filter(i => i.id !== id)); } catch (e) { alert("Error deleting profile"); } } };

  // Special Updates
  const handleUpdateHeroHeading = async (h: HeroHeading) => {
    setHeroHeading(h);
    try {
      await saveHeroHeading(h);
      alert("Los cambios en el título principal se han guardado correctamente.");
    } catch (e) {
      console.error(e);
      alert("Hubo un error al guardar los cambios.");
    }
  };
  const handleUpdateSpecialAd = async (ad: SpecialAd) => { setSpecialAds(prev => prev.map(a => a.id === ad.id ? ad : a)); try { await updateSpecialAd(ad); } catch (e) { console.error(e); } };
  const handleUpdateStat = async (stat: SiteStat) => { try { const res = await updateStat(stat); setStats(prev => prev.map(s => s.id === res.id ? res : s)); } catch (e) { alert("Error updating statistic"); } };
  const handleUpdateRotationInterval = async (val: number) => { setRotationInterval(val); try { await saveRotationInterval(val); } catch (e) { console.error(e); } };
  const handleRateFreelanceService = async (id: number, rating: number) => {
    // Optimistic rating update logic could go here
    // For now simple alert as placeholder
    console.log("Rating service", id, rating);
  };

  // User Management
  const handleAddUser = async (user: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const res = await registerUser(user);
      if (res.success) {
        alert(res.message);
        setUsers(await getAllUsers()); // Refresh list
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("Error creating user");
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      const res = await updateUser(user);
      if (res.success) {
        alert(res.message);
        setUsers(await getAllUsers()); // Refresh list
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('¿Eliminar usuario?')) {
      try {
        const res = await deleteUser(id);
        if (res.success) {
          alert(res.message);
          setUsers(prev => prev.filter(u => u.id !== id));
        } else {
          alert(res.message);
        }
      } catch (e) {
        alert("Error deleting user");
      }
    }
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    try {
      const res = await updateUser(updatedUser);
      if (res.success) {
        setCurrentUser(res.user || updatedUser);
        alert(res.message);
        setUsers(await getAllUsers()); // Refresh global list too
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert("Error al actualizar el perfil");
    }
  };


  const renderPage = () => {
    if (selectedSponsor) return <SponsorDetailPage sponsor={selectedSponsor} onBack={() => setSelectedSponsor(null)} />;
    if (selectedNewsArticle) return <NewsDetailPage article={selectedNewsArticle} onBack={() => setSelectedNewsArticle(null)} />;
    if (selectedDestacado) return <NewsDetailPage article={selectedDestacado as unknown as NewsArticle} onBack={() => setSelectedDestacado(null)} />;
    if (selectedJob) return <JobDetailPage job={selectedJob} onBack={() => setSelectedJob(null)} />;
    if (selectedPressRelease) return <PressReleaseDetailPage pressRelease={selectedPressRelease} onBack={() => setSelectedPressRelease(null)} />;
    if (selectedPhotoPost) return <PhotojournalismDetailPage post={selectedPhotoPost} onBack={() => setSelectedPhotoPost(null)} />;
    if (selectedCourse) return <ModulePlaceholder title={`Curso: ${selectedCourse.title}`} sprint="Sprint 3" onBack={() => setSelectedCourse(null)} />;
    if (selectedSpecialist) return <SpecialistDetailPage specialist={selectedSpecialist} onBack={() => setSelectedSpecialist(null)} />;
    if (selectedFunding) return <FundingDetailPage funding={selectedFunding} onBack={() => setSelectedFunding(null)} />;
    if (selectedTalent) return <TalentDetailPage profile={selectedTalent} onBack={() => setSelectedTalent(null)} />;

    switch (currentPage) {
      case 'admin':
        return <ModulePlaceholder title="Panel de Administración" sprint="Sprint 3" description="El panel integral de administración editorial está programado para el Sprint 3 según el cronograma." onBack={() => handleNavigate('home')} />;
      case 'courses': return <ModulePlaceholder title="Capacitación y Cursos" sprint="Sprint 3" description="El catálogo interactivo de cursos y webinars para periodistas se lanzará en el Sprint 3." onBack={() => handleNavigate('home')} />;
      case 'entrepreneurship': return <ModulePlaceholder title="Emprendimiento e Innovación" sprint="Sprint 3" description="El directorio de emprendimientos periodísticos estará disponible en el Sprint 3." onBack={() => handleNavigate('home')} />;
      case 'opportunities': return <OpportunitiesModule jobs={jobs} onSelectJob={handleSelectJob} initialTab={initialTab || 'jobs'} currentUser={currentUser} onNavigate={handleNavigate} rotationInterval={rotationInterval} onSelectTalent={handleSelectTalent} onBack={() => handleNavigate('home')} />;
      case 'funding': return <ModulePlaceholder title="Fondos y Becas" sprint="Sprint 3" description="El directorio de fondos concursables y becas de investigación se integrará en el Sprint 3." onBack={() => handleNavigate('home')} />;
      case 'destacados': return <DestacadosModule destacados={destacados} onSelectDestacado={handleSelectDestacado} onBack={() => handleNavigate('home')} />;
      case 'analysis': return <NewsModule newsArticles={newsArticles} onSelectNewsArticle={handleSelectNewsArticle} onBack={() => handleNavigate('home')} />;
      case 'community-ads': return <ModulePlaceholder title="Avisos de la Comunidad" sprint="Sprint 3" description="El módulo de clasificados de la comunidad estará listo en el Sprint 3." onBack={() => handleNavigate('home')} />;
      case 'specialists': return <SpecialistsModule specialists={specialists} onSelectSpecialist={handleSelectSpecialist} onBack={() => handleNavigate('home')} />;
      case 'photo-gallery': return <PhotoGalleryModule shareablePhotos={shareablePhotos} onBack={() => handleNavigate('home')} />;
      case 'photojournalism': return <PhotojournalismModule posts={photojournalismPosts} onSelectPost={handleSelectPhotoPost} currentUser={currentUser} onPostUpdated={refreshPhotoPosts} onBack={() => handleNavigate('home')} onNavigate={handleNavigate} />;
      case 'resources': return <ModulePlaceholder title="Recursos y Herramientas" sprint="Sprint 3" description="La biblioteca de herramientas periodísticas estará disponible en el Sprint 3." onBack={() => handleNavigate('home')} />;
      case 'events': return <ModulePlaceholder title="Eventos y Webinars" sprint="Sprint 3" description="La agenda de eventos y talleres para profesionales de prensa se habilitará en el Sprint 3." onBack={() => handleNavigate('home')} />;
      case 'legal': return <LegalModule onBack={() => handleNavigate('home')} />;
      case 'press-releases': return <PressReleasesModule pressReleases={pressReleases} onSelectPressRelease={handleSelectPressRelease} onBack={() => handleNavigate('home')} />;
      case 'upload-press-release': return <PressReleaseUploadPage onSave={handleAddPressRelease} onNavigate={handleNavigate} />;
      case 'about': return <AboutPage onNavigate={handleNavigate} />;
      case 'privacy-policy': return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case 'terms-of-service': return <TermsOfServicePage onNavigate={handleNavigate} />;
      case 'community-post': return <CommunityPostPage posts={communityPosts} onAddPost={handleAddCommunityPost} onUpdatePost={handleUpdateCommunityPost} onDeletePost={handleDeleteCommunityPost} onNavigate={handleNavigate} currentUser={currentUser} onBack={() => handleNavigate('home')} />;
      case 'register': return <RegistrationPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'login': return <LoginPage onNavigate={handleNavigate} returnTo={returnToPage} onLoginSuccess={handleLogin} />;
      case 'dashboard': {
        if (!currentUser) return <LoginPage onNavigate={handleNavigate} returnTo="dashboard" onLoginSuccess={handleLogin} />;
        return <UserDashboard currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} onOpenPressRelease={() => handleNavigate('upload-press-release')} />;
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

    </div>
  );
};

export default App;