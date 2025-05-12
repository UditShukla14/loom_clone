import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint:{
    ignoreDuringBuilds:true,
  },
  typescript:{
    ignoreBuildErrors:true,
  },
  /* config options here */
  images:{
    remotePatterns:[
      {
        hostname:'loomcast.b-cdn.net',
        protocol:'https',
        pathname:'/**',
        port:''
      },
      {
        hostname:'lh3.googleusercontent.com',
        protocol:'https',
        pathname:'/**',
        port:''
      },
      
      
    ]
  }
};

export default nextConfig;
