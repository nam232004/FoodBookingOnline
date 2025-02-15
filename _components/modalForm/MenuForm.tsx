import * as React from 'react';
import { FormikErrors, useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Typography,
  Divider,
  Box,
  Modal,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Stack,
  IconButton,
  Alert,
  InputLabel,
  Backdrop,
  Fade,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { PhotoCamera, Close, Restaurant, Add } from '@mui/icons-material';
import { addDish, editDish } from '@/store/slice/menusSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectCategories } from '@/store/selector/categoriesSelector';
import { fetchCategories } from '@/store/slice/categorySlice';
import { AppDispatch } from '@/store';
import { Menu, Variant } from '@/types/Menu';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface MenuFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: Menu | null;
  formType: 'add' | 'edit';
  onSubmit: (data: FormData) => Promise<void>;
}

interface Category {
  _id: string;
  name: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Tên món ăn là bắt buộc')
    .min(2, 'Tên món ăn phải có ít nhất 2 ký tự')
    .max(100, 'Tên món ăn không được vượt quá 100 ký tự'),
  description: Yup.string()
    .required('Mô tả là bắt buộc')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  price: Yup.number().when('variant', {
    is: (variant: Variant[]) => !variant || variant.length === 0,
    then: (schema) =>
      schema.required('Giá là bắt buộc').positive('Giá phải là số dương'),
    otherwise: (schema) => schema.notRequired(),
  }),
  quantity: Yup.number()
    .required('Số lượng là bắt buộc')
    .min(1, 'Số lượng phải ít nhất là 1'),
  category: Yup.string().required('Danh mục là bắt buộc'),
  img: Yup.mixed()
    .test('required', 'Ảnh là bắt buộc', function (value) {
      if (this.parent.formType === 'add') {
        return value != null;
      }
      return true;
    })
    .test('fileSize', 'Kích thước tệp ảnh không được vượt quá 5MB', (value) => {
      return value instanceof File ? value.size <= 5 * 1024 * 1024 : true;
    })
    .test(
      'fileType',
      'Chỉ chấp nhận tệp hình ảnh (jpg, jpeg, png)',
      (value) => {
        return value instanceof File
          ? ['image/jpeg', 'image/png', 'image/jpg'].includes(value.type)
          : true;
      }
    ),
  variant: Yup.array().of(
    Yup.object().shape({
      size: Yup.string()
        .required('Kích thước là bắt buộc')
        .oneOf(['XL', 'M', 'L'], 'Kích thước không hợp lệ'),
      price: Yup.number()
        .required('Giá là bắt buộc')
        .positive('Giá phải là số dương'),
    })
  ),
});

const SIZES = ['XL', 'M', 'L'];

