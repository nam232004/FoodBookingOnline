'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
} from '@mui/material';
import BtnFavorite from './BtnFavourite';
import { Menu } from '@/types/Menu';
import { FaStar } from 'react-icons/fa6';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/slice/cartSlice';
import { formatPrice } from '@/utils/priceVN';
import SnackbarNotification from './SnackbarAlert';
import { addToWishlist } from '@/store/slice/whishList';

interface FoodDetailModalProps {
  open: boolean;
  food: Menu;
  quantity: number | null;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}

const FoodDetailModal = ({
  open,
  food,
  quantity,
  onClose,
  onSubmit,
}: FoodDetailModalProps) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('success');

  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ quantity: quantity || 1 });
  const [des, ingredients] = food?.description
    ? food.description.split(' - ').map((part) => part.trim())
    : ['Đang cập nhật...', 'Đang cập nhật...'];
  const [selectedSize, setSelectedSize] = useState('M');

  const [price, setPrice] = useState(
    food.variant && food.variant.length > 0 ? food.variant[0].price : food.price
  );

  useEffect(() => {
    if (food.variant && food.variant.length > 0) {
      setSelectedSize(food.variant[0].size);
      setPrice(food.variant[0].price);
    }
  }, [food.variant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      const quantity = parseInt(value, 10);
      if (quantity > 0) {
        setFormData({ ...formData, [name]: quantity });
      }
    }
  };
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const selectedVariant = food.variant?.find((v) => v.size === size);
    setPrice(selectedVariant?.price || food.price);
  };
  const handleAddToWishlist = (food: Menu) => {
    try {
      const item = {
        ...food,
        quantity: formData.quantity !== null ? formData.quantity : 1,
        selectedSize,
        price,
      };

      dispatch(addToWishlist(item)); // Add to wishlist instead of cart

      setSnackbarOpen(false);
      setTimeout(() => {
        setSnackbarMessage(`${food.name} đã được thêm vào wishlist!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }, 0);
    } catch {
      setSnackbarOpen(false);
      setTimeout(() => {
        setSnackbarMessage('Đã xảy ra lỗi khi thêm vào wishlist!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }, 0);
    }
  };

  const handleAddToCart = (food: Menu) => {
    try {
      const item = {
        ...food,
        quantity: formData.quantity !== null ? formData.quantity : 1,
        selectedSize,
        price,
      };
      dispatch(addToCart(item));

      setSnackbarOpen(false);
      setTimeout(() => {
        setSnackbarMessage(`${food.name} đã được thêm vào giỏ hàng!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }, 0);
    } catch {
      setSnackbarOpen(false);
      setTimeout(() => {
        setSnackbarMessage('Đã xảy ra lỗi khi thêm vào giỏ hàng!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }, 0);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData.quantity);
  };
  if (!food) return null;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent
        className="hidden-scroll"
        style={{
          padding: '20px',
          border: '1px solid gray',
          color: '#1a285a',
        }}
      >
        <Grid
          container
          spacing={2}
          className="container"
          style={{ marginBottom: '20px' }}
        >
          <Grid item xs={12} sm={5}>
            <div className="mx-auto">
              <div className="img-hover-zoom">
                <Image
                  src={
                    food?.img
                      ? food.img.toString()
                      : `${process.env.NEXT_PUBLIC_DOMAIN_BACKEND}/images/default.jpg`
                  }
                  alt={food.name}
                  className="mx-auto bg-transparent "
                  width={400}
                  height={400}
                  objectFit="cover"
                  style={{
                    borderRadius: '8px',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </div>
            </div>
          </Grid>

          <Grid item xs={12} sm={6}>
            <DialogContentText style={{ color: '#1a285a' }}>
              <h2>{food.name}</h2>
            </DialogContentText>

            <Box display="flex" flexDirection="column" height="100%">
              <DialogContentText>
                <div className="">
                  {/* Render stars */}
                  {[...Array(food?.star)].map((_, index) => (
                    <FaStar
                      key={index}
                      style={{
                        color: '#f0e68c',
                        fontSize: '14px',
                        marginBottom: '10px',
                      }}
                    />
                  ))}
                </div>
              </DialogContentText>
              <DialogContentText>
                <h3
                  style={{
                    color: '#1a285a',
                    fontSize: '30px',
                    marginBottom: '15px',
                  }}
                >
                  {food.variant &&
                    Array.isArray(food.variant) &&
                    food.variant.length > 0 ? (
                    <>
                      {formatPrice(price!)} VNĐ
                      <div style={{ marginBottom: '20px' }}>
                        {food.variant.map((option) => (
                          <Button
                            key={option.size}
                            variant={
                              selectedSize === option.size
                                ? 'contained'
                                : 'outlined'
                            }
                            onClick={() => handleSizeChange(option.size)}
                            sx={{
                              marginRight: '10px',
                              color:
                                selectedSize === option.size
                                  ? '#fff'
                                  : '#1a285a',
                              backgroundColor:
                                selectedSize === option.size
                                  ? '#1a285a'
                                  : 'transparent',
                              borderColor: '#1a285a',
                              '&:hover': {
                                backgroundColor:
                                  selectedSize === option.size
                                    ? '#1a285a'
                                    : 'transparent',
                                borderColor: '#1a285a',
                              },
                              '&.Mui-focusVisible': {
                                borderColor: '#1a285a',
                              },
                            }}
                          >
                            {option.size}
                          </Button>
                        ))}
                      </div>
                    </>
                  ) : (
                    `${formatPrice(food.price!)} VNĐ`
                  )}
                </h3>
              </DialogContentText>

              <DialogContentText>
                <p style={{ color: '#101010' }}>Một chút mô tả</p>
              </DialogContentText>
              <DialogContentText style={{ marginBottom: '20px' }}>
                {des}
              </DialogContentText>
              <DialogContentText style={{ marginBottom: '20px' }}>
                {'Thành phần: '}
                {ingredients}
              </DialogContentText>

              <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
                <DialogContentText>
                  <p style={{ color: '#101010' }}>
                    Nhập số lượng bạn muốn order (Còn lại {food.quantity} phần)
                  </p>
                </DialogContentText>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: '20px',
                    border: '1px solid #1a285a',
                    maxWidth: 'fit-content',
                    borderRadius: '50px',
                  }}
                >
                  <div
                    className="btn-custom-plusminus"
                    onClick={() => {
                      const newQuantity = Math.max(1, formData.quantity - 1);
                      setFormData({ ...formData, quantity: newQuantity });
                    }}
                  >
                    <i className="fa fa-minus"></i>
                  </div>

                  <TextField
                    margin="dense"
                    name="quantity"
                    type="number"
                    onChange={handleChange}
                    value={formData.quantity}
                    InputProps={{
                      inputProps: {
                        style: { textAlign: 'center' },
                        readOnly: true,
                      },
                      sx: { height: '30px' },
                    }}
                    style={{
                      width: '80px',
                      textAlign: 'center',
                      borderLeft: '1px solid rgba(26, 40, 90, 0.3)',
                      borderRight: '1px solid rgba(26, 40, 90, 0.3)',
                    }}
                    sx={{
                      '& input[type=number]': {
                        MozAppearance: 'textfield',
                        color: '#1a285a',
                      },
                      '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                      {
                        WebkitAppearance: 'none',
                        margin: 0,
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { border: 'none' },
                        '&:hover fieldset': { border: 'none' },
                        '&.Mui-focused fieldset': { border: 'none' },
                      },
                    }}
                  />

                  <div
                    className="text-center btn-custom-plusminus"
                    onClick={() => {
                      const newQuantity = formData.quantity + 1;
                      setFormData({ ...formData, quantity: newQuantity });
                    }}
                  >
                    <i className="fa fa-plus"></i>
                  </div>
                </div>
                {formData.quantity > food.quantity && (
                  <p style={{ color: 'red', marginTop: '5px' }}>
                    Số lượng vượt quá giới hạn. Vui lòng giảm số lượng.
                  </p>
                )}
                <DialogActions
                  style={{
                    justifyContent: 'start',
                    marginTop: '20px',
                    padding: '0',
                  }}
                >
                  <Button
                    type="submit"
                    className="btn btn-product"
                    onClick={() => handleAddToCart(food)}
                    disabled={formData.quantity > food.quantity}
                    style={{
                      opacity: formData.quantity > food.quantity ? 0.6 : 1,
                      pointerEvents: formData.quantity > food.quantity ? 'none' : 'auto',
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                  <BtnFavorite food={food} onClick={handleAddToWishlist} />
                </DialogActions>

              </form>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <SnackbarNotification
        snackbarOpen={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        snackbarOnclose={() => setSnackbarOpen(false)}
      />
    </Dialog>
  );
};

export default FoodDetailModal;
