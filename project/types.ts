export type Page =
  | 'home'
  | 'legal'
  | 'login'
  | 'register'
  | 'about'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'dashboard'
  | 'admin'
  | 'courses'
  | 'specialists'
  | 'funding'
  | 'events'
  | 'opportunities'
  | 'photojournalism';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  region?: string;
  email: string;
  role: string;
  password?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface HeroHeading {
  id: number;
  title: string;
  subtitle: string;
}

export interface SiteStat {
  id: number;
  label: string;
  value: string;
  icon?: string;
}

export interface PartnerLogo {
  id: number;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface AppConfig {
  id: number;
  key: string;
  value: string;
  description?: string;
}
