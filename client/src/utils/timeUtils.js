export const formatTimeLeft = (endTime) => {
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  const distance = end - now;

  if (distance <= 0) {
    return 'Ended';
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  if (parts.length === 0) {
    return '< 1m';
  }

  return parts.join(' ');
}; 