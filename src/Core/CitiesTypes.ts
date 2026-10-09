

export interface CitiesModalProps {
    show: boolean;
    handleClose: () => void;
    handleCitySelect: (city: string) => void;
  }