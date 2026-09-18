import '@testing-library/jest-dom/vitest';
import { vi as vitestMock } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  value: vitestMock.fn().mockImplementation((query: string) => ({
    addEventListener: vitestMock.fn(),
    addListener: vitestMock.fn(),
    dispatchEvent: vitestMock.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vitestMock.fn(),
    removeListener: vitestMock.fn(),
  })),
  writable: true,
});
class TestResizeObserver {
  observe = vitestMock.fn();
  unobserve = vitestMock.fn();
  disconnect = vitestMock.fn();
}
window.ResizeObserver = TestResizeObserver;
window.HTMLElement.prototype.scrollIntoView = vitestMock.fn();
