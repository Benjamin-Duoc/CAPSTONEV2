import * as initialData from '../data/mockData';
import type {
  User, Course, Job, Entrepreneurship, NewsArticle, PressRelease,
  NgoSpotlight, FreelanceService, CommunityAd, PremiumSponsor, PromoVideo,
  CommunityPost, PhotojournalismPost, Specialist, ShareablePhoto, Resource,
  FundingOpportunity, Event, LegalTopic, LegalFAQ, HeroHeading,
  ShortCollaboration, EntrepreneurshipTip, SponsoredAd, SpecialAd, SiteStat,
  PartnerLogo, TalentProfile, DestacadoArticle
} from '../types';
import { ENV, getApiUrl } from '../src/config/env';
export { getApiUrl };

// Use environment-specific API URL
// In development, Vite proxy will forward /api requests to localhost:5000
// In production, use the full API URL from environment variables
export const API_BASE = ENV.isDevelopment ? '/api' : ENV.apiUrl;

// --- Case Conversion Helpers ---

const toCamel = (s: string) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

export const keysToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toCamel(key)]: keysToCamel(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

const toSnake = (s: string) => {
  return s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const keysToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnake(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toSnake(key)]: keysToSnake(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

// --- Generic Fetch Helpers ---

export const uploadImage = async (file: File, folder: string = 'images'): Promise<{ success: boolean; url?: string; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, message: 'Error al subir la imagen' };
  }
};

const fetchList = async <T>(endpoint: string, fallback: T[] = []): Promise<T[]> => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    const data = await res.json();
    return keysToCamel(data);
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return fallback;
  }
};


const fetchOne = async <T>(endpoint: string, fallback: T | null = null): Promise<T | null> => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    const data = await res.json();
    return keysToCamel(data);
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return fallback;
  }
};

const createItem = async <T>(endpoint: string, item: any): Promise<T> => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keysToSnake(item)),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed to create item in ${endpoint}`);
  }
  const data = await res.json();
  return deserializeReportContent(keysToCamel(data));
};

const updateItem = async <T>(endpoint: string, item: any): Promise<T> => {
  // Ensure ID is present for update
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST', // Using POST for save/update as per controller logic
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keysToSnake(item)),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed to update item in ${endpoint}`);
  }
  const data = await res.json();
  return deserializeReportContent(keysToCamel(data));
};

