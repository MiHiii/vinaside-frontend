export enum RefundMethod {
  BANK_TRANSFER = "bank_transfer",
  WALLET = "wallet",
  CREDIT_CARD = "credit_card",
}

export interface CancelBookingFormData {
  cancellationReason?: string;
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
  refundMethod?: RefundMethod;
  refundNote?: string;
  policyAgreement: boolean;
}

export interface CancelPolicyInfo {
  policyType: string;
  description: string;
  refundPercent: number;
  daysBeforeCheckIn: number;
  refundableAmount: number;
}

export interface CancelBookingResponse {
  policyInfo: CancelPolicyInfo;
  success: boolean;
  message: string;
}
