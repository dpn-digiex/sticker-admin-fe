import * as React from "react";

import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  TextField,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchCategories } from "@apis/category.api";
import { deleteProduct, fetchProducts } from "@apis/product.api";
import useToastStore, { type ToastState } from "@stores/toastStore";
import type { Category, Product } from "@types";

import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import ProductUpdateModal from "./components/ProductUpdateModal";

const QUERY_KEY = {
  categories: ["categories"] as const,
  products: (params: {
    categoryId?: string;
    page: number;
    limit: number;
    keyword?: string;
  }) => ["products", params] as const,
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

export default function ProductListPage() {
  const showToast = useToastStore((s: ToastState) => s.showToast);
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [keyword, setKeyword] = React.useState("");
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(
    null
  );
  const [productToEditId, setProductToEditId] = React.useState<string | null>(
    null
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("Product deleted successfully.", "success");
      setProductToDelete(null);
    },
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: QUERY_KEY.categories,
    queryFn: fetchCategories,
    staleTime: 30_000,
  });

  const {
    data: response,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useQuery({
    queryKey: QUERY_KEY.products({
      categoryId: categoryId || undefined,
      page: page + 1,
      limit: rowsPerPage,
      keyword: keyword.trim() || undefined,
    }),
    queryFn: () =>
      fetchProducts({
        category_id: categoryId || undefined,
        page: page + 1,
        limit: rowsPerPage,
        keyword: keyword.trim() || undefined,
      }),
    staleTime: 15_000,
  });

  const products = response?.data ?? ([] as Product[]);
  const hasNextPage = products.length >= rowsPerPage;

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUpdateProduct = (product: Product) => {
    setProductToEditId(product.id);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const categoryMap = React.useMemo(() => {
    const map = new Map<string, Category>();
    (categories as Category[]).forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        flexWrap="wrap"
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Product List
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage products. Filter by category and use paging.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="product-list-category-label">Category</InputLabel>
            <Select
              labelId="product-list-category-label"
              value={categoryId}
              label="Category"
              onChange={e => {
                setCategoryId(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All categories</MenuItem>
              {(categories as Category[]).map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search by name..."
            value={keyword}
            onChange={e => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          />
        </Stack>
      </Stack>

      <Card sx={{ mt: 2, borderRadius: 3 }}>
        <CardContent>
          {isLoadingCategories && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Loading categories...
              </Typography>
            </Stack>
          )}

          {isLoadingProducts && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ py: 2 }}
            >
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading products...
              </Typography>
            </Stack>
          )}

          {!isLoadingProducts && !isProductsError && (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Stock
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map(p => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 650 }}>
                          {p.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={p.slug} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {categoryMap.get(p.categoryId)?.name ?? p.categoryId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.productType}
                          size="small"
                          color={
                            p.productType === "preorder"
                              ? "secondary"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {p.price != null ? `${p.currency} ${p.price}` : "-"}
                      </TableCell>
                      <TableCell align="right">{p.stock ?? "-"}</TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <IconButton
                            size="small"
                            aria-label="Update product"
                            onClick={() => handleUpdateProduct(p)}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label="Delete product"
                            color="error"
                            onClick={() => handleDeleteProduct(p)}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography color="text.secondary">
                          No products found. Try changing the category or
                          search.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={
                  hasNextPage
                    ? (page + 2) * rowsPerPage
                    : page * rowsPerPage + products.length
                }
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage="Rows per page:"
                labelDisplayedRows={({ from, to }) => `${from}–${to}`}
                nextIconButtonProps={{
                  disabled: !hasNextPage || products.length === 0,
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!productToDelete}
        title="Delete product"
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : undefined
        }
        onConfirm={async () => {
          if (productToDelete)
            await deleteMutation.mutateAsync(productToDelete.id);
        }}
        onCancel={() => setProductToDelete(null)}
        isDeleting={deleteMutation.isPending}
      />

      <ProductUpdateModal
        open={!!productToEditId}
        productId={productToEditId}
        onClose={() => setProductToEditId(null)}
      />
    </Box>
  );
}
