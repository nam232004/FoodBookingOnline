'use client';

import React, {
  useState,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface OTPVerificationModalProps {
  open: boolean;
  onClose: () => void;
}

// Styled components
const OTPInput = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    width: '56px', // Tăng width
    height: '56px', // Tăng height
    backgroundColor: 'white',
    '& input': {
      padding: '0', // Giảm padding
      textAlign: 'center',
      fontSize: '24px', // Giảm font size xuống cho phù hợp
      fontWeight: '500',
      color: '#000000',
      WebkitTextFillColor: '#000000',
      height: '100%', // Đảm bảo input chiếm toàn bộ chiều cao
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    '& fieldset': {
      borderColor: '#E0E0E0',
      borderRadius: '8px',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#1c1c37',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1c1c37',
      borderWidth: '2px', // Tăng độ dày viền khi focus
    },
  },
  // Thêm styles cho container
  width: '56px',
  height: '56px',
}));
const StyledButton = styled(Button)(() => ({
  backgroundColor: '#1c1c37',
  color: '#ffffff',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#191f29',
  },
  padding: '10px',
}));

const BackButton = styled(Button)(() => ({
  color: '#000',
  textTransform: 'none',
  padding: '10px',
}));

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  open,
  onClose,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (open) {
      setTimer(120);
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 0) {
            clearInterval(intervalId);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [open]);

  const handleOTPChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(
          `input[name="otp-${index + 1}"]`
        ) as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[name="otp-${index - 1}"]`
      ) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = ''; // Clear the previous input
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d+$/.test(pastedData)) {
      const pastedArray = pastedData.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedArray.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      const lastIndex = Math.min(pastedArray.length, 5);
      const lastInput = document.querySelector(
        `input[name="otp-${lastIndex}"]`
      ) as HTMLInputElement;
      if (lastInput) lastInput.focus();
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          p: 2,
          backgroundColor: '#f8f9fa', // Light background for dialog
        },
      }}
    >
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Vui lòng nhập thông tin bên dưới!
          </Typography>

          <Typography sx={{ mt: 2, color: '#666' }}>
            {`Nhập mã xác thực OTP gửi email của bạn`}
          </Typography>

          {/* OTP Input Fields */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              my: 2,
            }}
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <OTPInput
                key={index}
                name={`otp-${index}`}
                value={digit} // Ensure the input value is updated
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                variant="outlined"
                inputProps={{
                  maxLength: 1,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  autoComplete: 'off',
                }}
              />
            ))}
          </Box>

          {/* Timer and Resend */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            <Typography sx={{ color: '#666' }}>
              {`${minutes.toString().padStart(2, '0')}:${seconds
                .toString()
                .padStart(2, '0')} giây`}
            </Typography>
            <Link href="#" style={{ textDecoration: 'none' }}>
              <Typography sx={{ color: 'rgb(20, 20, 20)' }}>Gửi lại</Typography>
            </Link>
          </Box>

          {/* Action Buttons */}
          <StyledButton fullWidth>Xác nhận</StyledButton>

          <BackButton fullWidth onClick={onClose}>
            Trở về
          </BackButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;
