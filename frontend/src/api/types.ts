// Types that mirror the backend DTOs (insurance-api NestJS)

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
}

/** Mirrors backend UpdateCustomerDto (PartialType of CreateCustomerDto). */
export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
}

export type PolicyBranch = 'AUTO' | 'LIFE' | 'HOME' | 'HEALTH';

export type RatingStrategyName = 'STANDARD' | 'RISK_BASED' | 'LOYALTY';

export type PolicyStatus =
  | 'QUOTED'
  | 'ISSUED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface CreatePolicyRequest {
  customerId: string;
  branch: PolicyBranch;
  ratingStrategy: RatingStrategyName;
  riskProfile: Record<string, unknown>;
}

export interface PolicyResponse {
  id: string;
  policyNumber: string;
  customerId: string;
  branch: PolicyBranch;
  ratingStrategy: RatingStrategyName;
  status: PolicyStatus;
  coverage: Record<string, unknown>;
  monthlyPremium: number;
  riskProfile: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
}