const deleteItem = async (endpoint: string, id: number | string): Promise<void> => {
  const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Failed to delete item in ${endpoint}`);
};

// --- Serialization Helpers for JSONB columns ---

const serializeReportContent = (item: any) => {
  if (item.reportContent && typeof item.reportContent !== 'string') {
    return { ...item, reportContent: JSON.stringify(item.reportContent) };
  }
  return item;
};

const deserializeReportContent = (item: any) => {
  if (item.reportContent && typeof item.reportContent === 'string') {
    try {
      return { ...item, reportContent: JSON.parse(item.reportContent) };
    } catch (e) {
      // Fallback silencioso: Si no es JSON válido (ej: noticias antiguas con texto plano),
      // lo convertimos en un bloque de párrafo por defecto para que no falle el map().
      return { ...item, reportContent: [{ type: 'paragraph', text: item.reportContent }] };
    }
  }
  return item;
};

const serializeCourse = (item: any) => {
  if (item.topics && Array.isArray(item.topics)) {
    return { ...item, topics: JSON.stringify(item.topics) };
  }
  return item;
};

const deserializeCourse = (item: any) => {
  if (item.topics && typeof item.topics === 'string') {
    try {
      return { ...item, topics: JSON.parse(item.topics) };
    } catch (e) {
      return { ...item, topics: [] };
    }
  }
  // Ensure it's at least an empty array if missing
  if (!item.topics) return { ...item, topics: [] };
  return item;
};

export const transformList = <T>(list: any[]): T[] => {
  return list.map(item => deserializeReportContent(item));
};


// --- Users ---

export const registerUser = async (data: Partial<User>): Promise<{ success: boolean; message: string; userId?: number }> => {
  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToSnake(data)),
      credentials: 'include'
    });
    const result = await response.json();
    return keysToCamel(result);
  } catch (error) {
    console.error('API Error register:', error);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const result = await response.json();
    return keysToCamel(result);
  } catch (error) {
    console.error('API Error login:', error);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return keysToCamel(data);
  } catch (error) {
    console.error('API Error getting users:', error);
    return [];
  }
};

export const updateUser = async (user: User): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToSnake(user)),
      credentials: 'include'
    });
    const data = await response.json();
    return keysToCamel(data);
  } catch (error) {
    console.error('API Error updating user:', error);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
};

export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('API Error deleting user:', error);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
};

// --- Courses ---
export const getAllCourses = async () => {
  const apiData = await fetchList<Course>('/courses', initialData.courses);

  // Merge API data with Mock data to ensure all new courses are visible for testing/demo
  // We deduplicate by ID, prioritizing API data if IDs overlap
  const merged = [...apiData];
  initialData.courses.forEach(mockItem => {
    if (!merged.find(item => item.id === mockItem.id)) {
      merged.push(mockItem);
    }
  });

  return merged.map(deserializeCourse);
};
export const createCourse = async (item: Omit<Course, 'id'>) => deserializeCourse(await createItem<Course>('/courses', serializeCourse(item)));
export const updateCourse = async (item: Course) => deserializeCourse(await updateItem<Course>('/courses', serializeCourse(item)));
export const deleteCourse = async (id: number) => deleteItem('/courses', id);
export const saveCourses = async (data: Course[]) => { console.warn('saveCourses deprecated'); };


// --- Jobs ---
export const getAllJobs = async () => fetchList<Job>('/jobs', initialData.jobs);
export const createJob = async (item: Omit<Job, 'id'>) => createItem<Job>('/jobs', item);
export const updateJob = async (item: Job) => updateItem<Job>('/jobs', item);
export const deleteJob = async (id: number) => deleteItem('/jobs', id);
export const saveJobs = async (data: Job[]) => { console.warn('saveJobs deprecated'); };

// --- Entrepreneurs ---
export const getAllEntrepreneurs = async () => fetchList<Entrepreneurship>('/entrepreneurships', initialData.entrepreneurs);
export const createEntrepreneur = async (item: Omit<Entrepreneurship, 'id'>) => createItem<Entrepreneurship>('/entrepreneurships', item);
export const updateEntrepreneur = async (item: Entrepreneurship) => updateItem<Entrepreneurship>('/entrepreneurships', item);
export const deleteEntrepreneur = async (id: number) => deleteItem('/entrepreneurships', id);
export const saveEntrepreneurs = async (data: Entrepreneurship[]) => { console.warn('saveEntrepreneurs deprecated'); };

// --- News ---
export const getAllNews = async () => transformList<NewsArticle>(await fetchList<NewsArticle>('/news-articles', initialData.newsArticles));
export const createNews = async (item: Omit<NewsArticle, 'id'>) => createItem<NewsArticle>('/news-articles', serializeReportContent(item));
export const updateNews = async (item: NewsArticle) => updateItem<NewsArticle>('/news-articles', serializeReportContent(item));
export const deleteNews = async (id: number) => deleteItem('/news-articles', id);
export const addNews = async (item: NewsArticle) => createNews(item);
export const saveNews = async (data: NewsArticle[]) => { console.warn('saveNews deprecated'); };

// --- Press Releases ---
export const getAllPressReleases = async () => transformList<PressRelease>(await fetchList<PressRelease>('/press-releases', initialData.pressReleases));
export const createPressRelease = async (item: Omit<PressRelease, 'id'>) => createItem<PressRelease>('/press-releases', serializeReportContent(item));
export const updatePressRelease = async (item: PressRelease) => updateItem<PressRelease>('/press-releases', serializeReportContent(item));
export const deletePressRelease = async (id: number) => deleteItem('/press-releases', id);
export const addPressRelease = async (item: PressRelease) => createPressRelease(item);
export const savePressReleases = async (data: PressRelease[]) => { console.warn('savePressReleases deprecated'); };

// --- NGO Spotlight ---
export const getNgoSpotlight = async () => fetchList<NgoSpotlight>('/ngo-spotlights', initialData.ngoSpotlight);
export const createNgoSpotlight = async (item: Omit<NgoSpotlight, 'id'>) => createItem<NgoSpotlight>('/ngo-spotlights', item);
export const updateNgoSpotlight = async (item: NgoSpotlight) => updateItem<NgoSpotlight>('/ngo-spotlights', item);
export const deleteNgoSpotlight = async (id: number) => deleteItem('/ngo-spotlights', id);
export const saveNgoSpotlight = async (data: NgoSpotlight[]) => { console.warn('deprecated'); };

// --- Freelance Services ---
export const getFreelanceServices = async () => fetchList<FreelanceService>('/freelance-services', []);
export const createFreelanceService = async (item: Omit<FreelanceService, 'id'>) => createItem<FreelanceService>('/freelance-services', item);
export const updateFreelanceService = async (item: FreelanceService) => updateItem<FreelanceService>('/freelance-services', item);
export const deleteFreelanceService = async (id: number) => deleteItem('/freelance-services', id);
export const saveFreelanceServices = async (data: FreelanceService[]) => { console.warn('deprecated'); };

// --- Community Ads ---
export const getCommunityAds = async () => fetchList<CommunityAd>('/community-ads', initialData.communityAds);
export const createCommunityAd = async (item: Omit<CommunityAd, 'id'>) => createItem<CommunityAd>('/community-ads', item);
export const updateCommunityAd = async (item: CommunityAd) => updateItem<CommunityAd>('/community-ads', item);
export const deleteCommunityAd = async (id: number) => deleteItem('/community-ads', id);
export const saveCommunityAds = async (data: CommunityAd[]) => { console.warn('deprecated'); };

// --- Premium Sponsors ---
export const getPremiumSponsors = async () => transformList<PremiumSponsor>(await fetchList<PremiumSponsor>('/premium-sponsors', initialData.premiumSponsors));
export const createPremiumSponsor = async (item: Omit<PremiumSponsor, 'id'>) => createItem<PremiumSponsor>('/premium-sponsors', serializeReportContent(item));
export const updatePremiumSponsor = async (item: PremiumSponsor) => updateItem<PremiumSponsor>('/premium-sponsors', serializeReportContent(item));
export const deletePremiumSponsor = async (id: number) => deleteItem('/premium-sponsors', id);
export const savePremiumSponsors = async (data: PremiumSponsor[]) => { console.warn('deprecated'); };

// --- Promo Videos ---
export const getPromoVideos = async () => fetchList<PromoVideo>('/promo-videos', initialData.promoVideos);
export const createPromoVideo = async (item: Omit<PromoVideo, 'id'>) => createItem<PromoVideo>('/promo-videos', item);
export const updatePromoVideo = async (item: PromoVideo) => updateItem<PromoVideo>('/promo-videos', item);
export const deletePromoVideo = async (id: number) => deleteItem('/promo-videos', id);
export const savePromoVideos = async (data: PromoVideo[]) => { console.warn('deprecated'); };

// --- Community Posts ---
export const getCommunityPosts = async () => fetchList<CommunityPost>('/community-posts', initialData.communityPosts);
export const createCommunityPost = async (item: Omit<CommunityPost, 'id'>) => createItem<CommunityPost>('/community-posts', item);
export const updateCommunityPost = async (item: CommunityPost) => updateItem<CommunityPost>('/community-posts', item);
export const deleteCommunityPost = async (id: number) => deleteItem('/community-posts', id);
export const saveCommunityPosts = async (data: CommunityPost[]) => { console.warn('deprecated'); };

// --- Photojournalism ---
export const getPhotojournalismPosts = async () => fetchList<PhotojournalismPost>('/photojournalism-posts', initialData.photojournalismPosts);
export const createPhotojournalismPost = async (item: Omit<PhotojournalismPost, 'id'>) => createItem<PhotojournalismPost>('/photojournalism-posts', item);
export const updatePhotojournalismPost = async (item: PhotojournalismPost) => updateItem<PhotojournalismPost>('/photojournalism-posts', item);
export const deletePhotojournalismPost = async (id: number) => deleteItem('/photojournalism-posts', id);
export const savePhotojournalismPosts = async (data: PhotojournalismPost[]) => { console.warn('deprecated'); };

// --- Specialists ---
export const getSpecialists = async () => fetchList<Specialist>('/specialists', initialData.specialists);
export const createSpecialist = async (item: Omit<Specialist, 'id'>) => createItem<Specialist>('/specialists', item);
export const updateSpecialist = async (item: Specialist) => updateItem<Specialist>('/specialists', item);
export const deleteSpecialist = async (id: number) => deleteItem('/specialists', id);
export const saveSpecialists = async (data: Specialist[]) => { console.warn('deprecated'); };

// --- Shareable Photos ---
export const getShareablePhotos = async () => fetchList<ShareablePhoto>('/shareable-photos', initialData.shareablePhotos);
export const createShareablePhoto = async (item: Omit<ShareablePhoto, 'id'>) => createItem<ShareablePhoto>('/shareable-photos', item);
export const updateShareablePhoto = async (item: ShareablePhoto) => updateItem<ShareablePhoto>('/shareable-photos', item);
export const deleteShareablePhoto = async (id: number) => deleteItem('/shareable-photos', id);
export const saveShareablePhotos = async (data: ShareablePhoto[]) => { console.warn('deprecated'); };

// --- Resources ---
export const getResources = async () => fetchList<Resource>('/resources', initialData.resources);
export const createResource = async (item: Omit<Resource, 'id'>) => createItem<Resource>('/resources', item);
export const updateResource = async (item: Resource) => updateItem<Resource>('/resources', item);
export const deleteResource = async (id: number) => deleteItem('/resources', id);
export const saveResources = async (data: Resource[]) => { console.warn('deprecated'); };

// --- Funding Opportunities ---
export const getFundingOpportunities = async () => fetchList<FundingOpportunity>('/funding-opportunities', initialData.fundingOpportunities);
export const createFundingOpportunity = async (item: Omit<FundingOpportunity, 'id'>) => createItem<FundingOpportunity>('/funding-opportunities', item);
export const updateFundingOpportunity = async (item: FundingOpportunity) => updateItem<FundingOpportunity>('/funding-opportunities', item);
export const deleteFundingOpportunity = async (id: number) => deleteItem('/funding-opportunities', id);
export const saveFundingOpportunities = async (data: FundingOpportunity[]) => { console.warn('deprecated'); };

// --- Events ---
// --- Events ---
const serializeEvent = (item: any) => {
  return {
    ...item,
    dateDisplay: item.date // Compatibility: send date as dateDisplay for older backend versions
  };
};

const transformEvent = (item: any): Event => {
  return {
    ...item,
    date: item.date || item.dateDisplay // Compatibility: Read dateDisplay if date is missing
  };
};

export const getEvents = async () => {
  const list = await fetchList<any>('/events', initialData.events);
  return list.map(transformEvent);
};
export const createEvent = async (item: Omit<Event, 'id'>) => {
  const created = await createItem<Event>('/events', serializeEvent(item));
  return transformEvent(created);
};
export const updateEvent = async (item: Event) => {
  const updated = await updateItem<Event>('/events', serializeEvent(item));
  return transformEvent(updated);
};
export const deleteEvent = async (id: number) => deleteItem('/events', id);
export const saveEvents = async (data: Event[]) => { console.warn('deprecated'); };

// --- Legal Topics ---
export const getLegalTopics = async () => fetchList<LegalTopic>('/legal-topics', initialData.legalTopics);
export const createLegalTopic = async (item: Omit<LegalTopic, 'id'>) => createItem<LegalTopic>('/legal-topics', item);
export const updateLegalTopic = async (item: LegalTopic) => updateItem<LegalTopic>('/legal-topics', item);
export const deleteLegalTopic = async (id: number) => deleteItem('/legal-topics', id);
export const saveLegalTopics = async (data: LegalTopic[]) => { console.warn('deprecated'); };

// --- Legal FAQ ---
export const getLegalFAQs = async () => fetchList<LegalFAQ>('/legal-faqs', []);

// --- Hero Heading ---
export const getHeroHeading = async () => {
  const res = await fetchList<HeroHeading>('/hero-headings', [initialData.heroHeading]);
  return res && res.length > 0 ? res[0] : initialData.heroHeading;
};
export const saveHeroHeading = async (data: HeroHeading) => {
  const payload = { ...data, id: data.id || 1 };
  const res = await fetch(`${API_BASE}/hero-headings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keysToSnake(payload))
  });
  if (!res.ok) throw new Error('Failed to save HeroHeading');
  return await res.json();
};

