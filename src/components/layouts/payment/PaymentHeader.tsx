import { Link } from "react-router-dom";

export default function PaymentHeader() {
  return (
    <header className="w-full ">
      {/* Logo Airbnb */}
      <div className="flex items-center h-24 px-6">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <div className="text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
          <span className="hidden text-xl font-bold md:inline-block">
            Vinaside
          </span>
        </Link>
      </div>
      {/* Dòng kẻ ngang */}
      <div className="border-b border-gray-200 " />

      {/* Hàng mới: Button và Tiêu đề */}
      <div className="flex items-center gap-4 px-6 py-6 ">
        <button className="rounded-full hover:bg-gray-100 p-2">
          <Link
            to={"/room-detail"}
            className="flex items-center justify-center w-full h-full"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor">
              <path
                d="M15 19l-7-7 7-7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </button>
        <h1 className="text-2xl font-semibold">Xác nhận và thanh toán</h1>
      </div>
    </header>
  );
}
