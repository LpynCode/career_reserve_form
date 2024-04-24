import { FormProps } from "antd";
import { DefaultOptionType } from "antd/es/select";

export interface ApplicationFormProps extends FormProps {
    reserveTypes: DefaultOptionType[]
    positions: DefaultOptionType[];
    subdivisions: DefaultOptionType[];
    bosses: DefaultOptionType[];
    educationTypes: DefaultOptionType[];
    setError: (error: string) => void;
}