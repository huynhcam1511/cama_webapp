export function orderDepartment(category: string): 'VAY' | 'SUOT' | null {
  const value = String(category || '').toLocaleLowerCase('vi');
  if (/vest|suit|suốt/.test(value)) return 'SUOT';
  if (/váy|vay|dress/.test(value)) return 'VAY';
  return null;
}

export function orderDepartmentLabel(value?: string | null) {
  return value === 'VAY' ? 'Phòng Váy' : value === 'SUOT' ? 'Phòng Suit' : 'Chưa phân phòng';
}