export default function MenuForm({
  open,
  onClose,
  initialData,
  formType,
  onSubmit,
}: MenuFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const categories = useSelector(selectCategories) as Category[];

  React.useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 9 }));
  }, [dispatch]);

  React.useEffect(() => {
    if (initialData) {
      if (
        previewUrl &&
        typeof previewUrl === 'string' &&
        previewUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(previewUrl);
      }
      const imgUrl = typeof initialData.img === 'string' ? initialData.img : '';
      setPreviewUrl(imgUrl);
      formik.setFieldValue('img', imgUrl);
    } else {
      setPreviewUrl('');
      formik.setFieldValue('img', null);
    }
  }, [initialData]);

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      quantity: initialData?.quantity || 1,
      category:
        typeof initialData?.category !== 'string'
          ? initialData?.category._id || ''
          : '',
      img: initialData?.img || null,
      variant: (initialData?.variant as Variant[]) || [{ size: 'S', price: 0 }],
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        if (formType === 'add' && !values.img) {
          toast.error('Vui lòng upload ảnh cho món ăn mới');
          setIsSubmitting(false);
          return; // Dừng quá trình submit nếu không có ảnh
        }

        setIsSubmitting(true);
        setError(null);
        console.log(values);

        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (formType === 'add' && !values.img) {
            setError('Ảnh là bắt buộc');
            toast.error('Ảnh là bắt buộc');
            return;
          }
          if (key === 'img') {
            if (values.img instanceof File) {
              formData.append('img', values.img);
            } else if (typeof values.img === 'string') {
              // Nếu img là URL, không cần thêm vào formData
              // formData sẽ không có trường img, backend sẽ giữ nguyên ảnh cũ
            }
          } else if (key === 'variant') {
            formData.append('variant', JSON.stringify(values.variant));
          } else {
            formData.append(key, String(values[key as keyof typeof values]));
          }
        });

        if (formType === 'edit' && initialData?._id) {
          const updatedDish = {
            ...values,
            _id: initialData._id,
          };

          await dispatch(editDish({ id: initialData._id, menu: updatedDish }));
          toast.success(`Cập nhật ${updatedDish.name} thành công`);
        } else {
          await dispatch(addDish(values));
          toast.success(`Thêm ${values.name} thành công`);
        }

        await onSubmit(formData);
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu dữ liệu'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        previewUrl &&
        typeof previewUrl === 'string' &&
        previewUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      formik.setFieldValue('img', file);
    }
  };

  const handleAddVariant = () => {
    const variant = [...formik.values.variant];
    variant.push({ size: 'S', price: 0 });
    formik.setFieldValue('variant', variant);
  };

  const handleRemoveVariant = (index: number) => {
    const variant = [...formik.values.variant];
    variant.splice(index, 1);
    formik.setFieldValue('variant', variant);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Restaurant color="primary" />
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 'medium' }}
              >
                {formType === 'add' ? 'Thêm Món Ăn Mới' : 'Chỉnh Sửa Món Ăn'}
              </Typography>
            </Stack>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Tên Món Ăn"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                autoFocus
              />

              <TextField
                fullWidth
                id="description"
                name="description"
                label="Mô Tả"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />

              <Stack direction="row" spacing={2}>
                {formik.values.variant.length === 0 && (
                  <TextField
                    fullWidth
                    id="price"
                    name="price"
                    label="Giá Cơ Bản"
                    type="number"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    error={formik.touched.price && Boolean(formik.errors.price)}
                    helperText={formik.touched.price && formik.errors.price}
                  />
                )}

                <TextField
                  fullWidth
                  id="quantity"
                  name="quantity"
                  label="Số Lượng"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.quantity && Boolean(formik.errors.quantity)
                  }
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </Stack>

              <FormControl fullWidth>
                <InputLabel id="category">Danh Mục</InputLabel>
                <Select
                  labelId="category"
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  label="Danh Mục"
                  error={
                    formik.touched.category && Boolean(formik.errors.category)
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.category && formik.errors.category && (
                  <FormHelperText error>
                    {formik.errors.category}
                  </FormHelperText>
                )}
              </FormControl>

              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                >
                  Tải ảnh
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
                {formik.touched.img && formik.errors.img && (
                  <FormHelperText error>{formik.errors.img}</FormHelperText>
                )}
                {previewUrl && (
                  <Box sx={{ mt: 2, display: 'inline-block' }}>
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={120}
                      height={120}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </Box>
                )}
              </Box>

              {/* variant Section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                  Quản lý Size và Giá
                </Typography>
                <Stack spacing={2}>
                  {formik.values.variant.map((variant, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        position: 'relative',
                      }}
                    >
                      {' '}
                      <FormControl fullWidth>
                        <InputLabel>Kích Thước</InputLabel>
                        <Select
                          value={variant.size}
                          label="Kích Thước"
                          onChange={(e) =>
                            formik.setFieldValue(
                              `variant.${index}.size`,
                              e.target.value
                            )
                          }
                          error={Boolean(
                            formik.touched.variant?.[index]?.size &&
                              formik.errors.variant?.[index] &&
                              (
                                formik.errors.variant?.[
                                  index
                                ] as FormikErrors<Variant>
                              ).size
                          )}
                        >
                          {SIZES.map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Giá"
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `variant.${index}.price`,
                            e.target.value
                          )
                        }
                        error={Boolean(
                          formik.touched.variant?.[index]?.price &&
                            formik.errors.variant?.[index] &&
                            (
                              formik.errors.variant?.[
                                index
                              ] as FormikErrors<Variant>
                            ).price
                        )}
                        helperText={
                          formik.touched.variant?.[index]?.price &&
                          formik.errors.variant?.[index] &&
                          (
                            formik.errors.variant?.[
                              index
                            ] as FormikErrors<Variant>
                          ).price
                        }
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveVariant(index)}
                        sx={{
                          position: 'absolute',
                          right: -12,
                          top: -12,
                          bgcolor: 'white',
                          boxShadow: 1,
                          '&:hover': { bgcolor: 'grey.100' },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}

                  <Button
                    startIcon={<Add />}
                    onClick={handleAddVariant}
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Thêm Size
                  </Button>
                </Stack>
              </Box>

              <LoadingButton
                fullWidth
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{ mt: 3 }}
              >
                {formType === 'add' ? 'Thêm Món Ăn' : 'Cập Nhật Món Ăn'}
              </LoadingButton>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
