import { notification, Form, Space, Button, FormProps, Input } from "antd";
import { useState } from "react";
import { sendToCO, closeRequest, closeReuqestWithProgram } from "../../api/requests";
import { curUserID } from "../../config/global";
import { openNotification } from "../../helpers/open-notification";
import { IMentorForm } from "../../shared/models/mentor-form.interface";
import { IBossForm } from "../../shared/models/boss-form.interface";
import { MentorRejectForm } from "../MentorRejectForm/MentorRejectForm";
import { ProgramForm } from "../ProgramForm/ProgramForm";

interface COStageFormProps extends FormProps {
    setError: (message: string) => void;
    formData: {id: string, career_reserve_type_id: string} | null;
}

export const COStageForm = ({setError, formData, ...props}: COStageFormProps) => {
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm<IBossForm>();
    const [rejectStageShown, setRejectStageShown] = useState(false);
    const [pogramFormShown, setProgramFormShown] = useState(false);

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

    const closeRequestWithProgramForm = ({education_program}: {education_program: string}) => {
        closeReuqestWithProgram(formData!.id, {education_program, comment: form.getFieldValue("comment")})
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
                <Form.Item label="Комментарий куратора" name="comment">
                    <Input />
                </Form.Item>
                <Space>
                    <Form.Item >
                        <Button onClick={() => {setRejectStageShown(true); setProgramFormShown(false)}}>Отклонить</Button>
                    </Form.Item>
                    <Form.Item >
                        <Button onClick={() =>{ setProgramFormShown(true); setRejectStageShown(false)}}>Выбрать программу развития</Button>
                    </Form.Item>
                </Space>
            </Form>
            {rejectStageShown && <MentorRejectForm closeRequest={closeRequestForm}/>}
            {pogramFormShown && <ProgramForm closeRequest={closeRequestWithProgramForm} career_reserve_type_id={formData!.career_reserve_type_id}/>}

        </>
    )
}