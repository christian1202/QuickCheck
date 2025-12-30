import { differenceInYears, parseISO } from "date-fns";
//import { UserProfile } from "../types";

export function calculateAge(birthdateString?: string): number | null {
  if (!birthdateString) return null;
  return differenceInYears(new Date(), parseISO(birthdateString));
}

export function getUserCategory(age: number | null): 'Senior' | 'Junior' | 'N/A' {
  if (age === null) return 'N/A';
  return age >= 25 ? 'Senior' : 'Junior';
}