// --- Destacados ---
export const getDestacados = async () => transformList<DestacadoArticle>(await fetchList<DestacadoArticle>('/destacados', []));
export const createDestacado = async (item: Omit<DestacadoArticle, 'id'>) => createItem<DestacadoArticle>('/destacados', serializeReportContent(item));
export const updateDestacado = async (item: DestacadoArticle) => updateItem<DestacadoArticle>('/destacados', serializeReportContent(item));
export const deleteDestacado = async (id: number) => deleteItem('/destacados', id);

// --- Short Collaborations ---
export const getShortCollaborations = async () => fetchList<ShortCollaboration>('/short-collaborations', initialData.shortCollaborations);
export const createShortCollaboration = async (item: Omit<ShortCollaboration, 'id'>) => createItem<ShortCollaboration>('/short-collaborations', item);
export const updateShortCollaboration = async (item: ShortCollaboration) => updateItem<ShortCollaboration>('/short-collaborations', item);
export const deleteShortCollaboration = async (id: number) => deleteItem('/short-collaborations', id);
export const saveShortCollaborations = async (data: ShortCollaboration[]) => { console.warn('deprecated'); };

// --- Entrepreneurship Tips ---
export const getEntrepreneurshipTips = async () => fetchList<EntrepreneurshipTip>('/entrepreneurship-tips', initialData.entrepreneurshipTips);
export const createEntrepreneurshipTip = async (item: Omit<EntrepreneurshipTip, 'id'>) => createItem<EntrepreneurshipTip>('/entrepreneurship-tips', item);
export const updateEntrepreneurshipTip = async (item: EntrepreneurshipTip) => updateItem<EntrepreneurshipTip>('/entrepreneurship-tips', item);
export const deleteEntrepreneurshipTip = async (id: number) => deleteItem('/entrepreneurship-tips', id);
export const saveEntrepreneurshipTips = async (data: EntrepreneurshipTip[]) => { console.warn('deprecated'); };

