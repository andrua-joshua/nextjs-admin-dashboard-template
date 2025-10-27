// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.servipay.net', //|| 'http://localhost:8080',
  ENDPOINTS: {
    LOGIN: '/api/v1/login',
    GET_PROFILE: '/api/v1/getProfile',
    UPDATE_USER: '/api/v1/updateUser',
    GET_ALL_USERS: '/api/v1/getAllUsers',
    GET_PROFILE_BY_ID: '/api/v1/getProfileById',
    GET_ALL_OPPORTUNITIES: '/api/v1/getAllOpportunities',
    FILTER_OPPORTUNITIES: '/api/v1/filterOpportunities',
    GET_OPPORTUNITIES_BY_LOCATION: '/api/v1/getOpportunitiesByLocation',
    GET_OPPORTUNITIES_BY_SERVICE: '/api/v1/getOpportunitiesByService',
    GET_OPPORTUNITIES_COUNT_BY_CATEGORY: '/api/v1/getOpportunitiesCountByCategory',
    GET_USER_OPPORTUNITIES: '/api/v1/getUserOpportunities',
    SEARCH_OPPORTUNITIES: '/api/v1/searchOpportunities',
    // Reviews endpoints
    GET_USER_REVIEWS: '/api/v1/getUserReviews',
    GET_PROVIDER_REVIEWS: '/api/v1/getProviderReviews',
    // Providers endpoints
    GET_ALL_PROVIDERS: '/api/v1/getAllProviders',
    GET_PROVIDER_BY_SERVICE: '/api/v1/getProviderByService',
    GET_PROVIDERS_COUNT_BY_CATEGORY: '/api/v1/getProvidersCountByCategory',
    GET_PROVIDER_BY_LOCATION: '/api/v1/getProviderByLocation',
    SEARCH_PROVIDER: '/api/v1/searchProvider',
    FILTER_PROVIDERS: '/api/v1/filterProviders',
    GET_PROVIDER_BY_USER_ID: '/api/v1/getProviderByUserId',
    // KYC endpoints
    GET_ALL_KYC: '/api/v1/getAllKyc',
    UPDATE_KYC_STATUS: '/api/v1/updateKycStatus',
    // Contracts endpoints
    GET_ALL_OFFERS: '/api/v1/getAllOffers',
    GET_OFFERS_BY_PROVIDER: '/api/v1/getOffersByProvider',
    GET_OFFERS_BY_OPPORTUNITY: '/api/v1/getOffersByOpportunity',
    GET_OFFERS_BY_PROVIDER_AND_STATUS: '/api/v1/getOffersByProviderAndStatus',
    GET_PROVIDER_ACTIVE_AND_INPROGRESS_OFFERS: '/api/v1/getProviderActiveAndInProgressOffers',
    // Express offers endpoints
    GET_OFFERS_BY_USER_AND_STATUS: '/api/v1/getOffersByUserAndStatus',
    GET_OFFERS_BY_PROVIDER_AND_STATUS_EXPRESS: '/api/v1/getOffersByProviderAndStatus',
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// API Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  contact: string;
  nationality: string;
  location: string;
  profileImg: string | null;
  languages: string[];
  contactVerified: boolean;
  role: string;
  kycStatus: string;
  rating: number;
  createdAt: string;
  isProvider: boolean;
  opportunities: number;
}

export interface GetProfileResponse {
  user: User;
}

export interface UpdateUserRequest {
  fullName?: string;
  location?: string;
  contact?: string;
  nationality?: string;
  languages?: string[];
}

export interface UpdateUserResponse {
  fullName: string;
  location: string;
}

export interface PaginatedResponse {
  hasPrevious: boolean;
  hasNext: boolean;
  currentPage: number;
  [key: string]: unknown;
}

export interface GetAllUsersResponse extends PaginatedResponse {
  users: User[];
}

export interface Opportunity {
  id: number;
  user: User;
  title: string;
  service: string;
  description: string;
  location: string;
  budget: number;
  deadline: string;
  whatsAppContact: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface GetAllOpportunitiesResponse {
  opportunities: Opportunity[];
}

export interface FilteredOpportunitiesResponse extends PaginatedResponse {
  opportunities: Opportunity[];
}

export interface OpportunitiesCountResponse {
  count: number;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface Provider {
  id: number;
  user: User;
  providerName: string;
  description: string;
  rating: number;
  workingAreas: string[];
  gallery: string[];
  services: Service[];
  createdAt: string;
  contracts: number;
}

export interface Review {
  id: number;
  user: User;
  message: string;
  rating: number;
  createdAt: string;
  provider?: Provider;
}

export interface GetUserReviewsResponse extends PaginatedResponse {
  reviews: Review[];
}

export interface GetProviderReviewsResponse extends PaginatedResponse {
  reviews: Review[];
}

export interface GetAllProvidersResponse extends PaginatedResponse {
  providers: Provider[];
}

export interface GetProviderByServiceResponse extends PaginatedResponse {
  providers: Provider[];
}

export interface GetProviderByLocationResponse extends PaginatedResponse {
  providers: Provider[];
}

export interface SearchProviderResponse extends PaginatedResponse {
  providers: Provider[];
}

export interface FilterProvidersResponse extends PaginatedResponse {
  providers: Provider[];
}

export interface GetProviderByUserIdResponse {
  provider: Provider;
}

export interface ProvidersCountResponse {
  count: number;
}

export interface KYC {
  id: number;
  nationalIdUrl: string;
  selfieUrl: string;
  user: User;
  status: string; // 'PENDING' | 'FAILED' | 'VERIFIED' | 'INPROGRESS' | 'COMPLETED'
  createdAt: string;
}

export interface GetAllKycResponse extends PaginatedResponse {
  kyc: KYC[];
}

export interface UpdateKycStatusRequest {
  status: string; // 'PENDING' | 'FAILED' | 'VERIFIED' | 'INPROGRESS' | 'COMPLETED'
}

export interface UpdateKycStatusResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Contract and Express Offer Types
export interface Contract {
  id: number;
  opportunity: Opportunity;
  provider: Provider;
  contractStatus: 'CANCELLED' | 'PENDING' | 'INPROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface GetAllOffersResponse {
  contracts: Contract[];
}

export interface GetOffersByProviderResponse extends PaginatedResponse {
  contracts: Contract[];
}

export interface GetOffersByOpportunityResponse extends PaginatedResponse {
  contracts: Contract[];
}

export interface GetOffersByProviderAndStatusResponse extends PaginatedResponse {
  contracts: Contract[];
}

export interface GetProviderActiveAndInProgressOffersResponse extends PaginatedResponse {
  contracts: Contract[];
}

export interface ExpressOffer {
  id: number;
  user: User;
  provider: Provider;
  budget: number;
  title: string;
  description: string;
  createdAt: string;
  isAcceptedByProvider: boolean;
  status: 'CANCELLED' | 'INPROGRESS' | 'COMPLETED' | 'PENDING';
  confirmedByProvider: boolean;
}

export interface GetOffersByUserAndStatusResponse extends PaginatedResponse {
  offers: ExpressOffer[];
}

export interface GetOffersByProviderAndStatusExpressResponse extends PaginatedResponse {
  offers: ExpressOffer[];
}
