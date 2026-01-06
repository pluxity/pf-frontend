/**
 * 아이템 CRUD 훅
 *
 * 아이템 목록 조회, 생성, 수정, 삭제 및 필터링/페이지네이션을 관리합니다.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Item, ItemFormData, FilterStatus } from "../types";
import { getItems, createItem, updateItem, deleteItem } from "../services";

const ITEMS_PER_PAGE = 9;

export interface UseItemsReturn {
  // 데이터
  items: Item[];
  filteredItems: Item[];
  paginatedItems: Item[];
  totalPages: number;
  isLoading: boolean;

  // 필터/페이지네이션 상태
  searchQuery: string;
  filterStatus: FilterStatus;
  currentPage: number;

  // 모달 상태
  formModalOpen: boolean;
  deleteDialogOpen: boolean;
  selectedItem: Item | null;

  // 액션
  setSearchQuery: (query: string) => void;
  changeFilterStatus: (status: FilterStatus) => void;
  setCurrentPage: (page: number) => void;

  // CRUD 핸들러
  handleCreate: () => void;
  handleEdit: (item: Item) => void;
  handleDelete: (item: Item) => void;
  handleFormSubmit: (data: ItemFormData) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;
  handleSearch: (query: string) => void;

  // 모달 제어
  setFormModalOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

export function useItems(): UseItemsReturn {
  // 데이터 상태
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 필터/페이지네이션 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadItems = async () => {
      setIsInitialLoading(true);
      try {
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadItems();
  }, []);

  // 필터링된 아이템
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, filterStatus]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  // 현재 페이지가 유효 범위를 벗어나면 마지막 유효 페이지로 자동 조정
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // CRUD 핸들러
  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((item: Item) => {
    setSelectedItem(item);
    setFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: Item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: ItemFormData) => {
      setIsLoading(true);
      try {
        if (selectedItem) {
          // 수정
          const updated = await updateItem(selectedItem.id, data);
          setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? updated : item)));
        } else {
          // 생성
          const created = await createItem(data);
          setItems((prev) => [created, ...prev]);
        }
        setFormModalOpen(false);
      } catch (error) {
        console.error("Failed to save item:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedItem]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    try {
      await deleteItem(selectedItem.id);
      setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedItem]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    // 데이터
    items,
    filteredItems,
    paginatedItems,
    totalPages,
    isLoading: isLoading || isInitialLoading,

    // 필터/페이지네이션 상태
    searchQuery,
    filterStatus,
    currentPage,

    // 모달 상태
    formModalOpen,
    deleteDialogOpen,
    selectedItem,

    // 액션
    setSearchQuery,
    changeFilterStatus: (status: FilterStatus) => {
      setFilterStatus(status);
      setCurrentPage(1);
    },
    setCurrentPage,

    // CRUD 핸들러
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleDeleteConfirm,
    handleSearch,

    // 모달 제어
    setFormModalOpen,
    setDeleteDialogOpen,
  };
}
