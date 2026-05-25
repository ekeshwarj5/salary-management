/**
 * Output contracts for the insights endpoints. Shared so the client
 * and server agree on the shape; the server produces these, the
 * client consumes them.
 */

export interface CountrySalaryInsight {
  country: string;
  currency: string;
  count: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
}

export interface TitleSalaryInsight {
  country: string;
  jobTitle: string;
  currency: string;
  count: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
}

export interface OverviewInsight {
  totalCount: number;
  countriesRepresented: number;
  jobTitlesRepresented: number;
  topCountriesByHeadcount: Array<{ country: string; count: number }>;
  topJobTitlesByHeadcount: Array<{ jobTitle: string; count: number }>;
}
