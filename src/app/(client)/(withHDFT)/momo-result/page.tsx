import { PackageCheck } from "lucide-react";

export default function Page() {
  return (
    <div className="h-full flex-1 flex items-center justify-center">
      <div className="flex flex-col justify-center gap-5 items-center">
        <PackageCheck size={48} />
        <div className="flex flex-col items-center justify-center">
          <h1>Thanh toán thành công. Cảm ơn quý khách</h1>
          <a className="hover:underline" href="/">
            Quay về trang chủ.
          </a>
        </div>
      </div>
    </div>
  );
}
