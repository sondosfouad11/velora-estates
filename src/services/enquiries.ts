export type InquiryTopic = 'buying' | 'selling' | 'renting' | 'general';
export type ViewingTime = 'morning' | 'afternoon' | 'evening';

export interface InquiryPayload {
  propertyId?: number | null;
  name: string;
  email: string;
  phone?: string;
  topic: InquiryTopic;
  message: string;
  consent: boolean;
  website?: string; // honeypot, must stay empty
}

export interface ViewingPayload {
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: ViewingTime;
  message?: string;
  consent: boolean;
  website?: string;
}

export interface SubmissionResult {
  id: number;
  message: string;
}

/**
 * The site has no server, so the forms are validated in the browser and confirmed on screen only.
 * To receive real enquiries, replace the body of these two functions with a call to a form service or an API.
 */
const confirm = (message: string): Promise<SubmissionResult> =>
  new Promise((resolve) => setTimeout(() => resolve({ id: Date.now(), message }), 600));

export const enquiriesApi = {
  sendInquiry(payload: InquiryPayload) {
    if (payload.website) return Promise.reject(new Error('Submission rejected.'));
    return confirm('Thank you. This is a concept website, so nothing was actually sent to an agent. On a live site you would hear back within one working day.');
  },
  requestViewing(payload: ViewingPayload) {
    if (payload.website) return Promise.reject(new Error('Submission rejected.'));
    return confirm('Thank you. This is a concept website, so nothing was actually sent. On a live site the listing agent would confirm a time by email.');
  },
};
