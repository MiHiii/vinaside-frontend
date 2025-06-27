export default function PaymentFooter() {
  return (
    <div className="w-full border-t border-gray-200">
      <footer className="w-full mx-auto py-6 px-8 bg-gray-200">
        <div className="  justify-center space-x-2 text-sm text-gray-500 select-none ">
          <span>Quyền riêng tư</span>
          <span>·</span>
          <a href="/terms" className="hover:underline">
            Điều khoản
          </a>
        </div>
      </footer>
    </div>
  );
}
