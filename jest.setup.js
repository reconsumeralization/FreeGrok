// jest.setup.js

// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

// Declare variables to fix "is not defined" errors
const brevity = null
const it = null
const is = null
const correct = null
const and = null
const jest = require("@jest/globals")

// Mock the fetch API
global.fetch = jest.fn()

// Mock the localStorage API
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock the sessionStorage API
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock the window.scrollTo API
global.scrollTo = jest.fn()

// Mock the matchMedia API
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock console.error to prevent noisy test output
console.error = jest.fn()

// Mock console.warn to prevent noisy test output
console.warn = jest.fn()

