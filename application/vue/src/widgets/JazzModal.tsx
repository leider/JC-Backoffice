import { Modal } from "antd";
import { ModalProps } from "antd/es/modal/interface";

export function JazzModal(props: ModalProps) {
  return (
    <Modal {...props} styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto" } }}>
      {props.children}
    </Modal>
  );
}
