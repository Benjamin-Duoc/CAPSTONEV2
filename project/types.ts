export type Page = 'home' | 'courses' | 'opportunities' | 'analysis' | 'community-ads' | 'specialists' | 'specialist-detail' | 'photo-gallery' | 'photojournalism' | 'resources' | 'funding' | 'events' | 'legal' | 'premium-collaborator' | 'free-collaborator' | 'client-company' | 'login' | 'register' | 'about' | 'privacy-policy' | 'terms-of-service' | 'admin' | 'press-releases' | 'upload-press-release' | 'community-post' | 'destacados' | 'entrepreneurship' | 'freelanceServices' | 'mi-espacio' | 'urgent-collaborations';

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    region: string;
    email: string;
    role: string; // Added role
    password: string;
    createdAt?: string;
}

export type ReportContentItem =
    | { type: 'paragraph'; text: string }
    | { type: 'image'; src: string; alt: string }
    | { type: 'quote'; text: string; author?: string };

export interface Course {
    id: number;
    title: string;
    category: 'Periodismo de Datos' | 'SEO' | 'Marketing Digital' | 'Podcast' | 'Fact-Checking' | 'Video Móvil' | 'IA Generativa' | 'Investigación' | 'Ética Periodística' | 'Redes Sociales' | string;
    level: 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto' | string;
    format: 'Video' | 'PDF' | 'Webinar' | 'Online' | 'Presencial' | 'Hibrido' | string;
    cost: 'Gratis' | 'Pago' | 'Hasta $50.000' | '$50.000 - $100.000' | 'Más de $100.000' | string;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    description: string;
    instructorName: string;
    instructorTitle: string;
    instructorAvatarUrl: string;
    duration: string;
    topics: string[];
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    courseStartDate: string;
    courseEndDate: string;
    accessLink: string;
}

export interface DestacadoArticle {
    id: number;
    title: string;
    category: string;
    author: string;
    date: string;
    imageUrl: string;
    summary: string;
    reportContent?: ReportContentItem[];
}

export interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: 'Completo' | 'Parcial' | 'Freelance';
    area: 'Prensa' | 'TV' | 'Radio' | 'Digital';
    date: string;
    logoUrl: string;
    description: string;
    applyEmail: string;
}

export interface Entrepreneurship {
    id: number;
    userId?: number;
    name: string;
    type: 'Micromedio' | 'Agencia' | 'Productora' | 'Corrección' | string;
    founder: string;
    location: string;
    specialty: 'Investigación' | 'Cultura' | 'Deportes' | 'Local' | 'Redacción' | 'Edición' | 'Fotografía' | string;
    imageUrl: string;
    description: string;
    portfolioUrl: string;
    rating: number;
    reviewCount: number;
}

export interface NewsArticle {
    id: number;
    title: string;
    category: 'Industria' | 'Tecnología' | 'Legislación' | 'Tendencias' | 'Emprender' | 'Actualidad' | 'Opinión';
    author: string;
    date: string;
    imageUrl: string;
    summary: string;
    reportContent?: ReportContentItem[];
}

export interface PressRelease {
    id: number;
    authorUserId?: number;
    title: string;
    institution: string;
    author: string;
    date: string;
    imageUrl: string;
    summary: string;
    reportContent?: ReportContentItem[];
    reportAuthor?: string;
    reportDate?: string;
    createdAt?: string;
    isPublicVisible?: boolean;
}

export interface NgoSpotlight {
    id: number;
    title: string;
    institution: string; // Name of the NGO
    author: string; // Journalist associated
    date: string;
    imageUrl: string;
    summary: string;
}

export interface FreelanceService {
    id: number;
    service: string;
    provider: string;
    category: 'Redacción' | 'Corrección' | 'Fotografía' | 'Community Management' | 'Locución' | 'Marketing' | 'Audiovisual' | 'Traducción' | string;
    imageUrl: string;
    description: string;
    linkedinUrl: string;
}

export interface CommunityAd {
    id: number;
    title: string;
    description: string;
    category: 'Venta' | 'Búsqueda' | 'Colaboración';
    authorName: string;
    authorAvatarUrl: string;
    whatsappContact: string;
}

