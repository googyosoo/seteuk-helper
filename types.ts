export interface SeTeukAnalysis {
  keywords: string[];
  strengths: string;
  storyline: string;
}

export interface SeTeukResult {
  analysis: SeTeukAnalysis;
  draft: string;
}

export interface UploadedFile {
  data: string; // Base64 encoded string
  mimeType: string;
  name: string;
}

export interface SeTeukInput {
  activityData: string;
  teacherComments: string;
  lengthOption: string;
  emphasisKeywords: string[];
  files: UploadedFile[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}