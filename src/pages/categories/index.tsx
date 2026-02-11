import * as React from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category } from "@types";

import { createCategory, fetchCategories } from "@apis/category.api";
import useToastStore, { type ToastState } from "@stores/toastStore";

import CategoryFormDialog, {
  type CategoryFormSubmitPayload,
} from "./components/CategoryFormDialog.tsx";

const QUERY_KEY = {
  categories: ["categories"] as const,
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state: ToastState) => state.showToast);

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

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
    },
  });

  const rows = React.useMemo(() => {
    const list = (data ?? []) as Category[];
    const keyword = query.trim().toLowerCase();
    if (!keyword) return list;

    return list.filter(c => {
      const name = (c.name || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      return name.includes(keyword) || slug.includes(keyword);
    });
  }, [data, query]);

  const handleCreate = async (payload: CategoryFormSubmitPayload) => {
    await createMutation.mutateAsync(payload);
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
            placeholder="Search by name or slug..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setOpen(true)}
            disabled={createMutation.isPending}
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
                  <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
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

                    <TableCell>
                      <Chip label={c.slug} size="small" variant="outlined" />
                    </TableCell>

                    <TableCell sx={{ maxWidth: 520 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {c.description || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      {(c.images?.length ?? 0).toString()}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton size="small" aria-label="More">
                        <MoreVertRoundedIcon />
                      </IconButton>
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
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />
    </Box>
  );
}
