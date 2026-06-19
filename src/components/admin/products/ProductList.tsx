"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  PencilIcon,
  TrashIcon,
  ArchiveBoxXMarkIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { formatPrice } from "@/utils/format";
import { AdminProduct } from "@/types/admin-product.types";
import { Category } from "@/types/category.types";
import { productsService } from "@/services/products.service";
import { categoryService } from "@/services/category.service";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import ProductFilters from "./ProductFilters";
import {
  TableShell,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  IconButton,
  Badge,
  StatusBadge,
  Pagination,
  SegmentedToggle,
  SkeletonTable,
  EmptyState,
  ConfirmDialog,
} from "@/components/admin/ui";

interface ProductListProps {
  onEdit: (product: AdminProduct) => void;
}

export interface ProductListRef {
  fetchProducts: () => Promise<void>;
}

const ProductList = forwardRef<ProductListRef, ProductListProps>(
  ({ onEdit }, ref) => {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    // `searchTerm` is the controlled input value (instant); `search` is the
    // debounced value actually sent to the API.
    const [searchTerm, setSearchTerm] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [isBestSeller, setIsBestSeller] = useState<"" | "true" | "false">("");
    // Active products only by default (isDeleted=false).
    const [isDeleted, setIsDeleted] = useState<"false" | "true">("false");
    const [sort, setSort] = useState<"" | "price" | "createdAt" | "soldItems">(
      ""
    );

    // Soft-delete confirmation state
    const [pendingDelete, setPendingDelete] = useState<AdminProduct | null>(
      null
    );
    const [isDeleting, setIsDeleting] = useState(false);

    // Hard-delete (type-to-confirm) modal state
    const [hardDeleteTarget, setHardDeleteTarget] =
      useState<AdminProduct | null>(null);
    const [isHardDeleting, setIsHardDeleting] = useState(false);

    const fetchProducts = async (page: number = currentPage) => {
      setIsLoading(true);
      try {
        const response = await productsService.getProducts({
          page,
          limit: 20,
          search: search.trim() || undefined,
          category: category || undefined,
          isBestSeller: isBestSeller || undefined,
          isDeleted,
          sort: sort || undefined,
        });
        setProducts(response.data.products);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (error) {
        toast.error("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      fetchProducts: () => fetchProducts(currentPage),
    }));

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await categoryService.getAllCategories();
          setCategories(response.data.categories || []);
        } catch (error) {
          // Filters still render with an empty category list.
        }
      };
      fetchCategories();
    }, []);

    useEffect(() => {
      fetchProducts(currentPage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, search, category, isBestSeller, isDeleted, sort]);

    const resetToFirstPage = () => setCurrentPage(1);

    // Debounce the search input (~400ms): commit the value and reset to page 1.
    const debouncedSetSearch = useDebounce((value: string) => {
      setSearch(value);
      setCurrentPage(1);
    }, 400);

    const handleSearchChange = (value: string) => {
      setSearchTerm(value);
      debouncedSetSearch(value);
    };

    const confirmSoftDelete = async () => {
      if (!pendingDelete) return;
      setIsDeleting(true);
      try {
        await productsService.softDeleteProduct(pendingDelete._id);
        toast.success("Product deleted successfully");
        setPendingDelete(null);
        fetchProducts(currentPage);
      } catch (error) {
        toast.error("Failed to delete product");
      } finally {
        setIsDeleting(false);
      }
    };

    const closeHardDelete = () => {
      setHardDeleteTarget(null);
    };

    const confirmHardDelete = async () => {
      if (!hardDeleteTarget) return;
      setIsHardDeleting(true);
      try {
        await productsService.hardDeleteProduct(hardDeleteTarget._id);
        toast.success("Product permanently deleted");
        setProducts((prev) =>
          prev.filter((p) => p._id !== hardDeleteTarget._id)
        );
        closeHardDelete();
      } catch (error) {
        toast.error("Failed to permanently delete product");
      } finally {
        setIsHardDeleting(false);
      }
    };

    const handleIsDeletedChange = (value: string) => {
      setIsDeleted(value as "false" | "true");
      resetToFirstPage();
    };

    return (
      <div>
        {/* Active / Deleted toggle */}
        <div className="mb-6">
          <SegmentedToggle
            value={isDeleted}
            onChange={handleIsDeletedChange}
            options={[
              { value: "false", label: "Active" },
              { value: "true", label: "Deleted" },
            ]}
          />
        </div>

        <ProductFilters
          categories={categories}
          search={searchTerm}
          category={category}
          isBestSeller={isBestSeller}
          sort={sort}
          onSearchChange={handleSearchChange}
          onCategoryChange={(v) => {
            setCategory(v);
            resetToFirstPage();
          }}
          onIsBestSellerChange={(v) => {
            setIsBestSeller(v);
            resetToFirstPage();
          }}
          onSortChange={(v) => {
            setSort(v);
            resetToFirstPage();
          }}
        />

        {isLoading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : !products || products.length === 0 ? (
          <EmptyState
            icon={CubeIcon}
            title="No products found"
            description={
              search
                ? `No products match “${search}”.`
                : "There are no products matching the current filters."
            }
          />
        ) : (
          <>
            <TableShell>
              <Thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>Stock</Th>
                  <Th>Best Seller</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {products.map((product) => (
                  <Tr
                    key={product._id}
                    className={product.isDeleted ? "opacity-60" : ""}
                  >
                    {/* Product (image + name) */}
                    <Td>
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-admin-surface-muted">
                          {product.defaultImage?.mediaUrl ? (
                            <Image
                              src={product.defaultImage.mediaUrl}
                              alt={product.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <CubeIcon className="h-6 w-6 text-admin-ink-subtle" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-admin-ink">
                            {product.productName}
                          </div>
                          {product.soldItems !== undefined && (
                            <div className="tabular mt-0.5 text-xs text-admin-ink-muted">
                              {product.soldItems} sold
                            </div>
                          )}
                        </div>
                      </div>
                    </Td>

                    {/* Category */}
                    <Td className="text-admin-ink-muted">
                      {product.category?.categoryName || "—"}
                    </Td>

                    {/* Price */}
                    <Td>
                      <div className="flex flex-col">
                        <span className="tabular font-medium text-admin-ink">
                          {formatPrice(product.finalPrice ?? product.price)}
                        </span>
                        {product.isSale && product.salePrice ? (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="tabular text-xs text-admin-ink-muted line-through">
                              {formatPrice(product.price)}
                            </span>
                            <Badge tone="discount">
                              {product.discountPercentage ??
                                Math.round(
                                  (1 - product.salePrice / product.price) * 100
                                )}
                              % OFF
                            </Badge>
                          </div>
                        ) : null}
                      </div>
                    </Td>

                    {/* Stock */}
                    <Td>
                      <StatusBadge
                        status={
                          product.availableItems <= 0
                            ? "soldOut"
                            : product.availableItems <= 5
                            ? "lowStock"
                            : "inStock"
                        }
                        label={`${product.availableItems} units`}
                      />
                    </Td>

                    {/* Best Seller */}
                    <Td>
                      {product.isBestSeller ? (
                        <Badge tone="bestSeller">Best Seller</Badge>
                      ) : (
                        <span className="text-xs text-admin-ink-subtle">—</span>
                      )}
                    </Td>

                    {/* Status (deleted/active) */}
                    <Td>
                      <StatusBadge
                        status={product.isDeleted ? "deleted" : "active"}
                      />
                    </Td>

                    {/* Actions */}
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          label={`Edit ${product.productName}`}
                          icon={<PencilIcon />}
                          onClick={() => onEdit(product)}
                        />
                        {isDeleted === "false" && (
                          <IconButton
                            label={`Delete ${product.productName}`}
                            icon={<TrashIcon />}
                            variant="danger"
                            onClick={() => setPendingDelete(product)}
                          />
                        )}
                        {isDeleted === "true" && (
                          <IconButton
                            label={`Permanently delete ${product.productName}`}
                            icon={<ArchiveBoxXMarkIcon />}
                            variant="danger"
                            onClick={() => setHardDeleteTarget(product)}
                          />
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </TableShell>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Soft delete confirmation */}
        <ConfirmDialog
          open={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmSoftDelete}
          title="Delete product"
          description={
            pendingDelete
              ? `“${pendingDelete.productName}” will be hidden but can be restored.`
              : ""
          }
          confirmLabel="Delete"
          danger
          loading={isDeleting}
        />

        {/* Hard delete confirmation (type-to-confirm) */}
        <ConfirmDialog
          open={!!hardDeleteTarget}
          onClose={closeHardDelete}
          onConfirm={confirmHardDelete}
          title="Permanently delete product"
          description={
            hardDeleteTarget
              ? `“${hardDeleteTarget.productName}” and all its images will be permanently removed. This is irreversible.`
              : "This will permanently delete the product and all its images. This is irreversible."
          }
          confirmLabel="Delete Permanently"
          requireText="delete"
          danger
          loading={isHardDeleting}
        />
      </div>
    );
  }
);

ProductList.displayName = "ProductList";
export default ProductList;
