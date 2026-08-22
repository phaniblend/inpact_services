/**
 * Build a map of local callable name -> required parameter count from TS/JS source
 * (module or class body). Used by template/JSX arity guards.
 */

import {
  RESERVED_CALLEE,
  matchingCloseParen,
  countRequiredParams,
} from "./callArityCore.js";

/**
 * @param {string} block
 * @returns {Map<string, number>}
 */
export function collectCallableAritiesFromBlock(block) {
  const map = new Map();
  if (typeof block !== "string") return map;

  // Field / assignment arrow: name = (params) =>
  const arrowField = /\b([a-zA-Z_$][\w$]*)\s*=\s*\(/g;
  let mm;
  while ((mm = arrowField.exec(block)) !== null) {
    const name = mm[1];
    if (RESERVED_CALLEE.has(name)) continue;
    const openIdx = mm.index + mm[0].length - 1;
    const closeIdx = matchingCloseParen(block, openIdx);
    if (closeIdx === -1) continue;
    const params = block.slice(openIdx + 1, closeIdx);
    const after = block.slice(closeIdx + 1).trimStart();
    if (!after.startsWith("=>")) continue;
    map.set(name, countRequiredParams(params));
  }

  // const name = (params) =>
  const constArrow = /\b(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*\(/g;
  while ((mm = constArrow.exec(block)) !== null) {
    const name = mm[1];
    if (RESERVED_CALLEE.has(name)) continue;
    if (map.has(name)) continue;
    const openIdx = mm.index + mm[0].length - 1;
    const closeIdx = matchingCloseParen(block, openIdx);
    if (closeIdx === -1) continue;
    const params = block.slice(openIdx + 1, closeIdx);
    const after = block.slice(closeIdx + 1).trimStart();
    if (!after.startsWith("=>")) continue;
    map.set(name, countRequiredParams(params));
  }

  // function name(params)
  const funcDecl = /\bfunction\s+([a-zA-Z_$][\w$]*)\s*\(/g;
  while ((mm = funcDecl.exec(block)) !== null) {
    const name = mm[1];
    if (RESERVED_CALLEE.has(name)) continue;
    if (map.has(name)) continue;
    const openIdx = mm.index + mm[0].length - 1;
    const closeIdx = matchingCloseParen(block, openIdx);
    if (closeIdx === -1) continue;
    const params = block.slice(openIdx + 1, closeIdx);
    map.set(name, countRequiredParams(params));
  }

  // Method style: name(params) { or name(params): Return
  const methodLike = /\b([a-zA-Z_$][\w$]*)\s*\(/g;
  while ((mm = methodLike.exec(block)) !== null) {
    const name = mm[1];
    if (RESERVED_CALLEE.has(name)) continue;
    if (map.has(name)) continue;
    const openIdx = mm.index + mm[0].length - 1;
    const closeIdx = matchingCloseParen(block, openIdx);
    if (closeIdx === -1) continue;
    const params = block.slice(openIdx + 1, closeIdx);
    const after = block.slice(closeIdx + 1).trimStart();
    if (!after.startsWith("{") && !/^[:\n\r\t ]/.test(after)) continue;
    map.set(name, countRequiredParams(params));
  }

  return map;
}
