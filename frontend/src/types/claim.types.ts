export interface AIResult {
  damage_location: string;
  severity: string;
  fraud_risk: "Low" | "Medium" | "High";
  confidence_score: number;
  observations: string;
  recommended_action: "Approve" | "Investigate" | "Reject";
}

export interface Claim {
  id: string;
  submitted_at: string;
  customer_name: string;
  customer_email: string;
  claim_amount: number;
  damage_desc: string;
  status: "PENDING" | "ANALYSED" | "APPROVED" | "REJECTED";
  policy_path: string;
  image_paths: string;
  ai_result?: AIResult | null;
}

export interface SubmitClaimResponse {
  claim_id: string;
  ai_result: AIResult;
}

export interface Metrics {
  total_claims: number;
  pending_claims: number;
  analysed_claims: number;
  approved_claims: number;
  fraud_claims: number;
  money_saved: number;
  hours_saved: number;
}