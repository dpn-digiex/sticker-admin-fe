import * as React from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@apis/category.api";
import useToastStore, { type ToastState } from "@stores/toastStore";
import type { Category } from "@types";

import CategoryFormDialog, {
  type CategoryFormSubmitPayload,
} from "./components/CategoryFormDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";

const QUERY_KEY = {
  categories: ["categories"] as const,
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state: ToastState) => state.showToast);

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(
    null
  );
  const [categoryToEdit, setCategoryToEdit] = React.useState<Category | null>(
    null
  );

  const {
    data,
    isLoading,
    isError: isGetDataError,
  } = useQuery({
    queryKey: QUERY_KEY.categories,
    queryFn: fetchCategories,
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CategoryFormSubmitPayload) =>
      createCategory({
        name: payload.name,
        slug: payload.slug,
        description: payload.description || undefined,
        images: payload.images ?? [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY.categories });
      showToast("Category created successfully.", "success");
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CategoryFormSubmitPayload;
    }) =>
      updateCategory(id, {
        name: payload.name,
        slug: payload.slug,
        description: payload.description || undefined,
        images: payload.images ?? [],
        existingImageKeys: payload.existingImageKeys,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY.categories });
      showToast("Category updated successfully.", "success");
      setOpen(false);
      setCategoryToEdit(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY.categories });
      showToast("Category deleted successfully.", "success");
      setCategoryToDelete(null);
    },
  });

  const rows = React.useMemo(() => {
    const list = (data ?? []) as Category[];
    const keyword = query.trim().toLowerCase();
    if (!keyword) return list;

    return list.filter(c => {
      const name = (c.name || "").toLowerCase();
      return name.includes(keyword);
    });
  }, [data, query]);

  const handleFormSubmit = async (
    payload: CategoryFormSubmitPayload,
    categoryId?: string
  ) => {
    if (categoryId) {
      await updateMutation.mutateAsync({ id: categoryId, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category);
    setOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage store categories: view list and create new categories.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Search by name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setCategoryToEdit(null);
              setOpen(true);
            }}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Add Category
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ mt: 2, borderRadius: 3 }}>
        <CardContent>
          {isLoading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Loading categories...
              </Typography>
            </Stack>
          )}

          {!isLoading && !isGetDataError && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Products
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Images
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map(c => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 650 }}>{c.name}</Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 520 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {c.description || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      {c.productCount ?? 0}
                    </TableCell>

                    <TableCell align="right">
                      {(c.images?.length ?? 0).toString()}
                    </TableCell>

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          aria-label="Update category"
                          onClick={() => handleEdit(c)}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Delete category"
                          color="error"
                          onClick={() => handleDelete(c)}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        No categories found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setCategoryToEdit(null);
        }}
        initialCategory={categoryToEdit}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmDialog
        open={!!categoryToDelete}
        title="Delete category"
        message={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`
            : undefined
        }
        onConfirm={async () => {
          if (categoryToDelete)
            await deleteMutation.mutateAsync(categoryToDelete.id);
        }}
        onCancel={() => setCategoryToDelete(null)}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
