import { Modal } from "antd";
import { ModalProps } from "antd/es/modal/interface";

export function JazzModal({ children, ...rest }: ModalProps) {
  return (
    <Modal {...rest} styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto" } }}>
      {children}
    </Modal>
  );
}
