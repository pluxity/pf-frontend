import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@pf-dev/ui/molecules";
import { Button, Badge } from "@pf-dev/ui/atoms";
import { Edit, X } from "@pf-dev/ui/atoms";
import type { Item } from "../types";

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

const statusConfig = {
  active: { label: "활성", variant: "success" as const },
  inactive: { label: "비활성", variant: "default" as const },
  draft: { label: "초안", variant: "outline" as const },
};

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const status = statusConfig[item.status];

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      {item.thumbnail ? (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-gray-100">
          <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-t-xl bg-gray-100">
          <span className="text-sm text-gray-400">No Image</span>
        </div>
      )}

      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1">{item.title}</CardTitle>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-xs text-gray-400">
          {new Date(item.updatedAt).toLocaleDateString("ko-KR")} 수정
        </p>
      </CardContent>

      <CardFooter className="gap-2 border-t pt-4">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(item)}>
          <Edit size="sm" />
          <span className="ml-1">수정</span>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onDelete(item)}>
          <X size="sm" />
          <span className="ml-1">삭제</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
