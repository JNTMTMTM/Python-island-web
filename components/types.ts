export type ViewState = 'hero' | 'features' | 'branches' | 'downloads' | 'developers';
export type Phase = 'idle' | 'transitioning';

export interface Developer {
  id: string;
  name: string;
  nameEn: string;
  dockLabel: string;
  email: string;
  bio: string;
  traits: { icon: string; label: string; desc: string }[];
  skills: { label: string }[];
}
