interface BrandLogoProps {
  /** Text colour tone. "dark" for light backgrounds, "blue" for camera/dark screens. */
  tone?: "dark" | "blue";
}

export default function BrandLogo({ tone = "dark" }: BrandLogoProps) {
  return (
    <div className={`brand brand-${tone}`} aria-label="KitaKita">
      <span>Kita</span>
      <span>Kita</span>
    </div>
  );
}
