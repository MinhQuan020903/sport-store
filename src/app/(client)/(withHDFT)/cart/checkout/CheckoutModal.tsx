import DialogCustom from "@/components/ui/dialogCustom";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import { useEffect, useState } from "react";
import MultiStepProgressBar from "./components/childComponents/MultiProgressBar";
import GuestInformationForm from "./components/GuestInformationForm";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "./components/PaymentForm";
import { useSession } from "next-auth/react";
import AuthInformationForm from "./components/AuthInformationForm";
import { useUser } from "@/hooks/useUser";
import { useQuery } from "@tanstack/react-query";
import { getRequest } from "@/lib/fetch";
import { Label } from "@/components/ui/label";
import { currencyFormat } from "@/lib/utils";
import Loader from "@/components/Loader";

interface CheckoutModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (input: boolean) => void;
  checkedItems: any;
  total: number;
}

const CheckoutModal = ({
  isModalOpen,
  setIsModalOpen,
  checkedItems,
  total,
}: CheckoutModalProps) => {
  const [page, setPage] = useState("1");
  const [userFullName, setUserFullName] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [orderId, setOrderId] = useState("");

  const { onGetMe } = useUser();

  const { data: userInfo, isLoading: isLoadingUserInfo } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await onGetMe();
      return res;
    },
    onSuccess(data) {
      setUserFullName(data?.username);
      setUserEmail(data?.email);
    },
    enabled: isModalOpen,
  });

  return (
    <div className="w-full h-full px-1">
      <DialogCustom
        className="w-full lg:w-[50%] h-[80%] lg:h-[95%] flex items-center justify-center"
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        warningOnClose={true}
        callBack={() => {}}
      >
        {isLoadingUserInfo ? (
          <div className="flex items-center justify-center h-full w-full">
            <Loader />
          </div>
        ) : (
          <div className="flex w-full flex-col gap-y-5">
            <MultiStepProgressBar page={page} onPageNumberClick={() => {}} />
            <Label>Tổng thành tiền của bạn: {currencyFormat(total)} </Label>
            <Tabs
              selectedKey={page}
              classNames={{
                tabList: "gap-6 w-full  ",
              }}
              aria-label="Options"
            >
              <Tab key={"1"} title="Thông tin">
                {userInfo ? (
                  <AuthInformationForm
                    setUserAddress={setUserAddress}
                    userAddress={userAddress}
                    setUserEmail={setUserEmail}
                    setUserFullname={setUserFullName}
                    email={userEmail}
                    fullName={userFullName}
                    user={userInfo}
                    setPage={setPage}
                    checkedItems={checkedItems}
                    setOrderId={setOrderId}
                  />
                ) : (
                  <GuestInformationForm
                    email={userEmail}
                    fullName={userFullName}
                    setEmail={setUserEmail}
                    setFullName={setUserFullName}
                    addressValue={userAddress}
                    setAddressValue={setUserAddress}
                    setPage={setPage}
                  />
                )}
              </Tab>
              <Tab key={"2"} title="Thanh toán">
                <div className="w-full h-full">
                  <PaymentForm orderId={orderId} />
                  <div className="w-full flex flex-row items-center justify-center gap-x-10 ">
                    <Button
                      className="w-32 mt-10"
                      onClick={() => {
                        setPage("1");
                      }}
                    >
                      Quay lại
                    </Button>
                  </div>
                </div>
              </Tab>
              <Tab key={"3"} title="Hoàn tất">
                <Card>
                  <CardBody>
                    Xin cảm ơn quý khách vì đã mua hàng! Chúc quý khách có những
                    trải nghiệm tốt nhất với sản phẩm của chúng tôi!
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </div>
        )}
      </DialogCustom>
    </div>
  );
};
export default CheckoutModal;
