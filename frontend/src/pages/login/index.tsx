import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, App } from "antd";
import { useLogin } from "./../../hooks/useAuth";
import "./style.scss";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const { notification } = App.useApp();

  const { mutate: login, isPending } = useLogin({
    onError: () => {
      notification.error({
        message: "Đăng nhập thất bại",
        description: "Sai email hoặc mật khẩu",
      });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = ({ email, password }: FormValues) =>
    login({ email, password });

  return (
    <div className="lp-root">
      <div className="lp-bg">
        <div className="lp-orb lp-orb--1" />
        <div className="lp-orb lp-orb--2" />
        <div className="lp-grid" />
      </div>

      <div className="lp-card">
        <aside className="lp-aside">
          <div className="lp-aside__inner">
            <div className="lp-logo">
              <span className="lp-logo__mark">◈</span>
              <span className="lp-logo__name">Nexus</span>
            </div>
            <h2 className="lp-aside__headline">
              Chào mừng
              <br />
              trở lại.
            </h2>
            <p className="lp-aside__sub">
              Đăng nhập để tiếp tục hành trình của bạn cùng chúng tôi.
            </p>
            <div className="lp-aside__deco">
              <div className="lp-diamond" />
            </div>
          </div>
        </aside>

        <main className="lp-form-panel">
          <div className="lp-form-inner">
            <h1 className="lp-form__title">Đăng nhập</h1>
            <p className="lp-form__desc">Nhập thông tin tài khoản của bạn</p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="lp-form lp-form--fields"
            >
              <div className="lp-field">
                <label className="lp-label">Email</label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="you@example.com"
                      size="large"
                      status={errors.email ? "error" : ""}
                      className="lp-input"
                    />
                  )}
                />
                {errors.email && (
                  <span className="lp-error">{errors.email.message}</span>
                )}
              </div>

              <div className="lp-field">
                <label className="lp-label">Mật khẩu</label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input.Password
                      {...field}
                      placeholder="••••••••"
                      size="large"
                      status={errors.password ? "error" : ""}
                      className="lp-input"
                    />
                  )}
                />
                {errors.password && (
                  <span className="lp-error">{errors.password.message}</span>
                )}
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isPending}
                className="lp-btn-submit"
                block
              >
                {isPending ? "Đang xử lý…" : "Đăng nhập"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
