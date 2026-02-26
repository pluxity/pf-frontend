import cloudyIcon from "@/assets/icons/weathers/cloudy.svg";
import mistIcon from "@/assets/icons/weathers/mist.svg";
import partlyCloudyIcon from "@/assets/icons/weathers/partly-cloudy.svg";
import rainyIcon from "@/assets/icons/weathers/rainy.svg";
import snowIcon from "@/assets/icons/weathers/snow.svg";
import strongWindIcon from "@/assets/icons/weathers/strong-wind.svg";
import sunnyIcon from "@/assets/icons/weathers/sunny.svg";
import thunderstormRainIcon from "@/assets/icons/weathers/thunderstorm-rain.svg";

const PM_STATUS = {
  좋음: { icon: "pm-good.svg", color: "bg-[#0057FF]" },
  보통: { icon: "pm-moderate.svg", color: "bg-[#2DC000]" },
  나쁨: { icon: "pm-bad.svg", color: "bg-[#FF8901]" },
} as const;

export function getPMStatus(status: string) {
  return PM_STATUS[status as keyof typeof PM_STATUS] ?? PM_STATUS["좋음"];
}

export function getHumidityStatus(humidity: number): string {
  if (humidity < 30) return "매우 건조함";
  if (humidity < 40) return "건조함";
  if (humidity < 60) return "쾌적함";
  if (humidity < 70) return "약간 습함";
  if (humidity < 80) return "습함";
  return "매우 습함";
}

export function getWindSpeedStatus(windSpeed: number): string {
  if (windSpeed < 0.3) return "고요";
  if (windSpeed < 1.6) return "실바람";
  if (windSpeed < 3.4) return "남실바람";
  if (windSpeed < 5.5) return "산들바람";
  if (windSpeed < 8.0) return "건들바람";
  if (windSpeed < 10.8) return "흔들바람";
  if (windSpeed < 13.9) return "된바람";
  if (windSpeed < 17.2) return "센바람";
  if (windSpeed < 20.8) return "큰바람";
  return "큰센바람";
}

export function getRainFall(rainfall: number): string {
  if (rainfall === 0) return "없음";
  if (rainfall < 3) return "약한 비";
  if (rainfall < 15) return "보통 비";
  if (rainfall < 30) return "강한 비";
  return "매우 강한 비";
}

/**
 * OpenWeather API weather condition ID를 아이콘으로 매핑
 *
 * | ID 범위   | 날씨           | 아이콘              |
 * |-----------|----------------|---------------------|
 * | 200-232   | Thunderstorm   | thunderstorm-rain   |
 * | 300-321   | Drizzle        | rainy               |
 * | 500-531   | Rain           | rainy               |
 * | 600-622   | Snow           | snow                |
 * | 701-721   | Mist/Haze      | mist                |
 * | 731-781   | Dust/Squall    | strong-wind         |
 * | 800       | Clear          | sunny               |
 * | 801       | Few clouds     | partly-cloudy       |
 * | 802-804   | Clouds/Overcast| cloudy              |
 */
export function getWeatherIcon(weatherId: number): string {
  // Thunderstorm (200-232)
  if (weatherId >= 200 && weatherId < 300) return thunderstormRainIcon;
  // Drizzle (300-321)
  if (weatherId >= 300 && weatherId < 400) return rainyIcon;
  // Rain (500-531)
  if (weatherId >= 500 && weatherId < 600) return rainyIcon;
  // Snow (600-622)
  if (weatherId >= 600 && weatherId < 700) return snowIcon;
  // Atmosphere: Mist, Smoke, Haze (701-721)
  if (weatherId >= 700 && weatherId < 731) return mistIcon;
  // Atmosphere: Dust, Sand, Ash, Squall, Tornado (731-781)
  if (weatherId >= 731 && weatherId < 800) return strongWindIcon;
  // Clear (800)
  if (weatherId === 800) return sunnyIcon;
  // Few clouds (801)
  if (weatherId === 801) return partlyCloudyIcon;
  // Scattered / Broken / Overcast clouds (802-804)
  if (weatherId >= 802 && weatherId <= 804) return cloudyIcon;

  return sunnyIcon;
}

export function getNoiseStatus(noise: number): string {
  if (noise < 30) return "고요함";
  if (noise < 50) return "조용함";
  if (noise < 70) return "보통";
  if (noise < 90) return "시끄러움";
  if (noise < 110) return "매우 시끄러움";
  return "위험";
}
