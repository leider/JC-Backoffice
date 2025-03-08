import { Button, Col, Form, Row, Input } from "antd";
import { LoginState, useAuth } from "@/commons/authConsts.ts";
import { Navigate, useLocation } from "react-router";
import React from "react";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";

function Login() {
  const { login, loginState } = useAuth();
  const { search } = useLocation();
  const from = search.substring(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = (values: any) => {
    login(values.username, values.password);
  };

  if (loginState === LoginState.LOGGED_IN) {
    return <Navigate to={decodeURIComponent(from)} />;
  }
  return (
    <RowWrapper>
      <Row align="middle" justify="space-around" style={{ minHeight: "80vh" }}>
        <Col span={24}>
          <Form labelCol={{ span: 6 }} name="login" onFinish={onFinish} requiredMark={false} wrapperCol={{ span: 12 }}>
            <Form.Item
              label="Benutzername"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Du musst einen Wert eingeben",
                },
              ]}
            >
              <Input autoFocus />
            </Form.Item>

            <Form.Item
              label="Passwort"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Du musst einen Wert eingeben",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              wrapperCol={{ offset: 6 }}
              {...(loginState === LoginState.CREDENTIALS_INVALID && {
                validateStatus: "error",
                help: "Falsche Daten",
              })}
            >
              <Button htmlType="submit" loading={loginState === LoginState.PENDING} type="primary">
                Anmelden
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </RowWrapper>
  );
}

export default Login;
