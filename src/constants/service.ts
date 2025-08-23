// Service constants
export const SERVICE_CONSTANTS = {
  MAX_QUANTITY: 10,
  MIN_QUANTITY: 1,
} as const;

// Service validation messages
export const SERVICE_MESSAGES = {
  MAX_QUANTITY_EXCEEDED: 'Số lượng tối đa cho mỗi dịch vụ là 10',
  MIN_QUANTITY_REQUIRED: 'Số lượng tối thiểu là 1',
  QUANTITY_LIMIT_HINT: 'Tối đa 10 lần cho mỗi dịch vụ',
} as const;

