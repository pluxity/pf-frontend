import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Carousel } from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Molecules/Carousel",
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    transition: {
      control: "select",
      options: ["slide", "fade", "none"],
      description: "전환 효과",
    },
    autoPlay: {
      control: "boolean",
      description: "자동 재생 여부",
    },
    autoPlayInterval: {
      control: "number",
      description: "자동 재생 간격 (ms)",
    },
    showArrows: {
      control: "boolean",
      description: "화살표 표시 여부",
    },
    showIndicators: {
      control: "boolean",
      description: "인디케이터 표시 여부",
    },
    loop: {
      control: "boolean",
      description: "무한 루프 여부",
    },
    lazy: {
      control: "boolean",
      description: "비활성 슬라이드 lazy 렌더링",
    },
    preloadAdjacent: {
      control: "boolean",
      description: "이전/다음 슬라이드 미리 마운트",
    },
    transitionDuration: {
      control: "number",
      description: "전환 애니메이션 시간 (ms)",
    },
    arrowVariant: {
      control: "select",
      options: ["default", "ghost"],
      description: "화살표 버튼 스타일 변형",
    },
    arrowClassName: {
      control: "text",
      description: "화살표 버튼 커스텀 클래스",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const slides = [
  { bg: "bg-blue-500", text: "슬라이드 1" },
  { bg: "bg-green-500", text: "슬라이드 2" },
  { bg: "bg-purple-500", text: "슬라이드 3" },
  { bg: "bg-orange-500", text: "슬라이드 4" },
];

export const Default: Story = {
  name: "기본",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const SlideTransition: Story = {
  name: "슬라이드 전환",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel transition="slide">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const FadeTransition: Story = {
  name: "페이드 전환",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel transition="fade">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const AutoPlay: Story = {
  name: "자동 재생",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel autoPlay autoPlayInterval={2000}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const NoLoop: Story = {
  name: "루프 없음",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel loop={false}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const NoArrows: Story = {
  name: "화살표 숨김",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel showArrows={false}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const NoIndicators: Story = {
  name: "인디케이터 숨김",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel showIndicators={false}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

function LazySlide({ index }: { index: number }) {
  return (
    <div
      className={`${slides[index]?.bg || "bg-gray-500"} w-full h-[300px] flex flex-col items-center justify-center text-white`}
    >
      <span className="text-2xl font-bold">슬라이드 {index + 1}</span>
      <span className="text-sm mt-2">마운트됨 (콘솔 확인)</span>
    </div>
  );
}

export const LazyRendering: Story = {
  name: "Lazy 렌더링 (콘솔 확인)",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel lazy={true}>
        {slides.map((_, index) => (
          <LazySlide key={index} index={index} />
        ))}
      </Carousel>
    </div>
  ),
};

export const PreloadAdjacent: Story = {
  name: "인접 슬라이드 미리 로드",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel lazy={true} preloadAdjacent={true}>
        {slides.map((_, index) => (
          <LazySlide key={index} index={index} />
        ))}
      </Carousel>
    </div>
  ),
};

export const Controlled: Story = {
  name: "제어 컴포넌트",
  render: function ControlledStory() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
      <div className="space-y-4">
        <div className="flex gap-2 justify-center">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 rounded ${
                activeIndex === index ? "bg-brand text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className="w-[600px] h-[300px]">
          <Carousel activeIndex={activeIndex} onChange={setActiveIndex} showIndicators={false}>
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
              >
                {slide.text}
              </div>
            ))}
          </Carousel>
        </div>
        <p className="text-center text-gray-600">현재: {activeIndex + 1}</p>
      </div>
    );
  },
};

export const GhostArrows: Story = {
  name: "화살표 Ghost 모드",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel arrowVariant="ghost">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const CustomArrowPosition: Story = {
  name: "화살표 위치 커스터마이징",
  render: () => (
    <div className="w-[600px] h-[300px]">
      <Carousel arrowVariant="ghost" arrowClassName="!top-4 !translate-y-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.bg} w-full h-[300px] flex items-center justify-center text-white text-2xl font-bold`}
          >
            {slide.text}
          </div>
        ))}
      </Carousel>
    </div>
  ),
};

export const AllTransitions: Story = {
  name: "모든 전환 효과 비교",
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold mb-4">슬라이드 (Slide)</h3>
        <div className="w-[400px] h-[200px]">
          <Carousel transition="slide">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`${slide.bg} w-full h-[200px] flex items-center justify-center text-white text-xl font-bold`}
              >
                {slide.text}
              </div>
            ))}
          </Carousel>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-4">페이드 (Fade)</h3>
        <div className="w-[400px] h-[200px]">
          <Carousel transition="fade">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`${slide.bg} w-full h-[200px] flex items-center justify-center text-white text-xl font-bold`}
              >
                {slide.text}
              </div>
            ))}
          </Carousel>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-4">없음 (None)</h3>
        <div className="w-[400px] h-[200px]">
          <Carousel transition="none">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`${slide.bg} w-full h-[200px] flex items-center justify-center text-white text-xl font-bold`}
              >
                {slide.text}
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  ),
};
