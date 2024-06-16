export function getRandomHexColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 8)];
  }
  return color;
}

export function generateProfilePictureUrl(
  initials: string,
  size: number = 128
): string {
  const backgroundColor = getRandomHexColor();
  const color = "fff"; // White font color for better contrast
  const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&size=${size}&background=${backgroundColor}&color=${color}`;
  return url;
}
