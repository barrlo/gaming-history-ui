/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    eslint: {
        dirs: ['src', 'tests']
    }
};

export default nextConfig;
