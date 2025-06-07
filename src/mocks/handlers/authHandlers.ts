import { http, HttpResponse } from "msw";

// Interface định nghĩa dữ liệu
interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface RefreshResponse {
  accessToken: string;
}
interface RegisterPayload {
  email: string;
  name: string;
  phone: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface OtpPayload {
  email: string;
  otp: string;
}
// Mock data lưu user
const mockUsers: User[] = [


  { id: "1", email: "mock@user.com", name: "Mock User", phone: "123456789" },
];
const otpMap: Record<
  string,
  { otp: string; createdAt: number; attempts: number }
> = {};

const OTP_COOLDOWN = 60 * 1000;
const MAX_ATTEMPTS = 3;
const WINDOW_DURATION = 5 * 60 * 1000;


export const authHandlers = [
  // Đăng nhập
  http.post("/auth/login", async ({ request }) => {
    const data = (await request.json()) as LoginPayload;
    // Tìm user mock
    const user = mockUsers.find((u) => u.email === data.email);
    if (!user) {
      return HttpResponse.json({ message: "User not found" }, { status: 404 });
    }
    // Trả token giả
    const response: AuthResponse = { accessToken: "mock-token", user };
    return HttpResponse.json(response);
  }),

  // Đăng ký
  http.post("/auth/register", async ({ request }) => {
    const data = (await request.json()) as RegisterPayload;

    if (mockUsers.find((u) => u.email === data.email)) {
      return HttpResponse.json(
        { message: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpMap[data.email] = {
      otp,
      createdAt: now,
      attempts: 1,
    };

    console.log(`[MSW] Gửi OTP lần đầu cho ${data.email}: ${otp}`);

    return HttpResponse.json(
      {
        message: "OTP sent to email",
        email: data.email,
        user: {
          id: Date.now().toString(),
          email: data.email,
          name: data.name,
          phone: data.phone,
        },
      },
      { status: 200 }
    );
  }),

  http.post("/auth/verify-otp", async ({ request }) => {
    const data = (await request.json()) as OtpPayload;

    const { email, otp } = data;

    const record = otpMap[email];

    if (!record) {
      return HttpResponse.json(
        { message: "Không tìm thấy OTP cho email này" },
        { status: 400 }
      );
    }
    console.log("Record OTP: ", record.otp);
    console.log("User input OTP: ", otp);
    if (record.otp !== otp) {
      return HttpResponse.json(
        { message: "OTP không hợp lệ" },
        { status: 400 }
      );
    }

    const user: User = {
      id: Date.now().toString(),
      email,
      name: "Tên demo",
      phone: "0987000000",
    };

    mockUsers.push(user);
    delete otpMap[email]; 

    return HttpResponse.json(
      {
        message: "OTP verified",
        accessToken: "mock-token",
        user,
      },
      { status: 200 }
    );
  }),

  http.post("/auth/resend-otp", async ({ request }) => {
    const data = (await request.json()) as OtpPayload;

    const { email } = data;
    const now = Date.now();
    const record = otpMap[email];
    if (record) {
      const timeDiff = now - record.createdAt;
      if (timeDiff < OTP_COOLDOWN) {
        const waitSec = Math.ceil((OTP_COOLDOWN - timeDiff) / 1000);
        return HttpResponse.json(
          { message: `Vui lòng chờ ${waitSec}s trước khi gửi lại OTP.` },
          { status: 429 }
        );
      }
      if (timeDiff < WINDOW_DURATION && record.attempts >= MAX_ATTEMPTS) {
        return HttpResponse.json(
          { message: "Bạn đã gửi lại OTP quá nhiều lần. Thử lại sau." },
          { status: 429 }
        );
      }

      record.otp = Math.floor(100000 + Math.random() * 900000).toString();
      record.createdAt = now;
      record.attempts += 1;
    } else {
      otpMap[email] = {
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        createdAt: now,
        attempts: 1,
      };
    }

    console.log(`[MSW] Resend OTP cho ${email}: ${otpMap[email].otp}`);

    return HttpResponse.json(
      { message: "OTP resent to email" },
      { status: 200 }
    );
  }),

  // Làm mới token
  http.post("/auth/refresh-token", () => {
    const response: RefreshResponse = { accessToken: "new-mock-token" };
    return HttpResponse.json(response);
  }),
];
