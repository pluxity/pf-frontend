import { cn } from "../../../../utils";
import type { IconProps } from "../../types";
import { iconSizes } from "../../types";

export function Sunny({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <circle cx="54.5" cy="31.5" r="25.5" fill="url(#sunny_glow)" fillOpacity="0.4" />
      <path
        d="M51.3244 10.7226C53.0345 8.86624 55.9655 8.86624 57.6756 10.7226C58.807 11.9507 60.545 12.4164 62.1387 11.9185C64.5479 11.1659 67.0863 12.6314 67.6391 15.0941C68.0048 16.7233 69.2771 17.9956 70.9063 18.3613C73.369 18.9142 74.8345 21.4525 74.0819 23.8617C73.584 25.4555 74.0497 27.1935 75.2778 28.3248C77.1342 30.0349 77.1342 32.9659 75.2778 34.676C74.0497 35.8073 73.584 37.5453 74.0819 39.1391C74.8345 41.5483 73.369 44.0866 70.9063 44.6394C69.2771 45.0051 68.0048 46.2774 67.6391 47.9066C67.0863 50.3694 64.5479 51.8349 62.1387 51.0823C60.545 50.5844 58.807 51.0501 57.6756 52.2781C55.9655 54.1345 53.0345 54.1345 51.3244 52.2781C50.1931 51.0501 48.4551 50.5844 46.8613 51.0823C44.4521 51.8349 41.9138 50.3694 41.361 47.9066C40.9953 46.2774 39.723 45.0051 38.0938 44.6394C35.631 44.0866 34.1655 41.5483 34.9182 39.1391C35.416 37.5453 34.9503 35.8073 33.7223 34.676C31.8659 32.9659 31.8659 30.0349 33.7223 28.3248C34.9503 27.1935 35.416 25.4555 34.9182 23.8617C34.1655 21.4525 35.631 18.9142 38.0938 18.3613C39.723 17.9956 40.9953 16.7233 41.361 15.0941C41.9138 12.6314 44.4521 11.1659 46.8613 11.9185C48.4551 12.4164 50.1931 11.9507 51.3244 10.7226Z"
        fill="url(#sunny_radial)"
      />
      <defs>
        <linearGradient id="sunny_glow" x1="67.8875" y1="9.825" x2="42.7062" y2="54.7687" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFDB11" />
          <stop offset="1" stopColor="#FFDB11" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sunny_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(47.5262 21.2231) rotate(50.6307) scale(37.0334)">
          <stop stopColor="#FFDB11" />
          <stop offset="1" stopColor="#FFBC0B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Cloudy({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M35.8222 46.9999H9.64444V32.5332H35.8222V46.9999Z" fill="#CDD0D5" />
      <circle cx="9.98889" cy="37.0113" r="9.98889" fill="#CDD0D5" />
      <circle cx="24.1111" cy="29.0889" r="13.0889" fill="#CDD0D5" />
      <circle cx="34.7889" cy="35.6333" r="11.3667" fill="#CDD0D5" />
      <path d="M63.6667 68.0005H22.2889V45.1338H63.6667V68.0005Z" fill="#D3D5DD" />
      <circle cx="22.8333" cy="52.2108" r="15.7889" fill="url(#cloudy_r1)" />
      <circle cx="45.1556" cy="39.6889" r="20.6889" fill="url(#cloudy_r2)" />
      <circle cx="62.0333" cy="50.0331" r="17.9667" fill="url(#cloudy_r3)" />
      <defs>
        <radialGradient id="cloudy_r1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14.6667 43.4997) rotate(37.9716) scale(28.3163)">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#D0D2DA" />
        </radialGradient>
        <radialGradient id="cloudy_r2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(35.3556 24.9889) rotate(48.8822) scale(37.4784 46.1762)">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#D0D2DA" />
        </radialGradient>
        <radialGradient id="cloudy_r3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(56.0444 40.2331) rotate(51.1702) scale(28.6545)">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#D0D2DA" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function PartlyCloudy({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M35.8222 50.9999H9.64444V36.5332H35.8222V50.9999Z" fill="#CDD0D5" />
      <circle cx="9.98889" cy="41.0113" r="9.98889" fill="#CDD0D5" />
      <circle cx="24.1111" cy="33.0889" r="13.0889" fill="#CDD0D5" />
      <circle cx="34.7889" cy="39.6333" r="11.3667" fill="#CDD0D5" />
      <circle cx="54.5" cy="31.5" r="25.5" fill="url(#pc_glow)" fillOpacity="0.4" />
      <path
        d="M51.3244 10.7226C53.0345 8.86624 55.9655 8.86624 57.6756 10.7226C58.807 11.9507 60.545 12.4164 62.1387 11.9185C64.5479 11.1659 67.0863 12.6314 67.6391 15.0941C68.0048 16.7233 69.2771 17.9956 70.9063 18.3613C73.369 18.9142 74.8345 21.4525 74.0819 23.8617C73.584 25.4555 74.0497 27.1935 75.2778 28.3248C77.1342 30.0349 77.1342 32.9659 75.2778 34.676C74.0497 35.8073 73.584 37.5453 74.0819 39.1391C74.8345 41.5483 73.369 44.0866 70.9063 44.6394C69.2771 45.0051 68.0048 46.2774 67.6391 47.9066C67.0863 50.3694 64.5479 51.8349 62.1387 51.0823C60.545 50.5844 58.807 51.0501 57.6756 52.2781C55.9655 54.1345 53.0345 54.1345 51.3244 52.2781C50.1931 51.0501 48.4551 50.5844 46.8613 51.0823C44.4521 51.8349 41.9138 50.3694 41.361 47.9066C40.9953 46.2774 39.723 45.0051 38.0938 44.6394C35.631 44.0866 34.1655 41.5483 34.9182 39.1391C35.416 37.5453 34.9503 35.8073 33.7223 34.676C31.8659 32.9659 31.8659 30.0349 33.7223 28.3248C34.9503 27.1935 35.416 25.4555 34.9182 23.8617C34.1655 21.4525 35.631 18.9142 38.0938 18.3613C39.723 17.9956 40.9953 16.7233 41.361 15.0941C41.9138 12.6314 44.4521 11.1659 46.8613 11.9185C48.4551 12.4164 50.1931 11.9507 51.3244 10.7226Z"
        fill="url(#pc_sun)"
      />
      <path d="M58.7334 72.0003H22.4222V51.9336H58.7334V72.0003Z" fill="#D3D5DD" />
      <circle cx="22.9" cy="58.1446" r="13.8556" fill="url(#pc_c1)" />
      <circle cx="42.4889" cy="47.1556" r="18.1556" fill="url(#pc_c2)" />
      <circle cx="57.3" cy="56.2335" r="15.7667" fill="url(#pc_c3)" />
      <defs>
        <linearGradient id="pc_glow" x1="67.8875" y1="9.825" x2="42.7062" y2="54.7687" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFDB11" />
          <stop offset="1" stopColor="#FFDB11" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pc_sun" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(47.5262 21.2231) rotate(50.6307) scale(37.0334)">
          <stop stopColor="#FFDB11" />
          <stop offset="1" stopColor="#FFBC0B" />
        </radialGradient>
        <radialGradient id="pc_c1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(15.7333 50.5002) rotate(37.9716) scale(24.8491)">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#D0D2DA" />
        </radialGradient>
        <radialGradient id="pc_c2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(33.8889 34.2556) rotate(48.8822) scale(32.8893 40.522)">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#D0D2DA" />
        </radialGradient>
        <radialGradient id="pc_c3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(52.0444 47.6335) rotate(51.1702) scale(25.1458)">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#D0D2DA" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Rainy({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="35.3087" y="38" width="4" height="39" rx="2" transform="rotate(38.5574 35.3087 38)" fill="url(#rainy_l1)" />
      <rect x="54.2849" y="44.3867" width="4" height="39" rx="2" transform="rotate(38.5574 54.2849 44.3867)" fill="url(#rainy_l2)" />
      <path d="M60.9851 55.3131H17.8806V31.4922H60.9851V55.3131Z" fill="#BDC3CD" />
      <circle cx="18.4478" cy="38.8657" r="16.4478" fill="url(#rainy_c1)" />
      <circle cx="41.7015" cy="25.8208" r="21.5522" fill="url(#rainy_c2)" />
      <circle cx="59.2836" cy="36.5973" r="18.7164" fill="url(#rainy_c3)" />
      <rect x="21.0757" y="40" width="4" height="29" rx="2" transform="rotate(38.5574 21.0757 40)" fill="url(#rainy_l3)" />
      <rect x="47.2471" y="38.7764" width="4" height="29" rx="2" transform="rotate(38.5574 47.2471 38.7764)" fill="url(#rainy_l4)" />
      <rect x="27.3015" y="63.7998" width="4" height="9" rx="2" transform="rotate(38.5574 27.3015 63.7998)" fill="url(#rainy_l5)" />
      <rect x="67.5553" y="42" width="4" height="29" rx="2" transform="rotate(38.5574 67.5553 42)" fill="url(#rainy_l6)" />
      <rect x="47.6097" y="67.0234" width="4" height="9" rx="2" transform="rotate(38.5574 47.6097 67.0234)" fill="url(#rainy_l7)" />
      <defs>
        <linearGradient id="rainy_l1" x1="37.3087" y1="38" x2="37.3087" y2="77" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <linearGradient id="rainy_l2" x1="56.2849" y1="44.3867" x2="56.2849" y2="83.3867" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <radialGradient id="rainy_c1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12.9652 29.8942) rotate(51.1702) scale(26.2321)">
          <stop stopColor="#D0D2DA" />
          <stop offset="1" stopColor="#BDC3CD" />
        </radialGradient>
        <radialGradient id="rainy_c2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34.5175 14.065) rotate(51.1702) scale(34.3731)">
          <stop stopColor="#D0D2DA" />
          <stop offset="1" stopColor="#BDC3CD" />
        </radialGradient>
        <radialGradient id="rainy_c3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(53.0448 26.3883) rotate(51.1702) scale(29.8503)">
          <stop stopColor="#D0D2DA" />
          <stop offset="1" stopColor="#BDC3CD" />
        </radialGradient>
        <linearGradient id="rainy_l3" x1="23.0757" y1="40" x2="23.0757" y2="69" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <linearGradient id="rainy_l4" x1="49.2471" y1="38.7764" x2="49.2471" y2="67.7764" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <linearGradient id="rainy_l5" x1="29.3015" y1="63.7998" x2="29.3015" y2="72.7998" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <linearGradient id="rainy_l6" x1="69.5553" y1="42" x2="69.5553" y2="71" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <linearGradient id="rainy_l7" x1="49.6097" y1="67.0234" x2="49.6097" y2="76.0234" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Stormy({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="22.4199" y="36.4893" width="4" height="39" rx="2" fill="url(#stormy_l1)" />
      <path d="M60.9851 55.3131H17.8806V31.4922H60.9851V55.3131Z" fill="#BDC3CD" />
      <circle cx="18.4478" cy="38.8657" r="16.4478" fill="url(#stormy_c1)" />
      <circle cx="41.7015" cy="25.8208" r="21.5522" fill="url(#stormy_c2)" />
      <circle cx="59.2836" cy="36.5973" r="18.7164" fill="url(#stormy_c3)" />
      <rect x="12.5635" y="49.9727" width="4" height="29" rx="2" fill="url(#stormy_l2)" />
      <rect x="32.1806" y="38.6064" width="4" height="29" rx="2" fill="url(#stormy_l3)" />
      <rect x="32.2896" y="70.6064" width="4" height="9" rx="2" fill="url(#stormy_l4)" />
      <path d="M64.75 32.5996L42 55.3123H55.125L48.5625 70.5996L70 49.1973H59.5L64.75 32.5996Z" fill="url(#stormy_bolt)" />
      <defs>
        <linearGradient id="stormy_l1" x1="24.4199" y1="36.4893" x2="24.4199" y2="75.4893" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <radialGradient id="stormy_c1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12.9652 29.8942) rotate(51.1702) scale(26.2321)">
          <stop stopColor="#D0D2DA" />
          <stop offset="1" stopColor="#BDC3CD" />
        </radialGradient>
        <radialGradient id="stormy_c2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(34.5175 14.065) rotate(51.1702) scale(34.3731)">
          <stop stopColor="#D0D2DA" />
          <stop offset="1" stopColor="#BDC3CD" />
        </radialGradient>
        <radialGradient id="stormy_c3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(53.0448 26.3883) rotate(51.1702) scale(29.8503)">
          <stop stopColor="#D0D2DA" />
          <stop offset="1" stopColor="#BDC3CD" />
        </radialGradient>
        <linearGradient id="stormy_l2" x1="14.5635" y1="49.9727" x2="14.5635" y2="78.9727" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <linearGradient id="stormy_l3" x1="34.1806" y1="38.6064" x2="34.1806" y2="67.6064" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <linearGradient id="stormy_l4" x1="34.2896" y1="70.6064" x2="34.2896" y2="79.6064" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="1" stopColor="#90C3FC" />
        </linearGradient>
        <radialGradient id="stormy_bolt" cx="0" cy="0" r="1" gradientTransform="matrix(13.5758 22.4545 -16.5455 18.4242 51.9697 43.539)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFDB11" />
          <stop offset="1" stopColor="#FFBC0B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Snowy({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M39.369 22C41.2482 22 42.7721 23.5232 42.7723 25.4023V28.9014L45.5087 26.166C46.306 25.3688 47.5981 25.3687 48.3954 26.166C49.1926 26.9633 49.1926 28.2554 48.3954 29.0527L42.7723 34.6758V65.3896L48.3954 71.0127C49.1927 71.81 49.1927 73.1031 48.3954 73.9004C47.5981 74.6976 46.306 74.6975 45.5087 73.9004L42.7723 71.1641V75.7627C42.7723 77.642 41.2483 79.165 39.369 79.165C37.4899 79.1649 35.9667 77.6419 35.9667 75.7627V71.4248L33.4921 73.9004C32.6948 74.6977 31.4017 74.6977 30.6044 73.9004C29.8073 73.1031 29.8071 71.8099 30.6044 71.0127L35.9667 65.6504V34.415L30.6044 29.0527C29.8075 28.2555 29.8075 26.9632 30.6044 26.166C31.4017 25.3687 32.6948 25.3687 33.4921 26.166L35.9667 28.6396V25.4023C35.9669 23.5233 37.49 22.0001 39.369 22Z" fill="url(#snowy_l1)" />
      <path d="M64.1877 36.1783C65.1273 37.8057 64.5701 39.8871 62.9428 40.8268L59.9126 42.5764L63.6496 43.5784C64.7387 43.8703 65.3848 44.9893 65.093 46.0784C64.8011 47.1674 63.6821 47.8135 62.593 47.5217L54.9118 45.4636L28.3128 60.8205L26.2546 68.5017C25.9628 69.5909 24.8429 70.2374 23.7538 69.9456C22.6648 69.6537 22.0188 68.5346 22.3104 67.4456L23.312 63.7077L19.3295 66.007C17.702 66.9466 15.6209 66.3883 14.6813 64.7608C13.7418 63.1334 14.2992 61.0527 15.9266 60.1131L19.6834 57.9442L16.3021 57.0389C15.213 56.7471 14.5665 55.6272 14.8583 54.5381C15.1502 53.4491 16.2701 52.8024 17.3591 53.0942L24.6842 55.057L51.7348 39.4393L53.6975 32.1143C53.9895 31.0255 55.1086 30.3794 56.1975 30.6709C57.2866 30.9627 57.9332 32.0826 57.6413 33.1717L56.7364 36.5516L59.54 34.933C61.1674 33.9936 63.2481 34.551 64.1877 36.1783Z" fill="url(#snowy_l2)" />
      <path d="M64.319 64.7603C63.3794 66.3877 61.2982 66.9459 59.6708 66.0065L56.6405 64.257L57.6413 67.9944C57.9331 69.0835 57.287 70.2026 56.1979 70.4944C55.1088 70.7862 53.9898 70.1401 53.6979 69.051L51.6398 61.3698L25.0408 46.0129L17.3595 48.071C16.2704 48.3629 15.1506 47.7163 14.8587 46.6272C14.567 45.5382 15.2132 44.4191 16.3021 44.1272L20.04 43.1257L16.0574 40.8263C14.43 39.8867 13.873 37.8053 14.8126 36.1778C15.7523 34.5505 17.8329 33.9929 19.4603 34.9325L23.217 37.1014L22.3104 33.7205C22.0186 32.6314 22.6651 31.5116 23.7542 31.2197C24.8433 30.9281 25.9632 31.5746 26.2551 32.6636L28.2178 39.9886L55.2684 55.6063L62.5934 53.6436C63.6823 53.3521 64.8014 53.9982 65.0934 55.0869C65.3853 56.1761 64.7387 57.2959 63.6496 57.5877L60.27 58.494L63.0736 60.1126C64.7008 61.0523 65.2584 63.133 64.319 64.7603Z" fill="url(#snowy_l3)" />
      <rect x="9.92822" y="11" width="4" height="16" rx="2" fill="url(#snowy_l4)" />
      <rect x="17.8564" y="13.2676" width="4" height="16" rx="2" transform="rotate(60 17.8564 13.2676)" fill="url(#snowy_l5)" />
      <rect x="19.8564" y="21.2676" width="4" height="16" rx="2" transform="rotate(120 19.8564 21.2676)" fill="url(#snowy_l6)" />
      <rect x="66.9282" width="4" height="16" rx="2" fill="url(#snowy_l7)" />
      <rect x="74.8564" y="2.26758" width="4" height="16" rx="2" transform="rotate(60 74.8564 2.26758)" fill="url(#snowy_l8)" />
      <rect x="76.8564" y="10.2676" width="4" height="16" rx="2" transform="rotate(120 76.8564 10.2676)" fill="url(#snowy_l9)" />
      <defs>
        <linearGradient id="snowy_l1" x1="39.5001" y1="22" x2="39.5001" y2="79.165" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l2" x1="64.2533" y1="36.2919" x2="14.7469" y2="64.8744" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l3" x1="64.2534" y1="64.8739" x2="14.747" y2="36.2914" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l4" x1="11.9282" y1="11" x2="11.9282" y2="27" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l5" x1="19.8564" y1="13.2676" x2="19.8564" y2="29.2676" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l6" x1="21.8564" y1="21.2676" x2="21.8564" y2="37.2676" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l7" x1="68.9282" y1="0" x2="68.9282" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l8" x1="76.8564" y1="2.26758" x2="76.8564" y2="18.2676" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
        <linearGradient id="snowy_l9" x1="78.8564" y1="10.2676" x2="78.8564" y2="26.2676" gradientUnits="userSpaceOnUse">
          <stop stopColor="#58A3FE" />
          <stop offset="0.5" stopColor="#90C3FC" />
          <stop offset="1" stopColor="#58A3FE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Foggy({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="10" y="21" width="67" height="10" rx="5" fill="url(#foggy_l1)" />
      <rect x="20" y="45" width="59" height="14" rx="7" fill="url(#foggy_l2)" />
      <rect x="3" y="45" width="14" height="14" rx="7" fill="url(#foggy_l3)" />
      <rect x="4" y="34" width="51" height="8" rx="4" fill="url(#foggy_l4)" />
      <rect x="57" y="34" width="20" height="8" rx="4" fill="url(#foggy_l5)" />
      <defs>
        <linearGradient id="foggy_l1" x1="-1.16667" y1="17.0606" x2="1.25779" y2="37.2424" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#DCDCDD" />
        </linearGradient>
        <linearGradient id="foggy_l2" x1="10.1667" y1="39.4848" x2="15.4482" y2="67.1384" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#DCDCDD" />
        </linearGradient>
        <linearGradient id="foggy_l3" x1="0.666666" y1="39.4848" x2="14.6667" y2="56.8788" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#DCDCDD" />
        </linearGradient>
        <linearGradient id="foggy_l4" x1="-4.5" y1="30.8485" x2="-2.46458" y2="46.9699" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#DCDCDD" />
        </linearGradient>
        <linearGradient id="foggy_l5" x1="53.6667" y1="30.8485" x2="58.4445" y2="45.6887" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECEDF3" />
          <stop offset="1" stopColor="#DCDCDD" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Windy({ size = "xl", className, ref, ...props }: IconProps) {
  const sizeValue = typeof size === "number" ? size : iconSizes[size];
  return (
    <svg
      ref={ref}
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M62.7684 19.4002C64.7596 18.843 66.8581 18.7647 68.8856 19.1707C70.9135 19.5768 72.8203 20.4574 74.4364 21.7469C76.0529 23.0367 77.3326 24.6991 78.1532 26.5974C78.9742 28.4968 79.3074 30.568 79.118 32.6287C78.9287 34.6892 78.2239 36.665 77.0751 38.3855C75.9269 40.1052 74.3724 41.5148 72.5555 42.5027C70.7391 43.4904 68.7089 44.0309 66.6415 44.0838C66.607 44.0847 66.5725 44.0848 66.538 44.0848H5.08484C2.82876 44.0848 0.999878 42.2559 0.999878 39.9998C0.999878 37.7437 2.82876 35.9148 5.08484 35.9148H66.452C67.2307 35.892 67.9857 35.6874 68.6522 35.325C69.3236 34.96 69.8799 34.4503 70.2811 33.8494C70.6818 33.2493 70.9187 32.5728 70.9823 31.8807C71.0458 31.1889 70.935 30.4893 70.6542 29.8396C70.3729 29.189 69.9264 28.5999 69.3407 28.1326C68.7545 27.6649 68.0486 27.335 67.2821 27.1814C66.5151 27.0278 65.7199 27.0574 64.9696 27.2674C64.2197 27.4772 63.5463 27.8582 63.0028 28.365C61.3528 29.9036 58.768 29.8129 57.2294 28.1629C55.6908 26.5129 55.7806 23.928 57.4305 22.3894C58.9427 20.9794 60.7767 19.9575 62.7684 19.4002Z" fill="url(#windy_l1)" />
      <path d="M33.7108 8.41119C35.4683 7.87046 37.3331 7.77001 39.1385 8.11822C40.944 8.46644 42.6373 9.25363 44.0663 10.4122C45.4956 11.5709 46.6168 13.0657 47.3241 14.7657C48.0313 16.4657 48.3019 18.3149 48.1102 20.1465C47.9184 21.9782 47.2707 23.7318 46.2284 25.2491C45.1862 26.7661 43.7825 27.9987 42.1473 28.8409C40.5292 29.6742 38.7319 30.0991 36.913 30.0831V30.084H5.08484C2.82876 30.084 0.999878 28.2552 0.999878 25.9991C1.00003 23.7431 2.82885 21.9141 5.08484 21.9141H36.913L36.9696 21.9151C37.4713 21.922 37.965 21.8053 38.4061 21.5782C38.8471 21.3511 39.2202 21.0216 39.494 20.6231C39.7676 20.2248 39.9348 19.7684 39.9843 19.296C40.0337 18.8238 39.9639 18.3461 39.7802 17.9044C39.5962 17.4623 39.3031 17.067 38.9218 16.7579C38.5403 16.4486 38.0834 16.2356 37.5917 16.1407C37.0997 16.0458 36.5907 16.0728 36.1132 16.2198C35.6359 16.3667 35.2077 16.6279 34.8641 16.9747C33.2763 18.5774 30.6895 18.5888 29.0868 17.001C27.4842 15.4133 27.4719 12.8274 29.0594 11.2247C30.3544 9.91756 31.9533 8.95198 33.7108 8.41119Z" fill="url(#windy_l2)" />
      <path d="M57.001 49.9165C58.8144 49.9004 60.6044 50.3297 62.2129 51.1684C63.8383 52.0159 65.2277 53.2543 66.2568 54.7709C67.2859 56.2875 67.9228 58.036 68.1113 59.8588C68.2998 61.6817 68.0335 63.5231 67.3369 65.2182C66.6403 66.9133 65.5348 68.4098 64.1182 69.5727C62.7013 70.7357 61.0171 71.529 59.2178 71.8803C57.4187 72.2316 55.5607 72.1305 53.8105 71.5854C52.0604 71.0402 50.4733 70.0682 49.1914 68.7582C47.6135 67.1457 47.6414 64.5588 49.2539 62.9809C50.8665 61.4034 53.4525 61.432 55.0303 63.0444C55.3668 63.3883 55.7829 63.6422 56.2402 63.7846C56.6975 63.927 57.1826 63.9535 57.6523 63.8618C58.1222 63.77 58.5631 63.5632 58.9346 63.2582C59.3061 62.9533 59.5967 62.5595 59.7803 62.1127C59.9638 61.666 60.0341 61.1798 59.9844 60.6987C59.9346 60.2177 59.7667 59.7567 59.4961 59.3579C59.2255 58.9592 58.8606 58.6353 58.4355 58.4135C58.0103 58.1918 57.537 58.0787 57.0586 58.0854C57.0395 58.0857 57.0201 58.0864 57.001 58.0864H5.08496C2.82897 58.0864 1.00015 56.2574 1 54.0014C1 51.7453 2.82888 49.9165 5.08496 49.9165H57.001Z" fill="url(#windy_l3)" />
      <defs>
        <linearGradient id="windy_l1" x1="74.9999" y1="23.4998" x2="2.49988" y2="41.4998" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B8AE9" />
          <stop offset="0.5" stopColor="#58A3FE" />
          <stop offset="1" stopColor="#3B8AE9" />
        </linearGradient>
        <linearGradient id="windy_l2" x1="45.6539" y1="11.9532" x2="0.514324" y2="19.6312" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B8AE9" />
          <stop offset="0.5" stopColor="#58A3FE" />
          <stop offset="1" stopColor="#3B8AE9" />
        </linearGradient>
        <linearGradient id="windy_l3" x1="64.587" y1="53.9542" x2="2.11392" y2="69.086" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B8AE9" />
          <stop offset="0.5" stopColor="#58A3FE" />
          <stop offset="1" stopColor="#3B8AE9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
