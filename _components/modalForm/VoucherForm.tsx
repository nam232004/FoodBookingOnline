import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Grid,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  createVoucherAsync,
  fetchVouchers,
  updateVoucherAsync,
} from '@/store/slice/voucherSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { Voucher } from '@/types/Voucher';

// Updated schema to handle both File and string types for the img field
const schema = z
  .object({
    name: z.string().min(1, 'Tên voucher là bắt buộc'),
    code: z.string().min(1, 'Mã voucher là bắt buộc'),
    discount_percent: z
      .number()
      .min(1, 'Phần trăm giảm giá tối thiểu là 1%')
      .max(100, 'Phần trăm giảm giá không được vượt quá 100%'),
    start: z.date().min(new Date(), 'Ngày bắt đầu phải sau thời điểm hiện tại'),
    end: z.date(),
    limit: z
      .number()
      .min(1, 'Số lượng phải lớn hơn 0')
      .int('Số lượng phải là số nguyên'),
    min_price: z
      .number()
      .min(1000, 'Giá tối thiểu phải từ 1.000 VND trở lên')
      .optional()
      .nullable(),
    img: z
      .union([
        z.custom<File>((v) => v instanceof Blob),
        z.string(),
        z.undefined(),
      ])
      .optional(),
  })
  .refine((data) => data.end > data.start, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['end'],
  });

type VoucherFormData = z.infer<typeof schema>;

interface VoucherModalProps {
  open: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  mode: 'edit' | 'view' | 'create' | null;
}

const style = {
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '8px',
    p: 4,
    width: { xs: '90%', sm: '80%', md: '60%', lg: '50%' },
    maxHeight: '90vh',
    overflow: 'auto',
  },
  buttonContainer: {
    mt: 4,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
  },
  formControl: {
    width: '100%',
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    mt: 2,
  },
};

const VoucherModal: React.FC<VoucherModalProps> = ({
  open,
  onClose,
  voucher,
  mode,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: {
      discount_percent: 0,
      limit: 1,
      min_price: 0,
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  useEffect(() => {
    if (voucher) {
      const resetVoucher = {
        ...voucher,
        start: new Date(voucher.start!),
        end: new Date(voucher.end!),
        img: voucher.img, // Keep the img as is, whether it's a string URL or File
      };

      reset(resetVoucher);

      // Set image preview if available
      if (typeof voucher.img === 'string') {
        setImagePreview(voucher.img);
      }
    }
  }, [voucher, reset]);

  const onSubmit = async (data: VoucherFormData) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'img') {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'string') {
            // If it's a string (URL), we don't need to append it to formData
            // The backend should keep the existing image
          } else {
            // If it's undefined or null, we might want to clear the image
            formData.append(key, '');
          }
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      });

      if (mode === 'edit' && voucher && voucher._id) {
        await dispatch(
          updateVoucherAsync({
            _id: voucher._id,
            voucher: data as unknown as Voucher,
          })
        ).unwrap();
        toast.success('Cập nhật voucher thành công!');
      } else {
        await dispatch(createVoucherAsync(data as unknown as Voucher));
        toast.success('Tạo voucher thành công!');
      }

      dispatch(fetchVouchers({ page: 1, limit: 9 }));
      onClose();
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Voucher submission error:', error);
    }
  };

  const isViewMode = mode === 'view';

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="voucher-modal-title"
      aria-describedby="voucher-modal-description"
    >
      <Box sx={style.modalBox}>
        <Typography
          id="voucher-modal-title"
          variant="h6"
          component="h2"
          sx={{ mb: 3 }}
        >
          {mode === 'edit'
            ? 'Chỉnh sửa voucher'
            : mode === 'view'
            ? 'Chi tiết voucher'
            : 'Tạo voucher mới'}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl sx={style.formControl} error={!!errors.name}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tên voucher"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isViewMode}
                    fullWidth
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl sx={style.formControl} error={!!errors.code}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mã voucher"
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    disabled={isViewMode}
                    fullWidth
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl
              sx={style.formControl}
              error={!!errors.discount_percent}
            >
              <Controller
                name="discount_percent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phần trăm giảm giá"
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    error={!!errors.discount_percent}
                    helperText={errors.discount_percent?.message}
                    disabled={isViewMode}
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl sx={style.formControl} error={!!errors.limit}>
              <Controller
                name="limit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Số lượng voucher"
                    type="number"
                    error={!!errors.limit}
                    helperText={errors.limit?.message}
                    disabled={isViewMode}
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl sx={style.formControl}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Controller
                  name="start"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Ngày bắt đầu"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isViewMode}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.start,
                          helperText: errors.start?.message,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl sx={style.formControl}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Controller
                  name="end"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      label="Ngày kết thúc"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isViewMode}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.end,
                          helperText: errors.end?.message,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl sx={style.formControl} error={!!errors.min_price}>
              <Controller
                name="min_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Giá tối thiểu"
                    type="number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">VND</InputAdornment>
                      ),
                    }}
                    error={!!errors.min_price}
                    helperText={errors.min_price?.message}
                    disabled={isViewMode}
                    fullWidth
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl sx={style.formControl} error={!!errors.img}>
              <Controller
                name="img"
                control={control}
                render={({ field: { onChange, value, ...field } }) => {
                  const handleFileChange = (
                    e: React.ChangeEvent<HTMLInputElement>
                  ) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  };

                  const handleClearFile = () => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                      onChange(undefined);
                      setImagePreview(null);
                    }
                  };

                  return (
                    <>
                      <input
                        {...field}
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="voucher-image-upload"
                      />
                      <OutlinedInput
                        fullWidth
                        readOnly
                        value={
                          value instanceof File
                            ? value.name
                            : typeof value === 'string'
                            ? value
                            : ''
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <Button
                              variant="contained"
                              component="label"
                              htmlFor="voucher-image-upload"
                              disabled={isViewMode}
                            >
                              Chọn ảnh
                            </Button>
                            {value && (
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={handleClearFile}
                                sx={{ ml: 1 }}
                                disabled={isViewMode}
                              >
                                Xóa
                              </Button>
                            )}
                          </InputAdornment>
                        }
                      />
                      {errors.img && (
                        <Typography color="error" variant="caption">
                          {errors.img?.message}
                        </Typography>
                      )}
                      {imagePreview && (
                        <Box sx={style.imagePreview}>
                          <img
                            src={imagePreview}
                            alt="Voucher preview"
                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                          />
                        </Box>
                      )}
                    </>
                  );
                }}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={style.buttonContainer}>
          {!isViewMode && (
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              sx={{ minWidth: '120px' }}
            >
              {mode === 'edit' ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ minWidth: '120px' }}
          >
            {isViewMode ? 'Đóng' : 'Hủy'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default VoucherModal;
