export function getMyAdvertsPath(userId?: string): string {
  if (!userId) return "/listings/mine";
  return `/profile/adverts?guid=${encodeURIComponent(userId)}`;
}
