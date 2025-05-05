export default {
  // Use Convex Auth built-in provider
  providers: [
    {
      // Get the issuer URL from your Clerk JWT template
      domain: process.env.CLERK_ISSUER_URL,
      applicationID: "convex",
    },
  ],
  // Customize allowedDomains for additional security (optional)
  allowedDomains: []
}; 