/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    eslint: {
        dirs: ['src', 'tests']
    }
};

export default nextConfig;
