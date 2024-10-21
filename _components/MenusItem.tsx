'use client';

import Image from 'next/image';
import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
} from '@mui/material';
import { Dish } from '@/types/Dishes'; 
import Link from 'next/link';
import { FaFire, FaStar } from 'react-icons/fa6';

interface MenusItemProps {
  food: Dish; // Nhận thông tin món ăn qua props
}

const MenusItem = ({ food }: MenusItemProps) => {
  const [open, setOpen] = useState(false); // State để quản lý trạng thái modal
  const [isFavorite, setIsFavorite] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
  });

  // Hàm mở modal
  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  // Hàm đóng modal
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  // Hàm xử lý thay đổi dữ liệu biểu mẫu
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Validate quantity để tránh số âm hoặc zero
    if (name === 'quantity' && +value <= 0) {
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // Hàm xử lý gửi biểu mẫu
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData); // Xử lý dữ liệu gửi ở đây
    handleClose(); // Đóng modal sau khi gửi
  };

  return (
    <div className="col-lg-3 menu-item filter-starters">

      <div className="card product-box shadow p-3" style={{ position: 'relative' }}>
        <Link href={`/user/menus/${food._id}`}>

          <div className='mx-auto overflow-hidden' style={{ width: 'full', height: 'full', position: 'relative' }}>
            <Image
              width={200}
              height={200}
              src={`http://localhost:3002/images/${food.image}`}
              className="card-img-top object-fit-cover img-hover-zoom"
              alt={food.name}
              style={{ border: 'none', background: 'none' }}
            />

          </div>
          {true && (
            <span className='badge bg-warning text-light p-2 text-center' style={{ position: 'absolute', top: '-5px', right: '10px', fontSize: '20px' }}>
              <FaFire />
            </span>

          )}
        </Link>
        <div className="card-body row mt-2 p-0">
          <h5 className="card-title col-12" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1a285a', fontWeight:'bold',textAlign:'center', paddingBottom:'20px' }}>
            {food.name}
            <div>
            {/* Render stars */}
            {[...Array(5)].map((_, index) => (
              <FaStar key={index} style={{ color: '#248F55', fontSize:'14px' }} />
            ))}
            </div>
          </h5>
          <div className='col-5 text-start'>
            <p className="" style={{color: '#248F55', fontSize:'18px'}}>${food.price}</p>
          </div>

          <div className='col-7 text-end'>
            <Button className="btn btn-success" onClick={handleClickOpen}>Xem chi tiết</Button>
          </div>
        </div>
      </div>




      {/* Modal từ MUI */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" >
        <DialogContent className='about hidden-scroll' style={{ paddingTop: '20px', border: '1px solid gray' }}>
          <DialogTitle className="section-title" data-aos="fade-up">
            <p>{food.name}</p>
          </DialogTitle>
          <Grid container spacing={2} className="container" data-aos="fade-up">
            <Grid item xs={12} sm={5}>
              <div
                data-aos="zoom-in"
                data-aos-delay={50}
                className='mx-auto'
              >
                <div className='about-img'>
                  <Image
                    src={`http://localhost:3002/images/${food.image}`}
                    alt={food.name}
                    className='mx-auto bg-transparent'
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
            <Grid item xs={12} sm={1}></Grid>

            <Grid item xs={12} sm={6} >
              {/* Sử dụng Box để tạo flex column layout */}
              <Box display="flex" flexDirection="column" height="100%">
                <DialogContentText>
                  <strong style={{ color: '#cda45e' }}>Một chút mô tả</strong>
                </DialogContentText>
                <DialogContentText style={{ margin: '20px 0', color: 'white' }}>
                  {food.description}
                </DialogContentText>

                {/* Form nhập thông tin */}
                <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
                  <DialogContentText>
                    <strong style={{ color: '#cda45e' }}>Nhập số lượng bạn muốn order</strong>
                  </DialogContentText>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <Button
                      className="btn btn-success"
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })
                      }
                    >
                      <i className="fa fa-minus"></i>
                    </Button>

                    <TextField
                      margin="dense"
                      name="quantity"
                      label="Số lượng"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: 'center' },
                        },
                        sx: {
                          height: '40px',
                        }
                      }}
                      style={{
                        width: '100px',
                        textAlign: 'center',
                      }}
                      sx={{
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                          color: 'white'
                        },
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'gray', // Màu viền bình thường
                          },
                          '&:hover fieldset': {
                            borderColor: '#cda45e', // Màu viền khi hover
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#cda45e',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'gray',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#cda45e',
                        },
                      }}
                    />


                    <Button
                      className="btn btn-success"
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                    >
                      <i className="fa fa-plus"></i>
                    </Button>
                  </div>
                  <div style={{ flexGrow: 1 }}></div>
                  <DialogActions style={{ justifyContent: 'start', marginTop: '20px' }}>
                    <div type="submit" className="btn btn-success" variant="contained">
                      Thêm vào giỏ hàng
                    </div>
                    <div
                      className="rounded-circle border p-2"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 1s ease',
                      }}
                    >
                      <i
                        className={`fa fa-heart ${isFavorite ? 'favorite' : ''}`}
                        style={{
                          fontSize: '24px',
                          color: isFavorite ? 'red' : 'gray',
                        }}
                        onClick={toggleFavorite}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      ></i>
                    </div>

                  </DialogActions>
                </form>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenusItem;
