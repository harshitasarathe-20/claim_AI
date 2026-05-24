import axios from "axios";
import type { Claim, SubmitClaimResponse } from "../types/claim.types";

const BASE = "http://localhost:8000";

export const submitClaim = async (
  customerName: string,
  claimAmount: string,
  damageDesc: string,
  images: File[],
  policyPdf: File
): Promise<SubmitClaimResponse> => {
  const form = new FormData();
  form.append("customer_name", customerName);
  form.append("claim_amount", claimAmount);
  form.append("damage_desc", damageDesc);
  form.append("policy_pdf", policyPdf);
  images.forEach((img) => form.append("images", img));
  const res = await axios.post<SubmitClaimResponse>(`${BASE}/submit`, form);
  return res.data;
};

export const fetchClaims = async (): Promise<Claim[]> => {
  const res = await axios.get<Claim[]>(`${BASE}/claims`);
  return res.data;
};

export const updateAction = async (
  claimId: string,
  action: string
): Promise<void> => {
  await axios.post(`${BASE}/action`, { claim_id: claimId, action });
};
