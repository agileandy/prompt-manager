
export const formatDate = (isoDateString: string | null): string => {
  if (!isoDateString) return 'N/A';
  try {
    return new Date(isoDateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};
