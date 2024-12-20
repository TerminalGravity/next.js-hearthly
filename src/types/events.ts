export interface Event {
  id: string;
  title: string;
  host: string;
  date: Date;
  time: string;
  description?: string | null;
  familyId: string;
  family?: Family;
  rsvps?: Rsvp[];
}

export interface Family {
  id: string;
  familyName: string;
  members: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  user: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
  status: "YES" | "NO" | "MAYBE";
  user: User;
}

export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: User;
} 