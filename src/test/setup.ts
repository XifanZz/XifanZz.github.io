import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }),
})
