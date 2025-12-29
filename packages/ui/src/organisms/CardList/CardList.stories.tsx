import type { Meta, StoryObj } from "@storybook/react";
import { CardList } from "./CardList";

const meta: Meta<typeof CardList> = {
  title: "Organisms/CardList",
  component: CardList,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    columns: {
      control: { type: "select" },
      options: [2, 3, 4, 5, 6],
      description: "그리드 컬럼 수",
    },
    gap: {
      control: { type: "number", min: 0, max: 32 },
      description: "카드 간 간격 (px)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface Facility {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

const facilities: Facility[] = [
  { id: "1", name: "본관 A동", category: "건물", imageUrl: "https://picsum.photos/seed/1/400/300" },
  { id: "2", name: "주차장 B", category: "주차", imageUrl: "https://picsum.photos/seed/2/400/300" },
  { id: "3", name: "창고 C동", category: "창고", imageUrl: "https://picsum.photos/seed/3/400/300" },
  { id: "4", name: "연구동 D", category: "건물", imageUrl: "https://picsum.photos/seed/4/400/300" },
  { id: "5", name: "휴게실 E", category: "편의", imageUrl: "https://picsum.photos/seed/5/400/300" },
  { id: "6", name: "식당 F", category: "편의", imageUrl: "https://picsum.photos/seed/6/400/300" },
];

interface Asset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

const assets: Asset[] = [
  {
    id: "1",
    name: "CCTV 카메라",
    description: "HD 고화질 카메라",
    thumbnail: "https://picsum.photos/seed/a1/400/300",
  },
  {
    id: "2",
    name: "센서 모듈",
    description: "온습도 센서",
    thumbnail: "https://picsum.photos/seed/a2/400/300",
  },
  {
    id: "3",
    name: "게이트웨이",
    description: "IoT 게이트웨이",
    thumbnail: "https://picsum.photos/seed/a3/400/300",
  },
  {
    id: "4",
    name: "알람 장치",
    description: "경보 알람",
    thumbnail: "https://picsum.photos/seed/a4/400/300",
  },
  {
    id: "5",
    name: "도어락",
    description: "스마트 도어락",
    thumbnail: "https://picsum.photos/seed/a5/400/300",
  },
  {
    id: "6",
    name: "LED 조명",
    description: "스마트 조명",
    thumbnail: "https://picsum.photos/seed/a6/400/300",
  },
];

export const Default: Story = {
  name: "기본",
  render: () => (
    <CardList
      data={facilities}
      columns={3}
      gap={16}
      keyExtractor={(item) => item.id}
      renderCard={(facility) => (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <img src={facility.imageUrl} alt={facility.name} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-bold text-lg">{facility.name}</h3>
            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
              {facility.category}
            </span>
          </div>
        </div>
      )}
    />
  ),
};

export const TwoColumns: Story = {
  name: "2열 레이아웃",
  render: () => (
    <CardList
      data={facilities.slice(0, 4)}
      columns={2}
      gap={24}
      keyExtractor={(item) => item.id}
      renderCard={(facility) => (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <img src={facility.imageUrl} alt={facility.name} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="font-bold text-lg">{facility.name}</h3>
            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
              {facility.category}
            </span>
          </div>
        </div>
      )}
    />
  ),
};

export const FourColumns: Story = {
  name: "4열 레이아웃",
  render: () => (
    <CardList
      data={facilities}
      columns={4}
      gap={16}
      keyExtractor={(item) => item.id}
      renderCard={(facility) => (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <img src={facility.imageUrl} alt={facility.name} className="w-full h-32 object-cover" />
          <div className="p-3">
            <h3 className="font-bold">{facility.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {facility.category}
            </span>
          </div>
        </div>
      )}
    />
  ),
};

export const AssetList: Story = {
  name: "자산 목록",
  render: () => (
    <CardList
      data={assets}
      columns={3}
      gap={16}
      keyExtractor={(item) => item.id}
      renderCard={(asset) => (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <img src={asset.thumbnail} alt={asset.name} className="w-full h-36 object-cover" />
          <div className="p-4">
            <h3 className="font-bold">{asset.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{asset.description}</p>
          </div>
        </div>
      )}
    />
  ),
};

export const WithActions: Story = {
  name: "액션 버튼 포함",
  render: () => (
    <CardList
      data={facilities}
      columns={3}
      gap={16}
      keyExtractor={(item) => item.id}
      renderCard={(facility) => (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <img src={facility.imageUrl} alt={facility.name} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-bold text-lg">{facility.name}</h3>
            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
              {facility.category}
            </span>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-brand text-white text-sm rounded hover:bg-brand/90">
              도면관리
            </button>
            <button className="flex-1 px-3 py-2 border text-sm rounded hover:bg-gray-50">
              3D뷰어
            </button>
          </div>
        </div>
      )}
    />
  ),
};

export const CompactCards: Story = {
  name: "컴팩트 카드",
  render: () => (
    <CardList
      data={assets}
      columns={6}
      gap={8}
      keyExtractor={(item) => item.id}
      renderCard={(asset) => (
        <div className="bg-white rounded border p-2 hover:shadow-sm transition-shadow">
          <img
            src={asset.thumbnail}
            alt={asset.name}
            className="w-full h-20 object-cover rounded"
          />
          <p className="text-sm font-medium mt-2 truncate">{asset.name}</p>
        </div>
      )}
    />
  ),
};
