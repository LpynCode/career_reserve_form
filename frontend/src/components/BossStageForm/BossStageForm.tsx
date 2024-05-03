import { notification, Form, Button, FormProps, Space, Select } from "antd";
import { sendBossRequest } from "../../api/requests";
import { openNotification } from "../../helpers/open-notification";
import TextArea from "antd/es/input/TextArea";
import { requiredField } from "../../constants/required-field";
import { curUserID } from "../../config/global";
import { IBossForm } from "../../shared/models/boss-form.interface";

interface BossStageFormProps extends FormProps {
    setError: (message: string) => void;
    formData: {id: string} | null;
}

export const BossStageForm = ({setError, formData, disabled, ...props}: BossStageFormProps) => {
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm<IBossForm>();

    const onFinish = (data: IBossForm) => {
        sendBossRequest(formData!.id, data)
            .then(({message}) => openNotification(<Space>
                <span>{message}</span>
                <Button onClick={redirectToRequestsPage} type="primary">ОК</Button>
            </Space>, api))
            .catch(() => setError("Ошибка отправки заявки"));
    }

    const redirectToRequestsPage = () => {
        window.location.href = `/requests/${curUserID}`
    }
    
    return (
        <>
            {contextHolder}
            <Form 
                form={form}
                onFinish={onFinish} 
                disabled={disabled}
                {...props}
            >
                <Form.Item label="Рекомендация руководителя" name={"recommendation"} rules={[requiredField]}>
                    <Select>
                        <Select.Option value="Рекомендован">Рекомендован</Select.Option>
                        <Select.Option value="Не рекомендован">Не рекомендован</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Комментарий"
                    name={"boss_comment"}
                    rules={[requiredField]}
                >
                    <TextArea />
                </Form.Item >
                {!disabled &&<Form.Item >
                    <Button htmlType="submit">Отправить</Button>
                </Form.Item>}
            </Form>

        </>
    )
}