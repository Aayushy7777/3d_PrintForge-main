/**
 * Material gating — application-level rule (Task 1).
 *
 * The database keeps its generic `material` TEXT column so more materials
 * (PETG, ABS, Resin, Nylon, …) can be re-enabled later by simply adding
 * them to SUPPORTED_MATERIALS. For now the shop only prints PLA.
 */
export const SUPPORTED_MATERIALS = ['PLA'];

export const MATERIAL_ERROR_MESSAGE =
  'Only PLA material is currently supported. Other materials are coming soon.';

/**
 * Normalize a client-supplied material value.
 *
 * @param {unknown} input raw value from the request body (may be missing)
 * @returns {string|null} the normalized material ('PLA'), or null if the
 *                        value is present but not currently supported.
 */
export function normalizeMaterial(input) {
  // Missing value → default to PLA (the only option the UI offers).
  if (input === undefined || input === null || input === '') {
    return SUPPORTED_MATERIALS[0];
  }

  const value = String(input).trim().toUpperCase();
  return SUPPORTED_MATERIALS.includes(value) ? value : null;
}
