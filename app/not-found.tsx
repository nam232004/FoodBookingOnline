'use client';
import { FC } from 'react';
import { Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation'; // Dùng `useRouter` để quay lại trang trước đó
import '@/app/_styles/globals.css';
const NotFound: FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    // Điều hướng về trang người dùng hoặc trang chủ
    router.push('/'); // Hoặc có thể thay bằng route mà bạn muốn quay lại
  };

  return (
    <Container sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h3" color="error">
        Không tìm thấy trang
      </Typography>
      <Typography variant="h6" sx={{ mt: 2, color: '#101010' }}>
        Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
      </Typography>
      <Button
        className='btn btn-product'
        sx={{ mt: 4 }}
        onClick={handleGoBack}
      >
        Quay lại trang chủ
      </Button>
    </Container>
  );
};

export default NotFound;
