import { useState } from "react";
import { Button } from "@pf-dev/ui";
import { CCTVModal } from "../../components";

export function HomePage() {
  const [cctvModalOpen, setCCTVModalOpen] = useState(false);

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to ISR</h1>
        <p className="text-lg text-muted-foreground">
          Built with React, TypeScript, Vite, Zustand, and Tailwind CSS
        </p>

        <div className="flex justify-center gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
          <Button variant="outline" onClick={() => setCCTVModalOpen(true)}>
            CCTV 모달 열기
          </Button>
        </div>
      </div>

      <CCTVModal open={cctvModalOpen} onOpenChange={setCCTVModalOpen} />
    </div>
  );
}
