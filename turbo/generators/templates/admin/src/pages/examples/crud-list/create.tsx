import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ChevronLeft } from "@pf-dev/ui/atoms";
import { UserForm } from "./components";
import { createUser } from "./services";
import type { UserFormData } from "./types";

export function CrudListCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      await createUser(data);
      navigate("/examples/crud-list");
    } catch (error) {
      console.error("Failed to create user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/examples/crud-list");
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ChevronLeft size="sm" />
          <span className="ml-1">목록으로</span>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">사용자 추가</h1>
          <p className="mt-1 text-sm text-gray-500">새로운 사용자 정보를 입력하세요.</p>
        </div>
      </div>

      {/* 폼 */}
      <div className="rounded-lg border bg-white p-6">
        <UserForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default CrudListCreatePage;
