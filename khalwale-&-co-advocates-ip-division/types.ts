
export interface UserInfo {
  name: string;
  email: string;
  whatsapp: string;
}

export interface AnalysisResult {
  summary: string;
  jurisdictionAnalysis: {
    kenya: string;
    us: string;
    uk: string;
  };
  redFlags: string[];
  recommendations: string[];
  fullMarkdown: string;
}

export enum AppState {
  LANDING,
  ARTIST_EDU,
  PRODUCER_EDU,
  DETAILS_FORM,
  UPLOAD,
  ANALYZING,
  RESULTS,
  PAYMENT,
  CONSULT_FORM,
  GENERATING_BRIEF,
  BOOKING,
  ERROR,
  QUIZ_INTRO,
  QUIZ_GAME,
  QUIZ_RESULTS,
  CERTIFICATE
}

export interface ContractFile {
  name: string;
  type: string;
  base64: string; 
  mimeType: string;
}

export interface CaseFile {
  id: string;
  createdDate: string;
  clientComplaints: string;
  attorneyBrief: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourceUrl: string; // New field for study links
}

export type QuizCategory = 'Music Business' | 'Film Industry' | 'Publishing' | 'Production' | 'Artist Rights';
