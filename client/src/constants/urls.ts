const API_URL = process.env.REACT_APP_API_URL;

const URLS = {
  // Auth
  AUTH_LOGIN: '/acme-ev/auth/login',

  // Dashboard
  DASHBOARD_ADMIN: '/acme-ev/dashboard/admin',
  DASHBOARD_BRANCH: '/acme-ev/dashboard/branch',

  // Vehicles
  VEHICLES: '/acme-ev/vehicles',
  VEHICLE_BY_VIN: (vin: string) => `/acme-ev/vehicles/${vin}`,
  VEHICLES_OWNER: '/acme-ev/vehicles/owner',
  VEHICLES_CLAIM: '/acme-ev/vehicles/claim',

  // GPS
  GPS_EVENTS: '/acme-ev/gps/events',
  GPS_EVENTS_DOWNLOAD: '/acme-ev/gps/events/download',

  // Status
  STATUS_EVENTS: '/acme-ev/status/events',
  STATUS_LATEST: (vin: string) => `/acme-ev/status/latest/${vin}`,
  STATUS_FAULTS: '/acme-ev/status/faults',

  // Users
  USERS: '/acme-ev/users',

  // Branches
  BRANCHES: '/acme-ev/branches',
};

export { API_URL, URLS };
