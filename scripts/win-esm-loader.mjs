/**
 * Custom Node.js loader for Windows ESM compatibility.
 *
 * Node.js 24 introduces stricter ESM URL validation.
 * This loader converts native Windows paths (like E:\path\to\file)
 * to proper file:/// URLs when they appear as import specifiers.
 *
 * It preserves bare module specifiers (like 'vite', 'electron')
 * which should be resolved by Node.js's native module resolution.
 */
export async function resolve(specifier, context, nextResolve) {
  // Only convert if the specifier is a bare Windows path starting with drive letter
  // AND contains path separators (to distinguish from bare module names)
  if (/^[a-zA-Z]:\\/.test(specifier) || /^[a-zA-Z]:\//.test(specifier)) {
    specifier = new URL(`file:///${specifier.replace(/\\/g, '/')}`).href
  }
  return nextResolve(specifier, context)
}