export interface PremiumSponsor {
    id: number;
    userId?: number;
    name: string;
    tagline: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    nameColor: string;
    ctaColor: string;
    reportContent?: ReportContentItem[];
    reportAuthor?: string;
    reportDate?: string;
}

export interface PromoVideo {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
}

export interface CommunityPost {
    id: number;
    authorName: string;
    authorAvatarUrl: string;
    postTitle: string;
    postUrl: string;
    comment: string;
    createdBy?: string;
    createdAt?: string;
}

export interface PhotojournalismPost {
    id: number;
    userId?: number;
    title: string;
    imageUrl: string;
    caption: string;
    photographerName: string;
    photographerAvatarUrl: string;
    dateTaken: string;
    whatsappContact: string;
    dateAdded: string;
    createdBy?: string;
}

export interface Specialist {
    id: number;
    name: string;
    title: string;
    imageUrl: string;
    specialtyDescription: string;
    whatsappContact: string;
    dateAdded: string; // ISO date string for sorting
    textColor: string;
    isPremium?: boolean;
}

export interface ShareablePhoto {
    id: number;
    userId?: number;
    imageUrl: string;
    originalImageUrl?: string;
    watermarkedImageUrl?: string;
    price?: string;
    isSold?: boolean;
    caption: string;
    photographerName: string;
    photographerAvatarUrl: string;
    whatsappContact: string;
    keywords: string[];
    dateAdded: string; // ISO date string
    textColor: string;
}

export interface Resource {
    id: number;
    name: string;
    category: 'IA Generativa' | 'Visualización' | 'Fact-Checking' | 'Productividad' | 'Transcripción';
    description: string;
    link: string;
    type: 'Herramienta' | 'Guía' | 'Software';
}

export interface FundingOpportunity {
    id: number;
    title: string;
    organization: string;
    deadline: string;
    type: 'Fondo' | 'Beca' | 'Premio';
    link: string;
}

export interface Event {
    id: number;
    title: string;
    date: string; // e.g., "30 JUL"
    fullDate: string; // e.g., "Martes 30 de Julio, 18:30 hrs."
    location: string; // e.g., "Online" or "Santiago, Chile"
    type: 'Webinar' | 'Taller' | 'Conferencia';
    link: string;
}

export interface LegalTopic {
    id: number;
    title: string;
    description: string;
}

export interface LegalFAQ {
    id: number;
    question: string;
    answer: string;
}

export interface HeroHeading {
    id?: number;
    mainText: string;
    highlightedText: string;
    featuredTitle: string;
    featuredDescription: string;
    featuredLabel: string;
    textColor: string;
    imageUrl?: string;
}
// FIX: Add missing 'ShortCollaboration' type to resolve compilation error.
export interface ShortCollaboration {
    id: number;
    authorUserId?: number; // Added to track creator
    title: string;
    deadline: string;
    budget: string;
    author: string;
    authorAvatarUrl: string;
    whatsappContact: string;
}

export interface EntrepreneurshipTip {
    id: number;
    title: string;
    description: string;
    expertName: string;
    expertTitle: string;
    thumbnailUrl: string;
    videoUrl: string;
}

export interface SponsoredAd {
    id: number;
    imageUrl: string;
    title: string;
    advertiser: string;
    ctaText: string;
    ctaLink: string;
}

export interface SpecialAd {
    id: 'legal' | 'entrepreneurship';
    title: string;
    description: string;
    ctaText: string;
}

export interface SiteStat {
    id: 'subscribers' | 'visits' | 'regions';
    label: string;
    endValue: number;
    prefix?: string;
}

export interface PartnerLogo {
    id: number;
    name: string;
    logoUrl: string;
    websiteUrl: string;
}

export interface TalentProfile {
    id: number;
    userId?: number;
    name: string;
    avatarUrl: string;
    title: string; // max 8 words
    skills: [string, string, string] | string[]; // Top 3 skills, handling both fixed and dynamic arrays
    availability: 'Presencial' | 'Remoto' | 'Híbrido';
    expectedSalary: string; // e.g., "$1.000.000 CLP"
    region: string;
    linkedinUrl: string;
    email?: string;
    experienceYears: number;
    isPremium?: boolean;
}