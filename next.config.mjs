const isGitHubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/queen" : "",
  assetPrefix: isGitHubPages ? "/queen/" : "",
  trailingSlash: isGitHubPages,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
