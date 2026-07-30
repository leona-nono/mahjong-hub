/**
 * Test stub for the `server-only` package. The real module throws when
 * imported in a client bundle; under vitest we just want a no-op so server
 * utilities (validators, guards) can be unit-tested without the full Next
 * runtime.
 */
export {};
