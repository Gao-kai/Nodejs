export type TransferKey = number | string;

export type TransferDataItem = {
  key: TransferKey;
  label: string;
  disabled: boolean;
};

export type TransferPropsAlias = {
  key: string;
  label?: string;
  disabled?: string;
};

export interface ITransferProps {
  data: TransferDataItem[];
  modelValue: TransferKey[];
  props: TransferPropsAlias;
}

export interface ITransferPanelProps {
  data: any[];
  props: TransferPropsAlias;
}
