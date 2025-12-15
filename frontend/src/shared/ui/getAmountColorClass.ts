export const getAmountColorClass = (amount: number) => {
  if (amount > 0) return 'bg-green-300';
  if (amount === 0) return 'bg-yellow-200';
  return 'bg-red-300';
};
