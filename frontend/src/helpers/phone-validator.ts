import { RuleRender } from "antd/es/form";


export const validatePhone: RuleRender = () => ({
    validator(_, value) {
        if (!value || value.length !== 10 || !Number(value)) {
            return Promise.reject(new Error('Неверный формат номера телефона'));
        }
        return Promise.resolve();
    }
})