export const routes = {
  events: {
    list: "/events",
    new: "/events/new",
    detail: (id: string) => `/events/${id}`,
    edit: (id: string) => `/events/${id}/edit`,
  },
  families: {
    list: "/families",
    new: "/families/new",
    detail: (id: string) => `/families/${id}`,
    events: (id: string) => `/families/${id}/events`,
    members: (id: string) => `/families/${id}/members`,
    settings: (id: string) => `/families/${id}/settings`,
  },
  auth: {
    login: "/login",
    signup: "/signup",
    forgotPassword: "/forgot-password",
  },
  dashboard: "/dashboard",
} as const;

export type AppRoutes = typeof routes; 