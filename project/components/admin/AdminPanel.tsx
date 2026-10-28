import React, { useState } from 'react';
import type { Course, Job, Entrepreneurship, NewsArticle, PremiumSponsor, HeroHeading, PhotojournalismPost, FundingOpportunity, Specialist, ShareablePhoto, ShortCollaboration, PressRelease, EntrepreneurshipTip, SponsoredAd, SpecialAd, CommunityPost, Event, SiteStat, PartnerLogo, TalentProfile, User, DestacadoArticle, FreelanceService } from '../../types';
import CourseForm from './CourseForm';
import JobForm from './JobForm';
import EntrepreneurForm from './EntrepreneurForm';
import FreelanceServiceForm from './FreelanceServiceForm';
import NewsArticleForm from './NewsArticleForm';
import DestacadoArticleForm from './DestacadoArticleForm';
import SponsorForm from './SponsorForm';
import HeadingForm from './HeadingForm';
import PhotojournalismForm from './PhotojournalismForm';
import FundingForm from './FundingForm';
import SpecialistForm from './SpecialistForm';
import ShareablePhotoForm from './ShareablePhotoForm';
import ShortCollaborationForm from './ShortCollaborationForm';
import PressReleaseForm from './PressReleaseForm';
import EntrepreneurshipTipForm from './EntrepreneurshipTipForm';
import SponsoredAdForm from './SponsoredAdForm';
import SpecialAdForm from './SpecialAdForm';
import CommunityPostForm from './CommunityPostForm';
import EventForm from './EventForm';
import StatsForm from './StatsForm';
import PartnerLogoForm from './PartnerLogoForm';
import TalentProfileForm from './TalentProfileForm';
import SettingsForm from './SettingsForm';
import UserForm from './UserForm';
import { SearchIcon } from '../icons';

interface AdminPanelProps {
    initialSection?: string | null;
    courses: Course[];
    onAddCourse: (course: Omit<Course, 'id'>) => void;
    onUpdateCourse: (course: Course) => void;
    onDeleteCourse: (id: number) => void;
    jobs: Job[];
    onAddJob: (job: Omit<Job, 'id'>) => void;
    onUpdateJob: (job: Job) => void;
    onDeleteJob: (id: number) => void;
    freelanceServices: FreelanceService[];
    onAddFreelanceService: (service: Omit<FreelanceService, 'id'>) => void;
    onUpdateFreelanceService: (service: FreelanceService) => void;
    onDeleteFreelanceService: (id: number) => void;
    entrepreneurs: Entrepreneurship[];
    onAddEntrepreneur: (entrepreneur: Omit<Entrepreneurship, 'id'>) => void;
    onUpdateEntrepreneur: (entrepreneur: Entrepreneurship) => void;
    onDeleteEntrepreneur: (id: number) => void;
    newsArticles: NewsArticle[];
    onAddNewsArticle: (article: Omit<NewsArticle, 'id'>) => void;
    onUpdateNewsArticle: (article: NewsArticle) => void;
    onDeleteNewsArticle: (id: number) => void;
    destacados: DestacadoArticle[];
    onAddDestacado: (destacado: Omit<DestacadoArticle, 'id'>) => void;
    onUpdateDestacado: (destacado: DestacadoArticle) => void;
    onDeleteDestacado: (id: number) => void;
    sponsors: PremiumSponsor[];
    onAddSponsor: (sponsor: Omit<PremiumSponsor, 'id'>) => void;
    onUpdateSponsor: (sponsor: PremiumSponsor) => void;
    onDeleteSponsor: (id: number) => void;
    pressReleases: PressRelease[];
    onAddPressRelease: (release: Omit<PressRelease, 'id'>) => void;
    onUpdatePressRelease: (release: PressRelease) => void;
    onDeletePressRelease: (id: number) => void;
    heroHeading: HeroHeading;
    onUpdateHeroHeading: (heading: HeroHeading) => void;
    photojournalismPosts: PhotojournalismPost[];
    onAddPhotojournalismPost: (post: Omit<PhotojournalismPost, 'id'>) => void;
    onUpdatePhotojournalismPost: (post: PhotojournalismPost) => void;
    onDeletePhotojournalismPost: (id: number) => void;
    fundingOpportunities: FundingOpportunity[];
    onAddFundingOpportunity: (funding: Omit<FundingOpportunity, 'id'>) => void;
    onUpdateFundingOpportunity: (funding: FundingOpportunity) => void;
    onDeleteFundingOpportunity: (id: number) => void;
    specialists: Specialist[];
    onAddSpecialist: (specialist: Omit<Specialist, 'id' | 'dateAdded'>) => void;
    onUpdateSpecialist: (specialist: Specialist) => void;
    onDeleteSpecialist: (id: number) => void;
    shareablePhotos: ShareablePhoto[];
    onAddShareablePhoto: (photo: Omit<ShareablePhoto, 'id' | 'dateAdded'>) => void;
    onUpdateShareablePhoto: (photo: ShareablePhoto) => void;
    onDeleteShareablePhoto: (id: number) => void;
    shortCollaborations: ShortCollaboration[];
    onAddShortCollaboration: (collaboration: Omit<ShortCollaboration, 'id'>) => void;
    onUpdateShortCollaboration: (collaboration: ShortCollaboration) => void;
    onDeleteShortCollaboration: (id: number) => void;
    entrepreneurshipTips: EntrepreneurshipTip[];
    onAddEntrepreneurshipTip: (tip: Omit<EntrepreneurshipTip, 'id'>) => void;
    onUpdateEntrepreneurshipTip: (tip: EntrepreneurshipTip) => void;
    onDeleteEntrepreneurshipTip: (id: number) => void;
    sponsoredAds: SponsoredAd[];
    onAddSponsoredAd: (ad: Omit<SponsoredAd, 'id'>) => void;
    onUpdateSponsoredAd: (ad: SponsoredAd) => void;
    onDeleteSponsoredAd: (ad: number) => void;
    specialAds: SpecialAd[];
    onUpdateSpecialAd: (ad: SpecialAd) => void;
    communityPosts: CommunityPost[];
    onAddCommunityPost: (post: Omit<CommunityPost, 'id'>) => void;
    onUpdateCommunityPost: (post: CommunityPost) => void;
    onDeleteCommunityPost: (id: number) => void;
    events: Event[];
    onAddEvent: (event: Omit<Event, 'id'>) => void;
    onUpdateEvent: (event: Event) => void;
    onDeleteEvent: (id: number) => void;
    stats: SiteStat[];
    onUpdateStat: (stat: SiteStat) => void;
    partnerLogos: PartnerLogo[];
    onAddPartnerLogo: (logo: Omit<PartnerLogo, 'id'>) => void;
    onUpdatePartnerLogo: (logo: PartnerLogo) => void;
    onDeletePartnerLogo: (id: number) => void;
    talentProfiles: TalentProfile[];
    onAddTalentProfile: (profile: Omit<TalentProfile, 'id'>) => void;
    onUpdateTalentProfile: (profile: TalentProfile) => void;
    onDeleteTalentProfile: (id: number) => void;
    rotationInterval: number;
    onUpdateRotationInterval: (interval: number) => void;
    users: User[];
    onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (id: number) => void;
}

