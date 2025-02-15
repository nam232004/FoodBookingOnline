import { useFormStatus } from 'react-dom';
import Button from '@mui/material/Button';
import { GoogleIcon } from '@/layout/shared-theme/CustomIcons';
const GoogleSign = () => {
  const { pending, data, method } = useFormStatus();
  console.log(data, method);
  return (
    <Button
      fullWidth
      variant="outlined"
      type="submit"
      disabled={pending}
      startIcon={<GoogleIcon />}
    >
      {pending ? 'Đang xử lý...' : 'Đăng nhập bằng Facebook'}
    </Button>
  );
};

export default GoogleSign;
