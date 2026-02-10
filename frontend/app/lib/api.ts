export const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined. Check Vercel environment variables."
    );
  }

  return url.replace(/\/$/, ""); // remove trailing slash
})();