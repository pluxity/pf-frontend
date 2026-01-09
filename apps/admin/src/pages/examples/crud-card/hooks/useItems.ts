import { useState, useMemo, useCallback, useEffect } from "react";
import type { Item, ItemFormData, FilterStatus } from "../types";
import { getItems, createItem, updateItem, deleteItem } from "../services";

const ITEMS_PER_PAGE = 9;

export interface UseItemsReturn {
  items: Item[];
  filteredItems: Item[];
  paginatedItems: Item[];
  totalPages: number;
  isLoading: boolean;
  searchQuery: string;
  filterStatus: FilterStatus;
  currentPage: number;
  formModalOpen: boolean;
  deleteDialogOpen: boolean;
  selectedItem: Item | null;
  setSearchQuery: (query: string) => void;
  changeFilterStatus: (status: FilterStatus) => void;
  setCurrentPage: (page: number) => void;
  handleCreate: () => void;
  handleEdit: (item: Item) => void;
  handleDelete: (item: Item) => void;
  handleFormSubmit: (data: ItemFormData) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;
  handleSearch: (query: string) => void;
  setFormModalOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

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
          const updated = await updateItem(selectedItem.id, data);
          setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? updated : item)));
        } else {
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
    items,
    filteredItems,
    paginatedItems,
    totalPages,
    isLoading: isLoading || isInitialLoading,
    searchQuery,
    filterStatus,
    currentPage,
    formModalOpen,
    deleteDialogOpen,
    selectedItem,
    setSearchQuery,
    changeFilterStatus: (status: FilterStatus) => {
      setFilterStatus(status);
      setCurrentPage(1);
    },
    setCurrentPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleDeleteConfirm,
    handleSearch,
    setFormModalOpen,
    setDeleteDialogOpen,
  };
}
