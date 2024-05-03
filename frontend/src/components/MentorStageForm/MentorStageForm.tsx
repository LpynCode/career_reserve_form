import { notification, Form, Space, Button, FormProps } from "antd";
import { closeRequest, sendToCO } from "../../api/requests";
import { curUserID } from "../../config/global";
import { openNotification } from "../../helpers/open-notification";
import { IBossForm } from "../../shared/models/boss-form.interface";
import { useState } from "react";
import { MentorRejectForm } from "../MentorRejectForm/MentorRejectForm";
import { IMentorForm } from "../../shared/models/mentor-form.interface";

interface MentorStageFormProps extends FormProps {
    setError: (message: string) => void;
    formData: {id: string} | null;
}

export const MentorStageForm = ({setError, formData, ...props}: MentorStageFormProps) => {
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm<IBossForm>();
    const [rejectStageShown, setRejectStageShown] = useState(false);

    const onFinish = () => {
        sendToCO(formData!.id)
            .then(({message}) => openNotification(<Space>
                <span>{message}</span>
                <Button onClick={redirectToRequestsPage} type="primary">ОК</Button>
            </Space>, api))
            .catch(() => setError("Ошибка отправки заявки"));
    }

    const closeRequestForm = (data: IMentorForm) => {
        closeRequest(formData!.id, data)
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
                {...props}
            >
                <Space>
                    <Form.Item >
                        <Button onClick={() => setRejectStageShown(true)}>Отклонить</Button>
                    </Form.Item>
                    <Form.Item >
                        <Button htmlType="submit">Перевести на этап ЦО</Button>
                    </Form.Item>
                </Space>
            </Form>
            {rejectStageShown && <MentorRejectForm closeRequest={closeRequestForm}/>}

        </>
    )
}