// --- Sponsored Ads ---
export const getSponsoredAds = async () => fetchList<SponsoredAd>('/sponsored-ads', initialData.sponsoredAds);
export const createSponsoredAd = async (item: Omit<SponsoredAd, 'id'>) => createItem<SponsoredAd>('/sponsored-ads', item);
export const updateSponsoredAd = async (item: SponsoredAd) => updateItem<SponsoredAd>('/sponsored-ads', item);
export const deleteSponsoredAd = async (id: number) => deleteItem('/sponsored-ads', id);
export const saveSponsoredAds = async (data: SponsoredAd[]) => { console.warn('deprecated'); };

// --- Special Ads ---
export const getSpecialAds = async () => fetchList<SpecialAd>('/special-ads', initialData.specialAds);
export const createSpecialAd = async (item: Omit<SpecialAd, 'id'>) => createItem<SpecialAd>('/special-ads', item);
export const updateSpecialAd = async (item: SpecialAd) => updateItem<SpecialAd>('/special-ads', item);
export const deleteSpecialAd = async (id: number) => deleteItem('/special-ads', id);
export const saveSpecialAds = async (data: SpecialAd[]) => { console.warn('deprecated'); };

// --- Site Stats ---
export const getStats = async () => fetchList<SiteStat>('/site-stats', initialData.siteStats);
export const updateStat = async (item: SiteStat) => updateItem<SiteStat>('/site-stats', item);
export const saveStats = async (data: SiteStat[]) => { console.warn('saveStats is deprecated, use updateStat'); };

