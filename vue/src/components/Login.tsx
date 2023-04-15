import { Button, Col, Form, Row, Input } from "antd";
import { LoginState, useAuth } from "@/commons/auth";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

const Login = () => {
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
    <Row style={{ minHeight: "80vh" }} align="middle" justify="space-around">
      <Col span={24}>
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 12 }} name="login" requiredMark={false} onFinish={onFinish}>
          <Form.Item
            label="Benutzername"
            name="username"
            rules={[
              {
                required: true,
                message: "Muss eingegeben werden",
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
                message: "Muss eingegeben werden",
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
            <Button type="primary" htmlType="submit" loading={loginState === LoginState.PENDING}>
              Anmelden
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Login;
