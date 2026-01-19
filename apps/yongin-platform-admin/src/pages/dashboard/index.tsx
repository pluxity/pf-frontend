import { Users, BarChart, Package, Eye } from "@pf-dev/ui/atoms";

import { DashboardGrid, StatCard, ChartWidget, TableWidget } from "./components";

export function DashboardPage() {
  return (
    <div className="h-full">
      <DashboardGrid columns={4} gap={16}>
        {/* 통계 카드 */}
        <StatCard
          title="총 사용자"
          value="12,847"
          change={12.5}
          changeLabel="지난달 대비"
          icon={<Users size="md" />}
        />
        <StatCard
          title="오늘 방문자"
          value="1,284"
          change={-3.2}
          changeLabel="어제 대비"
          icon={<Eye size="md" />}
        />
        <StatCard
          title="주문 건수"
          value="384"
          change={8.1}
          changeLabel="지난주 대비"
          icon={<Package size="md" />}
        />
        <StatCard
          title="활성 세션"
          value="247"
          change={24.3}
          changeLabel="실시간"
          icon={<BarChart size="md" />}
        />

        {/* 차트 위젯 */}
        <div className="col-span-2">
          <ChartWidget title="월별 방문자 추이" type="line" />
        </div>
        <div className="col-span-2">
          <ChartWidget title="일별 매출" type="bar" />
        </div>

        {/* 하단 영역 */}
        <ChartWidget title="사용자 유형 분포" type="pie" />
        <div className="col-span-3">
          <TableWidget
            title="최근 활동"
            columns={[
              { key: "user", header: "사용자" },
              { key: "action", header: "활동" },
              { key: "time", header: "시간" },
            ]}
            data={[
              { id: 1, user: "김철수", action: "로그인", time: "방금 전" },
              { id: 2, user: "이영희", action: "상품 조회", time: "1분 전" },
              { id: 3, user: "박민수", action: "주문 완료", time: "3분 전" },
              { id: 4, user: "최지은", action: "회원가입", time: "5분 전" },
              { id: 5, user: "정대현", action: "결제 완료", time: "8분 전" },
            ]}
          />
        </div>
      </DashboardGrid>
    </div>
  );
}
