import React, { useState, useEffect } from 'react';
import { FormLabel, Grid, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Address } from '@/types/User';

// Styled component
const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function AddressForm({
  onAddressUpdate = () => {},
}: {
  onAddressUpdate: (data: Address) => void;
}) {
  const emailInitial = useSelector((state: RootState) => state.profile.email);
  const addressInitial = useSelector((state: RootState) => state.profile.address);
console.log(emailInitial);

  const [addresses, setAddresses] = useState<Address[]>(
    Array.isArray(addressInitial) ? addressInitial : addressInitial ? [addressInitial] : []
  );
  const [selectedAddress, setSelectedAddress] = useState<string>('other');
  const [customAddress, setCustomAddress] = useState<Address>({
    receiver: '',
    phone: '',
    address: '',
  });

  // Sync state with Redux
  useEffect(() => {
    if (addressInitial) {
      setAddresses(Array.isArray(addressInitial) ? addressInitial : [addressInitial]);
    }
  }, [addressInitial]);

  const handleAddressChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setSelectedAddress(value);

    if (value !== 'other') {
      const selected = addresses.find((addr: Address) => addr._id === value);
      setCustomAddress(selected || { receiver: '', phone: '', address: '' });
    } else {
      setCustomAddress({ receiver: '', phone: '', address: '' });
    }
  };

  useEffect(() => {
    onAddressUpdate(customAddress);
  }, [customAddress, onAddressUpdate]);

  const renderAddressFields = () => (
    <>
      <FormGrid item xs={6}>
        <FormLabel htmlFor="custom-receiver" required>
          Tên người nhận
        </FormLabel>
        <OutlinedInput
          id="custom-receiver"
          name="receiver"
          value={customAddress.receiver}
          onChange={(e) =>
            setCustomAddress({ ...customAddress, receiver: e.target.value })
          }
          placeholder="Nguyễn Văn A"
          required
          size="small"
        />
      </FormGrid>
      <FormGrid item xs={6}>
        <FormLabel htmlFor="custom-phone" required>
          Điện thoại
        </FormLabel>
        <OutlinedInput
          id="custom-phone"
          name="phone"
          value={customAddress.phone}
          onChange={(e) =>
            setCustomAddress({ ...customAddress, phone: e.target.value })
          }
          placeholder="0123456789"
          required
          size="small"
          inputProps={{ pattern: '[0-9]{10}', title: 'Vui lòng nhập số điện thoại hợp lệ' }}
        />
      </FormGrid>
      <FormGrid item xs={12}>
        <FormLabel htmlFor="custom-address" required>
          Địa chỉ
        </FormLabel>
        <OutlinedInput
          id="custom-address"
          name="address"
          value={customAddress.address}
          onChange={(e) =>
            setCustomAddress({ ...customAddress, address: e.target.value })
          }
          placeholder="Tên đường và số nhà"
          required
          size="small"
        />
      </FormGrid>
    </>
  );

  return (
    <Grid container spacing={2}>
      <FormGrid item xs={12}>
        <FormLabel htmlFor="email" required>
          Địa chỉ email người nhận
        </FormLabel>
        <OutlinedInput
          id="email"
          name="email"
          type="email"
          value={emailInitial}
          autoComplete="email"
          size="small"
          readOnly
        />
      </FormGrid>

      <FormGrid item xs={12}>
        <FormLabel htmlFor="address-select" required>
          Chọn địa chỉ nhận hàng
        </FormLabel>
        <Select
          id="address-select"
          value={selectedAddress}
          onChange={handleAddressChange}
          displayEmpty
          size="small"
        >
          <MenuItem value="" disabled>
            -- Chọn địa chỉ --
          </MenuItem>
          {addresses.map((addr) => (
            <MenuItem key={addr._id} value={addr._id}>
              {addr.receiver} - {addr.phone} - {addr.address}
            </MenuItem>
          ))}
          <MenuItem value="other">Địa chỉ khác</MenuItem>
        </Select>
      </FormGrid>

      {renderAddressFields()}
    </Grid>
  );
}
