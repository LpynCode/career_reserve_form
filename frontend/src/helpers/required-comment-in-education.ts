import { RuleRender } from "antd/es/form";


export const requiredCommentInEducationBlock: RuleRender = ({ getFieldValue }) => ({
    validator(_, value) {
        console.log(getFieldValue(['education',' type_id']))
        if (!value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Пароли не совпадают'));
    }
})