/**
 * Models for Organization Management functionality
 */

// Organization creation models
export interface OrganizationCreateRequest {
    name: string;
    logoUrl: string;
  }
  
  // Organization data model
  export interface Organization {
    GSI1PK: string;
    joinedAt: string;
    role: string;
    userId: string;
    SK: string;
    organizationName: string;
    GSI1SK: string;
    PK: string;
    type: string;
  }
  
  // Component props for CreateOrganizationCard
  export interface CreateOrganizationCardProps {
    onCreationSuccess: () => void;
  }
  
  // Component props for OrganizationsListCard
  export interface OrganizationsListCardProps {
    refreshTrigger: number;
  }