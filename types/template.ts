// Define the contract template structure
export interface ContractTemplate {
  id: string
  name: string
  description: string
  contractType: string
  responsibilities: string
  defaultDuration?: number // in days
  isDefault?: boolean
  isCustom?: boolean
  createdAt?: string
  updatedAt?: string
  importedAt?: string
  category: string
  version: number
  versionHistory?: TemplateVersion[]
  createdBy?: string
  lastModifiedBy?: string
  // Approval related fields
  approvalStatus: ApprovalStatus
  approvalRequestedAt?: string
  approvalRequestedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  approvalComments?: string
  isPublished: boolean
}

// Define template version structure
export interface TemplateVersion {
  id: string
  templateId: string
  version: number
  name: string
  description: string
  contractType: string
  responsibilities: string
  defaultDuration?: number
  category: string
  createdAt: string
  createdBy?: string
  changeNotes?: string
  approvalStatus?: ApprovalStatus
}

// Define approval status enum
export enum ApprovalStatus {
  Draft = "draft",
  PendingApproval = "pending_approval",
  Approved = "approved",
  Rejected = "rejected",
}

// Define user roles
export enum UserRole {
  User = "user",
  Approver = "approver",
  Admin = "admin",
}

// Define template categories
export const templateCategories = [
  { id: "general", name: "General", icon: "FileText" },
  { id: "employment", name: "Employment", icon: "Briefcase" },
  { id: "services", name: "Services", icon: "Wrench" },
  { id: "consulting", name: "Consulting", icon: "Users" },
  { id: "legal", name: "Legal", icon: "Scale" },
  { id: "financial", name: "Financial", icon: "DollarSign" },
  { id: "real-estate", name: "Real Estate", icon: "Home" },
  { id: "other", name: "Other", icon: "MoreHorizontal" },
]

// Sample predefined templates
export const predefinedTemplates: ContractTemplate[] = [
  {
    id: "assignment-standard",
    name: "Standard Assignment",
    description: "Standard assignment contract for general work",
    contractType: "Assignment",
    responsibilities:
      "1. The Second Party agrees to complete all assigned tasks according to specifications.\n2. The First Party agrees to provide necessary resources and information.\n3. All work produced shall be the property of the First Party.\n4. The Second Party shall maintain confidentiality of all information shared.",
    defaultDuration: 30,
    isDefault: true,
    category: "general",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
  // Other predefined templates with similar approval fields...
  {
    id: "hourly-consulting",
    name: "Hourly Consulting",
    description: "Hourly rate consulting contract",
    contractType: "Hourly",
    responsibilities:
      "1. The Second Party shall provide consulting services at an hourly rate.\n2. Hours worked shall be documented and submitted weekly.\n3. The First Party shall review and approve hours before payment.\n4. The Second Party shall be available during business hours for consultation.",
    defaultDuration: 90,
    isDefault: true,
    category: "consulting",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
  {
    id: "fixed-project",
    name: "Fixed Price Project",
    description: "Fixed price contract for defined project scope",
    contractType: "Fixed",
    responsibilities:
      "1. The Second Party shall deliver the project as defined in the attached scope document.\n2. Payment shall be made according to the milestone schedule.\n3. Any changes to the scope shall require written approval and may affect the price.\n4. The Second Party shall provide weekly progress updates.",
    defaultDuration: 60,
    isDefault: true,
    category: "services",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
  {
    id: "retainer-services",
    name: "Monthly Retainer",
    description: "Monthly retainer for ongoing services",
    contractType: "Retainer",
    responsibilities:
      "1. The Second Party shall provide ongoing services as needed.\n2. A fixed monthly fee shall be paid regardless of usage.\n3. Services beyond the agreed scope shall be billed separately.\n4. Either party may terminate with 30 days notice.",
    defaultDuration: 180,
    isDefault: true,
    category: "services",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
  {
    id: "employment-contract",
    name: "Employment Agreement",
    description: "Standard employment contract",
    contractType: "Assignment",
    responsibilities:
      "1. The Employee agrees to work for the Employer in the position specified.\n2. The Employee shall receive the agreed-upon salary and benefits.\n3. The Employee shall adhere to all company policies and procedures.\n4. Either party may terminate employment with proper notice as specified.",
    defaultDuration: 365,
    isDefault: true,
    category: "employment",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
  {
    id: "legal-services",
    name: "Legal Services Agreement",
    description: "Contract for legal representation and services",
    contractType: "Retainer",
    responsibilities:
      "1. The Attorney agrees to provide legal representation to the Client.\n2. The Client agrees to pay the Attorney the specified fees.\n3. The Attorney shall maintain client confidentiality.\n4. The Client shall provide truthful and complete information.",
    defaultDuration: 180,
    isDefault: true,
    category: "legal",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
  {
    id: "real-estate-lease",
    name: "Property Lease Agreement",
    description: "Contract for leasing real estate property",
    contractType: "Fixed",
    responsibilities:
      "1. The Landlord agrees to lease the property to the Tenant.\n2. The Tenant agrees to pay the specified rent on time.\n3. The Tenant shall maintain the property in good condition.\n4. The Landlord shall provide necessary repairs and maintenance.",
    defaultDuration: 365,
    isDefault: true,
    category: "real-estate",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
  {
    id: "financial-loan",
    name: "Loan Agreement",
    description: "Contract for financial loan between parties",
    contractType: "Fixed",
    responsibilities:
      "1. The Lender agrees to loan the specified amount to the Borrower.\n2. The Borrower agrees to repay the loan with interest as specified.\n3. The Borrower shall provide collateral as agreed.\n4. The Lender may take legal action in case of default.",
    defaultDuration: 365,
    isDefault: true,
    category: "financial",
    version: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    createdBy: "System",
    approvalStatus: ApprovalStatus.Approved,
    isPublished: true,
    approvedAt: "2023-01-01T00:00:00.000Z",
    approvedBy: "System",
  },
]
