export const isTruthy = (val: any): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    return s === 'true' || s === 'yes' || s === '1' || s === 'active' || s === 'on' || s === 'success';
  }
  if (typeof val === 'number') return val === 1;
  return !!val;
};

export const normalizePlan = (plan: any): string => {
  if (!plan) return 'free';
  const p = String(plan).trim();
  if (!p) return 'free';
  // Keep original casing or standardize as needed, but here we'll just return it if it has content
  return p;
};
