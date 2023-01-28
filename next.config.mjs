/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    basePath: "/game",
    async redirects() {
        return [
            {
                source: '/',
                destination: '/game',
                basePath: false,
                permanent: false
            }
        ]
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'static.justboil.me',
            },
        ],
    },
}

export default nextConfig