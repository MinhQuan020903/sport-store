"use client";

import React, { useEffect } from "react";
import { getRequest } from "@/lib/fetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AddressForm = ({ onComplete, enable }) => {
  const session = useSession();
  const [selectedProvince, setSelectedProvince] = React.useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<string>("");
  const [selectedWard, setSelectedWard] = React.useState<string>("");

  const [isLoadingProvince, setIsLoadingProvince] = React.useState(false);
  const [isLoadingDistrict, setIsLoadingDistrict] = React.useState(false);
  const [isLoadingWard, setIsLoadingWard] = React.useState(false);

  const [provinces, setProvince] = React.useState([]);
  const [districts, setDistrict] = React.useState([]);
  const [wards, setWard] = React.useState([]);

  const [streetValue, setStreetValue] = React.useState("");
  const [houseNumberValue, setHouseNumberValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    async function getProvince() {
      setIsLoadingProvince(true);
      const res = await getRequest({
        endPoint: "https://provinces.open-api.vn/api/p/",
      });

      setProvince(res);
      setIsLoadingProvince(false);
    }
    getProvince();
  }, []);

  useEffect(() => {
    setDistrict([]);
    setWard([]);
    setSelectedDistrict("");
    setSelectedWard("");

    async function getDistrict() {
      if (!!selectedProvince) {
        setIsLoadingDistrict(true);

        const res = await getRequest({
          endPoint: `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`,
        });
        setDistrict(res?.districts);
        setIsLoadingDistrict(false);
      }
    }
    getDistrict();
  }, [selectedProvince]);

  useEffect(() => {
    setWard([]);
    setSelectedWard("");

    async function getWard() {
      if (!!selectedDistrict) {
        setIsLoadingWard(true);

        const res = await getRequest({
          endPoint: `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`,
        });
        setWard(res?.wards);
        setIsLoadingWard(false);
      }
    }

    getWard();
  }, [selectedDistrict]);

  const isProvinceValid = !!selectedProvince;
  const isDistrictValid = !!selectedDistrict;
  const isWardValid = !!selectedWard;

  const onSubmit = () => {
    const provinceValue = provinces.find(
      (province) => province.code == selectedProvince
    )?.name;

    const districtValue = districts.find(
      (district) => district.code == selectedDistrict
    )?.name;

    const wardValue = wards.find((ward) => ward.code == selectedWard)?.name;

    // Concatenate all address parts into a single string
    const fullAddressValue = `${houseNumberValue}, ${streetValue}, ${wardValue}, ${districtValue}, ${provinceValue}`;

    console.log(fullAddressValue);

    // Just pass the concatenated address back to the parent component
    // instead of making a POST request
    if (onComplete) {
      // onComplete(fullAddressValue);
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
          key={"province"}
          value={selectedProvince}
          onValueChange={setSelectedProvince}
        >
          <SelectTrigger className="w-[98%]" disabled={isLoadingProvince}>
            <SelectValue placeholder="Tỉnh / Thành phố" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-scroll">
            {provinces?.map((province) => (
              <SelectItem key={province.code} value={province.code}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="col-span-1">
          <Select
            key={"district"}
            value={selectedDistrict}
            onValueChange={setSelectedDistrict}
          >
            <SelectTrigger
              className="w-[98%]"
              disabled={isLoadingDistrict || !isProvinceValid}
            >
              <SelectValue placeholder="Quận / Huyện" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-scroll">
              {districts?.map((district) => (
                <SelectItem key={district.code} value={district.code}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1">
          <Select
            key={"ward"}
            value={selectedWard}
            onValueChange={setSelectedWard}
            disabled={isLoadingWard}
          >
            <SelectTrigger
              className="w-[98%]"
              disabled={isLoadingWard || !isDistrictValid}
            >
              <SelectValue placeholder="Phường / Xã" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-scroll">
              {wards?.map((ward) => (
                <SelectItem key={ward.code} value={ward.code}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
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
            !houseNumberValue ||
            enable
          }
          onClick={onSubmit}
        >
          Xác nhận
        </Button>
      </div>
    </div>
  );
};
