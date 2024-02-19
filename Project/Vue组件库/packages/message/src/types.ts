export type IMessageType = "success" | "warning" | "info" | "error";

export interface IMessageOptions {
  id?: string;
  message?: string;
  type?: IMessageType;
  duration?: number;
  center?: boolean;
  offset?: number;
  onClose?: () => void;
}

export type ImessageParams = IMessageOptions | string;
