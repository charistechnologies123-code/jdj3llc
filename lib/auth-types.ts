export type AuthAddress = {
  id: string;
  label: string;
  recipientName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatarPath?: string;
  role: "ADMIN" | "CUSTOMER";
  referralCode: string;
  referredByUserId: string | null;
  addresses: AuthAddress[];
};

export type ReferralActivity = {
  id: string;
  referralCode: string;
  status: "REGISTERED" | "ORDERED";
  referredUserName: string | null;
  referredUserEmail: string | null;
  orderNumber: string | null;
  createdAt: string;
};
