import { FormProps } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { FormState } from "../../shared/models/form-states.type";

export interface ApplicationFormProps extends FormProps {
    reserveTypes: DefaultOptionType[]
    positions: DefaultOptionType[];
    subdivisions: DefaultOptionType[];
    setError: (error: string) => void;
    bosses: DefaultOptionType[];
    educationTypes: DefaultOptionType[];
    isFirst: boolean;
    formData: {id: string; state: FormState} | null;
}