type ManagedSection = 'courses' | 'jobs' | 'freelanceServices' | 'entrepreneurs' | 'news' | 'destacados' | 'sponsors' | 'pressReleases' | 'headings' | 'photojournalism' | 'funding' | 'specialists' | 'shareablePhotos' | 'collaborations' | 'entrepreneurshipTips' | 'sponsoredAds' | 'specialAds' | 'communityPosts' | 'events' | 'stats' | 'partnerLogos' | 'talentProfiles' | 'settings' | 'users' | null;

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    // Usamos la inicialización mejorada del MAIN
    const [selectedSection, setSelectedSection] = useState<ManagedSection>((props.initialSection as ManagedSection) || 'settings');

    // Course states
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
    const [courseSearchTerm, setCourseSearchTerm] = useState('');
    const [courseCurrentPage, setCourseCurrentPage] = useState(1);
    const COURSES_PER_PAGE = 5;

    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [isJobFormOpen, setIsJobFormOpen] = useState(false);

    const [editingFreelanceService, setEditingFreelanceService] = useState<FreelanceService | null>(null);
    const [isFreelanceServiceFormOpen, setIsFreelanceServiceFormOpen] = useState(false);

    const [editingEntrepreneur, setEditingEntrepreneur] = useState<Entrepreneurship | null>(null);
    const [isEntrepreneurFormOpen, setIsEntrepreneurFormOpen] = useState(false);

    const [editingNewsArticle, setEditingNewsArticle] = useState<NewsArticle | null>(null);
    const [isNewsArticleFormOpen, setIsNewsArticleFormOpen] = useState(false);

    const [editingDestacado, setEditingDestacado] = useState<DestacadoArticle | null>(null);
    const [isDestacadoFormOpen, setIsDestacadoFormOpen] = useState(false);

    const [editingSponsor, setEditingSponsor] = useState<PremiumSponsor | null>(null);
    const [isSponsorFormOpen, setIsSponsorFormOpen] = useState(false);

    const [isHeadingFormOpen, setIsHeadingFormOpen] = useState(false);

    const [editingPressRelease, setEditingPressRelease] = useState<PressRelease | null>(null);
    const [isPressReleaseFormOpen, setIsPressReleaseFormOpen] = useState(false);

    const [editingPhotoPost, setEditingPhotoPost] = useState<PhotojournalismPost | null>(null);
    const [isPhotoPostFormOpen, setIsPhotoPostFormOpen] = useState(false);

    const [editingFunding, setEditingFunding] = useState<FundingOpportunity | null>(null);
    const [isFundingFormOpen, setIsFundingFormOpen] = useState(false);

    const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
    const [isSpecialistFormOpen, setIsSpecialistFormOpen] = useState(false);

    const [editingShareablePhoto, setEditingShareablePhoto] = useState<ShareablePhoto | null>(null);
    const [isShareablePhotoFormOpen, setIsShareablePhotoFormOpen] = useState(false);

    const [editingCollaboration, setEditingCollaboration] = useState<ShortCollaboration | null>(null);
    const [isCollaborationFormOpen, setIsCollaborationFormOpen] = useState(false);

    const [editingEntrepreneurshipTip, setEditingEntrepreneurshipTip] = useState<EntrepreneurshipTip | null>(null);
    const [isEntrepreneurshipTipFormOpen, setIsEntrepreneurshipTipFormOpen] = useState(false);

    const [editingSponsoredAd, setEditingSponsoredAd] = useState<SponsoredAd | null>(null);
    const [isSponsoredAdFormOpen, setIsSponsoredAdFormOpen] = useState(false);

    const [editingSpecialAd, setEditingSpecialAd] = useState<SpecialAd | null>(null);
    const [isSpecialAdFormOpen, setIsSpecialAdFormOpen] = useState(false);

    const [editingCommunityPost, setEditingCommunityPost] = useState<CommunityPost | null>(null);
    const [isCommunityPostFormOpen, setIsCommunityPostFormOpen] = useState(false);

    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);

    const [editingStat, setEditingStat] = useState<SiteStat | null>(null);
    const [isStatFormOpen, setIsStatFormOpen] = useState(false);

    const [editingPartnerLogo, setEditingPartnerLogo] = useState<PartnerLogo | null>(null);
    const [isPartnerLogoFormOpen, setIsPartnerLogoFormOpen] = useState(false);

    const [editingTalentProfile, setEditingTalentProfile] = useState<TalentProfile | null>(null);
    const [isTalentProfileFormOpen, setIsTalentProfileFormOpen] = useState(false);
    const [talentSearchTerm, setTalentSearchTerm] = useState('');

    const [isSettingsFormOpen, setIsSettingsFormOpen] = useState(false);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');


    const handleAddNewCourse = () => {
        setEditingCourse(null);
        setIsCourseFormOpen(true);
    };
    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
        setIsCourseFormOpen(true);
    };
    const handleSaveCourse = (course: Course | Omit<Course, 'id'>) => {
        if ('id' in course) {
            props.onUpdateCourse(course);
        } else {
            props.onAddCourse(course);
        }
        setIsCourseFormOpen(false);
    };

    const handleAddNewJob = () => {
        setEditingJob(null);
        setIsJobFormOpen(true);
    };
    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setIsJobFormOpen(true);
    };
    const handleSaveJob = (job: Job | Omit<Job, 'id'>) => {
        if ('id' in job) {
            props.onUpdateJob(job);
        } else {
            props.onAddJob(job);
        }
        setIsJobFormOpen(false);
    };

    const handleAddNewFreelanceService = () => {
        setEditingFreelanceService(null);
        setIsFreelanceServiceFormOpen(true);
    };
    const handleEditFreelanceService = (service: FreelanceService) => {
        setEditingFreelanceService(service);
        setIsFreelanceServiceFormOpen(true);
    };
    const handleSaveFreelanceService = (service: FreelanceService | Omit<FreelanceService, 'id'>) => {
        if ('id' in service) {
            props.onUpdateFreelanceService(service as FreelanceService);
        } else {
            props.onAddFreelanceService(service);
        }
        setIsFreelanceServiceFormOpen(false);
    };

    const handleAddNewEntrepreneur = () => {
        setEditingEntrepreneur(null);
        setIsEntrepreneurFormOpen(true);
    };
    const handleEditEntrepreneur = (entrepreneur: Entrepreneurship) => {
        setEditingEntrepreneur(entrepreneur);
        setIsEntrepreneurFormOpen(true);
    };
    const handleSaveEntrepreneur = (entrepreneur: Entrepreneurship | Omit<Entrepreneurship, 'id'>) => {
        if ('id' in entrepreneur) {
            props.onUpdateEntrepreneur(entrepreneur);
        } else {
            props.onAddEntrepreneur(entrepreneur);
        }
        setIsEntrepreneurFormOpen(false);
    };

    const handleAddNewNewsArticle = () => {
        setEditingNewsArticle(null);
        setIsNewsArticleFormOpen(true);
    };
    const handleEditNewsArticle = (article: NewsArticle) => {
        setEditingNewsArticle(article);
        setIsNewsArticleFormOpen(true);
    };
    const handleSaveNewsArticle = (article: NewsArticle | Omit<NewsArticle, 'id'>) => {
        if ('id' in article) {
            props.onUpdateNewsArticle(article);
        } else {
            props.onAddNewsArticle(article);
        }
        setIsNewsArticleFormOpen(false);
    };

    const handleAddNewDestacado = () => {
        setEditingDestacado(null);
        setIsDestacadoFormOpen(true);
    };
    const handleEditDestacado = (destacado: DestacadoArticle) => {
        setEditingDestacado(destacado);
        setIsDestacadoFormOpen(true);
    };
    const handleSaveDestacado = (destacado: DestacadoArticle | Omit<DestacadoArticle, 'id'>) => {
        if ('id' in destacado) {
            props.onUpdateDestacado(destacado);
        } else {
            props.onAddDestacado(destacado);
        }
        setIsDestacadoFormOpen(false);
    };


    const handleAddNewSponsor = () => {
        setEditingSponsor(null);
        setIsSponsorFormOpen(true);
    };
    const handleEditSponsor = (sponsor: PremiumSponsor) => {
        setEditingSponsor(sponsor);
        setIsSponsorFormOpen(true);
    };
    const handleSaveSponsor = (sponsor: PremiumSponsor | Omit<PremiumSponsor, 'id'>) => {
        if ('id' in sponsor) {
            props.onUpdateSponsor(sponsor);
        } else {
            props.onAddSponsor(sponsor);
        }
        setIsSponsorFormOpen(false);
    };

    const handleAddNewPressRelease = () => {
        setEditingPressRelease(null);
        setIsPressReleaseFormOpen(true);
    };
    const handleEditPressRelease = (release: PressRelease) => {
        setEditingPressRelease(release);
        setIsPressReleaseFormOpen(true);
    };
    const handleSavePressRelease = (release: PressRelease | Omit<PressRelease, 'id'>) => {
        if ('id' in release) {
            props.onUpdatePressRelease(release);
        } else {
            props.onAddPressRelease(release);
        }
        setIsPressReleaseFormOpen(false);
    };

    const handleAddNewPhotoPost = () => {
        setEditingPhotoPost(null);
        setIsPhotoPostFormOpen(true);
    };
    const handleEditPhotoPost = (post: PhotojournalismPost) => {
        setEditingPhotoPost(post);
        setIsPhotoPostFormOpen(true);
    };
    const handleSavePhotoPost = (post: PhotojournalismPost | Omit<PhotojournalismPost, 'id'>) => {
        if ('id' in post) {
            props.onUpdatePhotojournalismPost(post);
        } else {
            props.onAddPhotojournalismPost(post as Omit<PhotojournalismPost, 'id'>);
        }
        setIsPhotoPostFormOpen(false);
    };

    const handleAddNewFunding = () => {
        setEditingFunding(null);
        setIsFundingFormOpen(true);
    };
    const handleEditFunding = (funding: FundingOpportunity) => {
        setEditingFunding(funding);
        setIsFundingFormOpen(true);
    };
    const handleSaveFunding = (funding: FundingOpportunity | Omit<FundingOpportunity, 'id'>) => {
        if ('id' in funding) {
            props.onUpdateFundingOpportunity(funding);
        } else {
            props.onAddFundingOpportunity(funding);
        }
        setIsFundingFormOpen(false);
    };

    const handleAddNewSpecialist = () => {
        setEditingSpecialist(null);
        setIsSpecialistFormOpen(true);
    };
    const handleEditSpecialist = (specialist: Specialist) => {
        setEditingSpecialist(specialist);
        setIsSpecialistFormOpen(true);
    };
    const handleSaveSpecialist = (specialist: Specialist | Omit<Specialist, 'id' | 'dateAdded'>) => {
        if ('id' in specialist) {
            props.onUpdateSpecialist(specialist as Specialist);
        } else {
            props.onAddSpecialist(specialist);
        }
        setIsSpecialistFormOpen(false);
    };

    const handleAddNewShareablePhoto = () => {
        setEditingShareablePhoto(null);
        setIsShareablePhotoFormOpen(true);
    };
    const handleEditShareablePhoto = (photo: ShareablePhoto) => {
        setEditingShareablePhoto(photo);
        setIsShareablePhotoFormOpen(true);
    };
    const handleSaveShareablePhoto = (photo: ShareablePhoto | Omit<ShareablePhoto, 'id' | 'dateAdded'>) => {
        if ('id' in photo) {
            props.onUpdateShareablePhoto(photo as ShareablePhoto);
        } else {
            props.onAddShareablePhoto(photo);
        }
        setIsShareablePhotoFormOpen(false);
    };

    const handleAddNewCollaboration = () => {
        setEditingCollaboration(null);
        setIsCollaborationFormOpen(true);
    };
    const handleEditCollaboration = (collaboration: ShortCollaboration) => {
        setEditingCollaboration(collaboration);
        setIsCollaborationFormOpen(true);
    };
    const handleSaveCollaboration = (collaboration: ShortCollaboration | Omit<ShortCollaboration, 'id'>) => {
        if ('id' in collaboration) {
            props.onUpdateShortCollaboration(collaboration);
        } else {
            props.onAddShortCollaboration(collaboration);
        }
        setIsCollaborationFormOpen(false);
    };

    const handleAddNewEntrepreneurshipTip = () => {
        setEditingEntrepreneurshipTip(null);
        setIsEntrepreneurshipTipFormOpen(true);
    };
    const handleEditEntrepreneurshipTip = (tip: EntrepreneurshipTip) => {
        setEditingEntrepreneurshipTip(tip);
        setIsEntrepreneurshipTipFormOpen(true);
    };
    const handleSaveEntrepreneurshipTip = (tip: EntrepreneurshipTip | Omit<EntrepreneurshipTip, 'id'>) => {
        if ('id' in tip) {
            props.onUpdateEntrepreneurshipTip(tip);
        } else {
            props.onAddEntrepreneurshipTip(tip);
        }
        setIsEntrepreneurshipTipFormOpen(false);
    };

    const handleAddNewSponsoredAd = () => {
        setEditingSponsoredAd(null);
        setIsSponsoredAdFormOpen(true);
    };
    const handleEditSponsoredAd = (ad: SponsoredAd) => {
        setEditingSponsoredAd(ad);
        setIsSponsoredAdFormOpen(true);
    };
    const handleSaveSponsoredAd = (ad: SponsoredAd | Omit<SponsoredAd, 'id'>) => {
        if ('id' in ad) {
            props.onUpdateSponsoredAd(ad);
        } else {
            props.onAddSponsoredAd(ad);
        }
        setIsSponsoredAdFormOpen(false);
    };

    const handleEditSpecialAd = (ad: SpecialAd) => {
        setEditingSpecialAd(ad);
        setIsSpecialAdFormOpen(true);
    };
    const handleSaveSpecialAd = (ad: SpecialAd) => {
        props.onUpdateSpecialAd(ad);
        setIsSpecialAdFormOpen(false);
    };

    const handleAddNewCommunityPost = () => {
        setEditingCommunityPost(null);
        setIsCommunityPostFormOpen(true);
    };
    const handleEditCommunityPost = (post: CommunityPost) => {
        setEditingCommunityPost(post);
        setIsCommunityPostFormOpen(true);
    };
    const handleSaveCommunityPost = (post: CommunityPost | Omit<CommunityPost, 'id'>) => {
        if ('id' in post) {
            props.onUpdateCommunityPost(post);
        } else {
            props.onAddCommunityPost(post as Omit<CommunityPost, 'id'>);
        }
        setIsCommunityPostFormOpen(false);
    };

    const handleAddNewEvent = () => {
        setEditingEvent(null);
        setIsEventFormOpen(true);
    };
    const handleEditEvent = (event: Event) => {
        setEditingEvent(event);
        setIsEventFormOpen(true);
    };
    const handleSaveEvent = (event: Event | Omit<Event, 'id'>) => {
        if ('id' in event) {
            props.onUpdateEvent(event);
        } else {
            props.onAddEvent(event);
        }
        setIsEventFormOpen(false);
    };

    const handleEditStat = (stat: SiteStat) => {
        setEditingStat(stat);
        setIsStatFormOpen(true);
    };
    const handleSaveStat = (stat: SiteStat) => {
        props.onUpdateStat(stat);
        setIsStatFormOpen(false);
    };

    const handleAddNewPartnerLogo = () => {
        setEditingPartnerLogo(null);
        setIsPartnerLogoFormOpen(true);
    };
    const handleEditPartnerLogo = (logo: PartnerLogo) => {
        setEditingPartnerLogo(logo);
        setIsPartnerLogoFormOpen(true);
    };
    const handleSavePartnerLogo = (logo: PartnerLogo | Omit<PartnerLogo, 'id'>) => {
        if ('id' in logo) {
            props.onUpdatePartnerLogo(logo);
        } else {
            props.onAddPartnerLogo(logo);
        }
        setIsPartnerLogoFormOpen(false);
    };

    const handleAddNewTalentProfile = () => {
        setEditingTalentProfile(null);
        setIsTalentProfileFormOpen(true);
    };
    const handleEditTalentProfile = (profile: TalentProfile) => {
        setEditingTalentProfile(profile);
        setIsTalentProfileFormOpen(true);
    };
    const handleSaveTalentProfile = (profile: TalentProfile | Omit<TalentProfile, 'id'>) => {
        if ('id' in profile) {
            props.onUpdateTalentProfile(profile);
        } else {
            props.onAddTalentProfile(profile);
        }
        setIsTalentProfileFormOpen(false);
    };

    const handleSaveRotationInterval = (interval: number) => {
        props.onUpdateRotationInterval(interval);
        setIsSettingsFormOpen(false);
        setIsSettingsFormOpen(false);
    };

    const handleAddNewUser = () => {
        setEditingUser(null);
        setIsUserFormOpen(true);
    };
    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserFormOpen(true);
    };
    const handleSaveUser = (user: User | Omit<User, 'id' | 'createdAt'>) => {
        if ('id' in user) {
            props.onUpdateUser(user);
        } else {
            props.onAddUser(user);
        }
        setIsUserFormOpen(false);
    };


    const renderSectionContent = () => {
        switch (selectedSection) {
            case 'courses':
                const filteredCourses = props.courses.filter(course =>
                    course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                    course.category.toLowerCase().includes(courseSearchTerm.toLowerCase())
                );
                const totalCoursePages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
                const paginatedCourses = filteredCourses.slice(
                    (courseCurrentPage - 1) * COURSES_PER_PAGE,
                    courseCurrentPage * COURSES_PER_PAGE
                );

                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Cursos y Capacitaciones</h2>
                            <button onClick={handleAddNewCourse} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Curso</button>
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar por título o categoría..."
                                value={courseSearchTerm}
                                onChange={(e) => {
                                    setCourseSearchTerm(e.target.value);
                                    setCourseCurrentPage(1);
                                }}
                                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {paginatedCourses.map(course => (
                                        <tr key={course.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.level}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditCourse(course)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteCourse(course.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {paginatedCourses.length === 0 && <p className="text-center p-4 text-gray-500">No se encontraron cursos.</p>}
                        </div>
                        {totalCoursePages > 1 && (
                            <div className="mt-4 flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => setCourseCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={courseCurrentPage === 1}
                                    className="px-3 py-1 bg-surface border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                {[...Array(totalCoursePages).keys()].map(num => (
                                    <button
                                        key={num + 1}
                                        onClick={() => setCourseCurrentPage(num + 1)}
                                        className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${courseCurrentPage === num + 1 ? 'bg-primary text-white' : 'bg-surface hover:bg-gray-50'}`}
                                    >
                                        {num + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCourseCurrentPage(p => Math.min(totalCoursePages, p + 1))}
                                    disabled={courseCurrentPage === totalCoursePages}
                                    className="px-3 py-1 bg-surface border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'jobs':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Bolsa de Trabajo</h2>
                            <button onClick={handleAddNewJob} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nueva Oportunidad</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.jobs.map(job => (
                                        <tr key={job.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.company}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditJob(job)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteJob(job.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'freelanceServices':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Servicios Freelance</h2>
                            <button onClick={handleAddNewFreelanceService} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Servicio</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.freelanceServices.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.service}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.provider}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditFreelanceService(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteFreelanceService(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'entrepreneurs':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Pymes Hechas por Periodistas</h2>
                            <button onClick={handleAddNewEntrepreneur} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Emprendimiento</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fundador</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.entrepreneurs.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.founder}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.specialty}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditEntrepreneur(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteEntrepreneur(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'news':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Innovación para el Periodismo (Noticias)</h2>
                            <button onClick={handleAddNewNewsArticle} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Artículo</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.newsArticles.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditNewsArticle(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteNewsArticle(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'destacados':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Noticias Destacadas</h2>
                            <button onClick={handleAddNewDestacado} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Destacado</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.destacados.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditDestacado(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteDestacado(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'sponsors':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Sponsors Premium</h2>
                            <button onClick={handleAddNewSponsor} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Sponsor</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slogan</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.sponsors.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tagline}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditSponsor(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteSponsor(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'pressReleases':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Periodistas en Acción (Comunicados)</h2>
                            <button onClick={handleAddNewPressRelease} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Comunicado</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institución</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.pressReleases.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.institution}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditPressRelease(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeletePressRelease(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'headings':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Título Principal (Hero)</h2>
                        </div>
                        <div className="bg-surface p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-600">Título de la Página de Inicio</h3>
                            <p className="mt-2 text-2xl font-serif text-gray-800">
                                "{props.heroHeading.mainText} <span className="text-primary">{props.heroHeading.highlightedText}</span>."
                            </p>
                            <button
                                onClick={() => setIsHeadingFormOpen(true)}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                                Editar
                            </button>
                        </div>
                    </div>
                );
            case 'photojournalism':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Fotoperiodismo</h2>
                            <button onClick={handleAddNewPhotoPost} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Publicación</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fotógrafo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.photojournalismPosts.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.photographerName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{item.caption}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditPhotoPost(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeletePhotojournalismPost(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'funding':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Fondos y Concursos</h2>
                            <button onClick={handleAddNewFunding} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Oportunidad</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organización</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.fundingOpportunities.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.organization}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditFunding(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteFundingOpportunity(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'specialists':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Fuentes Especializadas</h2>
                            <button onClick={handleAddNewSpecialist} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Especialista</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.specialists.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditSpecialist(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteSpecialist(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'shareablePhotos':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Galería Fotográfica (Descargable)</h2>
                            <button onClick={handleAddNewShareablePhoto} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Foto</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fotógrafo(a)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.shareablePhotos.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.photographerName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{item.caption}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditShareablePhoto(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteShareablePhoto(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'collaborations':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Colaboraciones Urgentes</h2>
                            <button onClick={handleAddNewCollaboration} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Colaboración</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.shortCollaborations.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.budget}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditCollaboration(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteShortCollaboration(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'entrepreneurshipTips':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Videos Educativos (Emprender)</h2>
                            <button onClick={handleAddNewEntrepreneurshipTip} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Video</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experto(a)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.entrepreneurshipTips.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expertName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditEntrepreneurshipTip(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteEntrepreneurshipTip(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'sponsoredAds':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Anuncios Laterales (Barra)</h2>
                            <button onClick={handleAddNewSponsoredAd} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Anuncio</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anunciante</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.sponsoredAds.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.advertiser}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditSponsoredAd(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteSponsoredAd(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'specialAds':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Anuncios Destacados</h2>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título del Anuncio</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.specialAds.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditSpecialAd(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'communityPosts':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Muro de la Comunidad</h2>
                            <button onClick={handleAddNewCommunityPost} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Publicación</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título del Artículo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.communityPosts.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.authorName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.postTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditCommunityPost(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteCommunityPost(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'events':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Calendario de Eventos</h2>
                            <button onClick={handleAddNewEvent} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Evento</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.events.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fullDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditEvent(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteEvent(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'stats':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Estadísticas del Sitio</h2>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiqueta (Label)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prefijo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.stats.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.label}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.endValue.toLocaleString('es-CL')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.prefix || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditStat(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'partnerLogos':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Logos de Socios</h2>
                            <button onClick={handleAddNewPartnerLogo} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Nuevo Logo</button>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Socio</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {props.partnerLogos.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <img src={item.logoUrl} alt={item.name} className="h-10 w-auto object-contain bg-gray-100 p-1 rounded" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditPartnerLogo(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeletePartnerLogo(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'talentProfiles':
                const filteredTalentProfiles = props.talentProfiles
                    .filter(profile => {
                        if (!talentSearchTerm.trim()) {
                            return true;
                        }
                        const searchKeywords = talentSearchTerm.toLowerCase().split(' ').filter(Boolean);
                        const profileText = [
                            profile.name,
                            profile.title,
                            ...profile.skills,
                            profile.region,
                            profile.availability,
                        ].join(' ').toLowerCase();

                        return searchKeywords.every(keyword => profileText.includes(keyword));
                    })
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 50);

                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Base de Talentos</h2>
                            <button onClick={handleAddNewTalentProfile} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Perfil</button>
                        </div>
                        <div className="mb-4 relative">
                            <input
                                type="search"
                                placeholder="Buscar por habilidad, cargo, nombre, región o disponibilidad... (ej: especialista SEO Valparaíso remoto)"
                                value={talentSearchTerm}
                                onChange={(e) => setTalentSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg">
                            Mostrando {filteredTalentProfiles.length} perfiles. Los resultados se ordenan por los más recientes y se limitan a un máximo de 50.
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Región</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {filteredTalentProfiles.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{item.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.region}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditTalentProfile(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteTalentProfile(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredTalentProfiles.length === 0 && (
                                <div className="text-center p-8 text-gray-500">
                                    <p className="font-semibold">
                                        {talentSearchTerm
                                            ? "No se encontraron perfiles que coincidan con tu búsqueda."
                                            : "No hay perfiles en la base de datos"}
                                    </p>
                                    <p className="text-sm">
                                        {talentSearchTerm
                                            ? "Intenta con otras palabras clave."
                                            : 'Puedes añadir uno nuevo usando el botón "Añadir Perfil".'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Configuración General</h2>
                        </div>
                        <div className="bg-surface p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-600">Intervalo de Rotación de Talentos</h3>
                            <p className="mt-2 text-2xl font-serif text-gray-800">
                                Actualmente: <span className="text-primary">{props.rotationInterval} {props.rotationInterval === 1 ? 'hora' : 'horas'}</span>
                            </p>
                            <button
                                onClick={() => setIsSettingsFormOpen(true)}
                                className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                                Editar
                            </button>
                        </div>
                    </div>
                );
            case 'users':
                const filteredUsers = props.users.filter(u =>
                    (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    (u.firstName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    (u.lastName || '').toLowerCase().includes(userSearchTerm.toLowerCase())
                );
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
                            <button onClick={handleAddNewUser} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-orange-600">Añadir Usuario</button>
                        </div>
                        <div className="mb-4 relative">
                            <input
                                type="search"
                                placeholder="Buscar por nombre o email..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="overflow-x-auto bg-surface rounded-lg shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Región</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-surface divide-y divide-gray-200">
                                    {filteredUsers.map((item: User) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.firstName} {item.lastName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.role === 'Administrador' ? 'bg-purple-100 text-purple-800' :
                                                    item.role === 'Empresa' ? 'bg-blue-100 text-blue-800' :
                                                        item.role === 'Cliente' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {item.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.region}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditUser(item)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                <button onClick={() => props.onDeleteUser(item.id)} className="text-red-600 hover:text-red-900 ml-4">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return <p className="text-center text-gray-500">Selecciona una sección para administrar.</p>;
        }
    };

    const NavButton: React.FC<{ section: ManagedSection, label: string }> = ({ section, label }) => (
        <button
            onClick={() => setSelectedSection(section)}
            className={`block w-full text-left px-4 py-2 text-sm rounded-md ${selectedSection === section ? 'bg-primary text-white font-semibold' : 'text-gray-700 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold font-serif text-text-primary">Panel de Administración</h1>
                    <p className="mt-2 text-lg text-text-secondary">Gestiona el contenido de la plataforma Círculo de Periodistas.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* SIDEBAR DEL MAIN (Organizado por categorías) */}
                    <aside className="md:col-span-1">
                        <div className="bg-surface p-4 rounded-lg shadow-md sticky top-24">
                            <h3 className="text-lg font-bold mb-4 border-b pb-2">Secciones</h3>
                            <nav className="space-y-6">
                                <div>
                                    <h4 className="bg-black text-white text-md font-black uppercase tracking-wider mb-3 px-4 py-2 rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        ADMINISTRACIÓN GENERAL
                                    </h4>
                                    <div className="space-y-1">
                                        <NavButton section="settings" label="Configuración General" />
                                        <NavButton section="users" label="Usuarios" />
                                        <NavButton section="stats" label="Estadísticas" />
                                        <NavButton section="headings" label="Títulos principales (hero)" />
                                        <NavButton section="partnerLogos" label="Logos socios (apoyan periodismo emprendedor)" />
                                        <NavButton section="sponsors" label="Sponsors (confían en CiPress)" />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="bg-black text-white text-md font-black uppercase tracking-wider mb-3 px-4 py-2 rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        NOTICIAS Y CONTENIDOS
                                    </h4>
                                    <div className="space-y-1">
                                        <NavButton section="news" label="Innovación para el periodismo" />
                                        <NavButton section="destacados" label="Noticias destacadas" />
                                        <NavButton section="pressReleases" label="Periodistas en acción" />
                                        <NavButton section="photojournalism" label="Foto-Periodismo" />
                                        <NavButton section="shareablePhotos" label="Galería fotográfica" />
                                        <NavButton section="entrepreneurshipTips" label="Videos (emprender es mundial)" />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="bg-black text-white text-md font-black uppercase tracking-wider mb-3 px-4 py-2 rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        OPORTUNIDADES Y SERVICIOS
                                    </h4>
                                    <div className="space-y-1">
                                        <NavButton section="jobs" label="Oportunidades laborales" />
                                        <NavButton section="freelanceServices" label="Servicios Freelance" />
                                        <NavButton section="courses" label="Capacitaciones (cursos)" />
                                        <NavButton section="funding" label="Fondos y concursos" />
                                        <NavButton section="collaborations" label="Colaboraciones urgentes" />
                                        <NavButton section="talentProfiles" label="Base de talentos" />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="bg-black text-white text-md font-black uppercase tracking-wider mb-3 px-4 py-2 rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        COMUNIDAD
                                    </h4>
                                    <div className="space-y-1">
                                        <NavButton section="entrepreneurs" label="Emprendimientos periodísticos" />
                                        <NavButton section="specialists" label="Fuentes destacadas (directorio expertos)" />
                                        <NavButton section="communityPosts" label="Actividad comunidad (muro opiniones)" />
                                        <NavButton section="events" label="Eventos (calendario)" />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="bg-black text-white text-md font-black uppercase tracking-wider mb-3 px-4 py-2 rounded" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        PUBLICIDAD
                                    </h4>
                                    <div className="space-y-1">
                                        <NavButton section="sponsoredAds" label="Anuncios laterales" />
                                        <NavButton section="specialAds" label="Anuncios especiales" />
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    <main className="md:col-span-3">
                        {renderSectionContent()}
                    </main>
                </div>

                {isCourseFormOpen && <CourseForm course={editingCourse} onSave={handleSaveCourse} onClose={() => setIsCourseFormOpen(false)} />}
                {isJobFormOpen && <JobForm job={editingJob} onSave={handleSaveJob} onClose={() => setIsJobFormOpen(false)} />}
                {isFreelanceServiceFormOpen && <FreelanceServiceForm freelanceService={editingFreelanceService} onSave={handleSaveFreelanceService} onClose={() => setIsFreelanceServiceFormOpen(false)} />}
                {isEntrepreneurFormOpen && <EntrepreneurForm entrepreneur={editingEntrepreneur} onSave={handleSaveEntrepreneur} onClose={() => setIsEntrepreneurFormOpen(false)} />}
                {isNewsArticleFormOpen && <NewsArticleForm article={editingNewsArticle} onSave={handleSaveNewsArticle} onClose={() => setIsNewsArticleFormOpen(false)} />}
                {isDestacadoFormOpen && <DestacadoArticleForm article={editingDestacado} onSave={handleSaveDestacado} onClose={() => setIsDestacadoFormOpen(false)} />}
                {isSponsorFormOpen && <SponsorForm sponsor={editingSponsor} onSave={handleSaveSponsor} onClose={() => setIsSponsorFormOpen(false)} />}
                {isHeadingFormOpen && <HeadingForm currentHeading={props.heroHeading} onSave={props.onUpdateHeroHeading} onClose={() => setIsHeadingFormOpen(false)} />}
                {isPressReleaseFormOpen && <PressReleaseForm pressRelease={editingPressRelease} onSave={handleSavePressRelease} onClose={() => setIsPressReleaseFormOpen(false)} />}
                {isPhotoPostFormOpen && <PhotojournalismForm post={editingPhotoPost} onSave={handleSavePhotoPost} onClose={() => setIsPhotoPostFormOpen(false)} />}
                {isFundingFormOpen && <FundingForm fundingOpportunity={editingFunding} onSave={handleSaveFunding} onClose={() => setIsFundingFormOpen(false)} />}
                {isSpecialistFormOpen && <SpecialistForm specialist={editingSpecialist} onSave={handleSaveSpecialist} onClose={() => setIsSpecialistFormOpen(false)} />}
                {isShareablePhotoFormOpen && <ShareablePhotoForm photo={editingShareablePhoto} onSave={handleSaveShareablePhoto} onClose={() => setIsShareablePhotoFormOpen(false)} />}
                {isCollaborationFormOpen && <ShortCollaborationForm collaboration={editingCollaboration} onSave={handleSaveCollaboration} onClose={() => setIsCollaborationFormOpen(false)} />}
                {isEntrepreneurshipTipFormOpen && <EntrepreneurshipTipForm tip={editingEntrepreneurshipTip} onSave={handleSaveEntrepreneurshipTip} onClose={() => setIsEntrepreneurshipTipFormOpen(false)} />}
                {isSponsoredAdFormOpen && <SponsoredAdForm ad={editingSponsoredAd} onSave={handleSaveSponsoredAd} onClose={() => setIsSponsoredAdFormOpen(false)} />}
                {isSpecialAdFormOpen && <SpecialAdForm ad={editingSpecialAd} onSave={handleSaveSpecialAd} onClose={() => setIsSpecialAdFormOpen(false)} />}
                {isCommunityPostFormOpen && <CommunityPostForm post={editingCommunityPost} onSave={handleSaveCommunityPost} onClose={() => setIsCommunityPostFormOpen(false)} />}
                {isEventFormOpen && <EventForm event={editingEvent} onSave={handleSaveEvent} onClose={() => setIsEventFormOpen(false)} />}
                {isStatFormOpen && <StatsForm stat={editingStat} onSave={handleSaveStat} onClose={() => setIsStatFormOpen(false)} />}
                {isPartnerLogoFormOpen && <PartnerLogoForm logo={editingPartnerLogo} onSave={handleSavePartnerLogo} onClose={() => setIsPartnerLogoFormOpen(false)} />}
                {isTalentProfileFormOpen && <TalentProfileForm talentProfile={editingTalentProfile} onSave={handleSaveTalentProfile} onClose={() => setIsTalentProfileFormOpen(false)} />}
                {isSettingsFormOpen && <SettingsForm initialInterval={props.rotationInterval} onSave={handleSaveRotationInterval} onClose={() => setIsSettingsFormOpen(false)} />}
                {isUserFormOpen && <UserForm user={editingUser} onSave={handleSaveUser} onClose={() => setIsUserFormOpen(false)} />}
            </div>
        </div>
    );
};

export default AdminPanel;