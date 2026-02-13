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

export function getWeatherIconName(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 300) return "thunderstorm-rain";
  if (weatherId >= 300 && weatherId < 400) return "rainy";
  if (weatherId >= 500 && weatherId < 600) return "rainy";
  if (weatherId >= 600 && weatherId < 700) return "snow";
  if (weatherId >= 700 && weatherId < 800) return "mist";
  if (weatherId === 800) return "sunny";
  if (weatherId >= 801 && weatherId <= 804) {
    return weatherId === 801 ? "partly-cloudy" : "cloudy";
  }
  return "sunny";
}

export function getNoiseStatus(noise: number): string {
  if (noise < 30) return "고요함";
  if (noise < 50) return "조용함";
  if (noise < 70) return "보통";
  if (noise < 90) return "시끄러움";
  if (noise < 110) return "매우 시끄러움";
  return "위험";
}
