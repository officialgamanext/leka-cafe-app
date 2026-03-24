export const APIEndpoints = {
  // baseURL: "https://leka-cafe-api.vercel.app/api", // Production
  // baseURL: "https://cafe-billing-api.vercel.app/api" // Staging
  baseURL: "http://localhost:3000/api", // Development
  auth: {
    sendOtp: "/auth/initiate",
    verifyOtp: "/auth/verify",
    refreshToken: "/auth/refresh",
  },
  business: {
    list: "/tenants",
    create: "/tenants/create",
    update: "/tenants/:tenantId",
    addUser: "/tenants/:tenantId/users",
    deleteUser: "/tenants/:tenantId/users/:userId",
  },
  dashboard: {
    summary: "/tenants/:tenantId/dashboard/summary",
  },
  products: {
    list: "/tenants/:tenantId/products",
    update: "/tenants/:tenantId/products/:productId",
    create: "/tenants/:tenantId/products",
    delete: "/tenants/:tenantId/products/:productId",
  },
  categories: {
    list: "/tenants/:tenantId/categories",
    create: "/tenants/:tenantId/categories",
    update: "/tenants/:tenantId/categories/:categoryId",
  },
  invoices: {
    create: "/tenants/:tenantId/invoices",
    list: "/tenants/:tenantId/invoices",
    details: "/tenants/:tenantId/invoices/:invoiceId",
    filter: "/tenants/:tenantId/invoices/filter",
  },
};
