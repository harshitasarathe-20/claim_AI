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