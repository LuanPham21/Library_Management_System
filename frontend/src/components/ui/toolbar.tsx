import { Input, Button } from "antd";

type Props = {
  placeholder: string;
  searchInput: string;
  btnTitle: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (value: string) => void;
  onCreate: () => void;
  onClear: () => void;
};

export const Toolbar = ({
  placeholder,
  searchInput,
  btnTitle,
  onSearchInputChange,
  onSearch,
  onCreate,
  onClear,
}: Props) => {
  return (
    <div className="content__header">
      <Input.Search
        placeholder={placeholder}
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        onSearch={onSearch}
        allowClear
        onClear={onClear}
      />

      <Button onClick={onCreate}>{btnTitle}</Button>
    </div>
  );
};