// --- Partner Logos ---
export const getPartnerLogos = async () => fetchList<PartnerLogo>('/partner-logos', initialData.partnerLogos);
export const createPartnerLogo = async (item: Omit<PartnerLogo, 'id'>) => createItem<PartnerLogo>('/partner-logos', item);
export const updatePartnerLogo = async (item: PartnerLogo) => updateItem<PartnerLogo>('/partner-logos', item);
export const deletePartnerLogo = async (id: number) => deleteItem('/partner-logos', id);
export const savePartnerLogos = async (data: PartnerLogo[]) => { console.warn('deprecated'); };

// --- Talent Profiles ---
export const getTalentProfiles = async () => fetchList<TalentProfile>('/talent-profiles', initialData.talentProfiles);

export const getMyTalentProfile = async (): Promise<TalentProfile | null> => {
  try {
    const response = await fetch(`${API_BASE}/talent-profiles/my`, { credentials: 'include' });
    if (!response.ok) return null;
    const data = await response.json();
    return data ? keysToCamel(data) : null;
  } catch (error) {
    console.error('Error fetching my talent profile:', error);
    return null;
  }
};

export const saveMyTalentProfile = async (data: Partial<TalentProfile>): Promise<TalentProfile> => {
  const response = await fetch(`${API_BASE}/talent-profiles/my`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keysToSnake(data)),
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Error al guardar el perfil');
  const result = await response.json();
  return keysToCamel(result);
};

