import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => 'div',
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.WORDPRESS_URL = 'https://example.com'
process.env.WOOCOMMERCE_CONSUMER_KEY = 'test_key'
process.env.WOOCOMMERCE_CONSUMER_SECRET = 'test_secret'
process.env.NEXTAUTH_SECRET = 'test_secret'

// Mock fetch globally
global.fetch = jest.fn()

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})