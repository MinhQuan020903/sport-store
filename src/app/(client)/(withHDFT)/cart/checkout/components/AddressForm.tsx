'use client';

import React, { useEffect } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import { getRequest } from '@/lib/fetch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import Loader from '@/components/Loader';

export const AddressForm = ({ onComplete }) => {
  const session = useSession();
  const [selectedProvince, setSelectedProvince] = React.useState(new Set([]));
  const [selectedDistrict, setSelectedDistrict] = React.useState(new Set([]));
  const [selectedWard, setSelectedWard] = React.useState(new Set([]));

  const [provinceTouched, setProvinceTouched] = React.useState(false);
  const [districtTouched, setDistrictTouched] = React.useState(false);
  const [wardTouched, setWardTouched] = React.useState(false);

  const [isLoadingProvince, setIsLoadingProvince] = React.useState(false);
  const [isLoadingDistrict, setIsLoadingDistrict] = React.useState(false);
  const [isLoadingWard, setIsLoadingWard] = React.useState(false);

  const [provinces, setProvince] = React.useState([]);
  const [districts, setDistrict] = React.useState([]);
  const [wards, setWard] = React.useState([]);

  const [streetValue, setStreetValue] = React.useState('');
  const [houseNumberValue, setHouseNumberValue] = React.useState('');
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    async function getProvince() {
      setIsLoadingProvince(true);
      const res = await getRequest({
        endPoint: 'https://provinces.open-api.vn/api/p/',
      });

      setProvince(res);
      setIsLoadingProvince(false);
    }
    getProvince();
  }, []);

  useEffect(() => {
    setDistrict([]);
    setWard([]);
    setSelectedDistrict(new Set([]));
    setSelectedWard(new Set([]));

    async function getDistrict() {
      if (selectedProvince.size > 0) {
        setIsLoadingDistrict(true);
        const valuesArray = Array.from(selectedProvince);
        const provinceCode = valuesArray[0];
        const res = await getRequest({
          endPoint: `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
        });
        setDistrict(res?.districts);
        setIsLoadingDistrict(false);
      }
    }
    getDistrict();
  }, [selectedProvince]);

  useEffect(() => {
    setWard([]);
    setSelectedWard(new Set([]));

    async function getWard() {
      if (selectedDistrict.size > 0) {
        setIsLoadingWard(true);
        const valuesArray = Array.from(selectedDistrict);
        const districtCode = valuesArray[0];
        const res = await getRequest({
          endPoint: `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
        });
        setWard(res?.wards);
        setIsLoadingWard(false);
      }
    }

    getWard();
  }, [selectedDistrict]);

  const isProvinceValid = selectedProvince.size > 0;
  const isDistrictValid = selectedDistrict.size > 0;
  const isWardValid = selectedWard.size > 0;

  const onSubmit = () => {
    const valuesArrayProvince = Array.from(selectedProvince);
    const provinceCode = valuesArrayProvince[0];
    const provinceValue = provinces.find(
      (province) => province.code == provinceCode
    )?.name;

    const valuesArrayDistrict = Array.from(selectedDistrict);
    const districtCode = valuesArrayDistrict[0];
    const districtValue = districts.find(
      (district) => district.code == districtCode
    )?.name;

    const valuesArrayWard = Array.from(selectedWard);
    const wardCode = valuesArrayWard[0];
    const wardValue = wards.find((ward) => ward.code == wardCode)?.name;

    // Concatenate all address parts into a single string
    const fullAddressValue = `${houseNumberValue}, ${streetValue}, ${wardValue}, ${districtValue}, ${provinceValue}`;

    // Just pass the concatenated address back to the parent component
    // instead of making a POST request
    if (onComplete) {
      onComplete(fullAddressValue);
    }
  };

  return isLoading ? (
    <div className="flex w-full justify-center items-center py-8">
      <Loader />
    </div>
  ) : (
    <div className="flex flex-col gap-y-4">
      <div className="w-full flex flex-col gap-4">
        <Select
          key={'province'}
          label="Tỉnh / Thành phố"
          placeholder="Chọn tỉnh/thành phố"
          isInvalid={isProvinceValid || !provinceTouched ? false : true}
          errorMessage={
            isProvinceValid || !provinceTouched
              ? ''
              : 'Vui lòng chọn tỉnh/thành phố'
          }
          selectedKeys={selectedProvince}
          isLoading={isLoadingProvince}
          onSelectionChange={setSelectedProvince}
          onClose={() => setProvinceTouched(true)}
          size="sm"
          className="w-[98%]"
        >
          {provinces?.map((province) => (
            <SelectItem key={province.code} value={province.code}>
              {province.name}
            </SelectItem>
          ))}
        </Select>

        <div className="col-span-1">
          <Select
            key={'district'}
            label="Quận / Huyện"
            placeholder="Chọn quận/huyện"
            isInvalid={isDistrictValid || !districtTouched ? false : true}
            errorMessage={
              isDistrictValid || !districtTouched
                ? ''
                : 'Vui lòng chọn quận/huyện'
            }
            selectedKeys={selectedDistrict}
            isLoading={isLoadingDistrict}
            onSelectionChange={setSelectedDistrict}
            onClose={() => setDistrictTouched(true)}
            isDisabled={!isProvinceValid}
            size="sm"
            className="w-[98%]"
          >
            {districts?.map((district) => (
              <SelectItem key={district.code} value={district.code}>
                {district.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div className="col-span-1">
          <Select
            key={'ward'}
            label="Phường / Xã"
            placeholder="Chọn phường/xã"
            isInvalid={isWardValid || !wardTouched ? false : true}
            errorMessage={
              isWardValid || !wardTouched ? '' : 'Vui lòng chọn phường/xã'
            }
            selectedKeys={selectedWard}
            isLoading={isLoadingWard}
            onSelectionChange={setSelectedWard}
            onClose={() => setWardTouched(true)}
            isDisabled={!isDistrictValid}
            size="sm"
            className="w-[98%]"
          >
            {wards?.map((ward) => (
              <SelectItem key={ward.code} value={ward.code}>
                {ward.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="street">Tên đường</Label>
          <Input
            id="street"
            value={streetValue}
            onChange={(e) => setStreetValue(e.target.value)}
            placeholder="Nhập tên đường"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="houseNumber">Số nhà</Label>
          <Input
            id="houseNumber"
            value={houseNumberValue}
            onChange={(e) => setHouseNumberValue(e.target.value)}
            placeholder="Nhập số nhà"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <Button variant="outline" onClick={onComplete}>
          Hủy
        </Button>
        <Button
          disabled={
            !isProvinceValid ||
            !isDistrictValid ||
            !isWardValid ||
            !streetValue ||
            !houseNumberValue
          }
          onClick={onSubmit}
        >
          Xác nhận
        </Button>
      </div>
    </div>
  );
};