export const createTalentProfile = async (item: Omit<TalentProfile, 'id'>) => createItem<TalentProfile>('/talent-profiles', item);
export const updateTalentProfile = async (item: TalentProfile) => updateItem<TalentProfile>('/talent-profiles', item);
export const deleteTalentProfile = async (id: number) => deleteItem('/talent-profiles', id);
export const saveTalentProfiles = async (data: TalentProfile[]) => { console.warn('deprecated'); };

// --- Rotation Interval (Config) ---
export const getRotationInterval = async (): Promise<number> => {
  try {
    const configs = await fetchList<{ key: string, value: string }>('/app-configs', []);
    const rotation = configs.find(c => c.key === 'rotationInterval');
    return rotation ? parseFloat(rotation.value) : initialData.rotationInterval;
  } catch (e) {
    return initialData.rotationInterval;
  }
};

export const saveRotationInterval = async (data: number) => {
  try {
    const configs = await fetchList<{ key: string, value: string }>('/app-configs', []);
    const existing = configs.find(c => c.key === 'rotationInterval');

    const payload = existing
      ? { ...existing, value: data.toString() }
      : { key: 'rotationInterval', value: data.toString() };

    await fetch(`${API_BASE}/app-configs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.error("Error saving rotation", e);
  }
};

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------

export const initiatePayment = async (userId: number): Promise<{ url: string; token: string }> => {
  const res = await fetch(`${API_BASE}/payments/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Error al iniciar el pago");
  }
  return res.json();
};

// ==========================================
// SCRIPT DE POBLADO DE BASE DE DATOS (SEEDING)
// ==========================================

export const initDatabase = async () => {
  console.log('✅ Base de datos manejada por el backend.');
  // Seeding moved to Python backend for better consistency and performance.
};
