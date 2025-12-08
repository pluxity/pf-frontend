import type { MarkerConfig } from "@pf-dev/map";

export const seoulMarkers: MarkerConfig[] = [
  {
    id: "seoul-station",
    position: {
      longitude: 126.972,
      latitude: 37.5547,
      height: 0,
    },
    label: "서울역",
    description: "서울역 - 대한민국 주요 기차역",
    color: "#FF0000",
    onClick: (entity) => {
      console.log("서울역 클릭:", entity.id);
      alert("서울역이 클릭되었습니다!");
    },
  },
  {
    id: "gangnam-station",
    position: {
      longitude: 127.0276,
      latitude: 37.4979,
      height: 0,
    },
    label: "강남역",
    description: "강남역 - 서울 강남구 지하철역",
    color: "#00FF00",
    onClick: (entity) => {
      console.log("강남역 클릭:", entity.id);
      alert("강남역이 클릭되었습니다!");
    },
  },
  {
    id: "yeouido",
    position: {
      longitude: 126.9244,
      latitude: 37.5219,
      height: 0,
    },
    label: "여의도",
    description: "여의도 - 서울 금융 중심지",
    color: "#0000FF",
    onClick: (entity) => {
      console.log("여의도 클릭:", entity.id);
      alert("여의도가 클릭되었습니다!");
    },
  },
  {
    id: "namsan",
    position: {
      longitude: 126.9882,
      latitude: 37.5512,
      height: 262,
    },
    label: "남산타워",
    description: "남산서울타워 - 서울의 랜드마크",
    color: "#FFA500",
    onClick: (entity) => {
      console.log("남산타워 클릭:", entity.id);
      alert("남산타워가 클릭되었습니다!");
    },
  },
  {
    id: "hongdae",
    position: {
      longitude: 126.925,
      latitude: 37.5563,
      height: 0,
    },
    label: "홍대입구",
    description: "홍대 - 젊음의 거리",
    color: "#FF00FF",
    onClick: (entity) => {
      console.log("홍대 클릭:", entity.id);
      alert("홍대입구가 클릭되었습니다!");
    },
  },
];
