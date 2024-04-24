import { Button, Form, Input, Select, Space,  notification } from "antd"
import { ApplicationFormProps } from "./Form.props"
import { IApplicationForm } from "../../shared/models/form.interface"
import { validatePhone } from "../../helpers/phone-validator"
import { requiredField } from "../../constants/required-field"
import { EducationFormBlock } from "../EducationFormBlock/EducationFormBlock"
import { CorporateUnivercityBlock } from "../CorporateUnivercityBlock/CorporateUnivercityBlock"
import { createRequest } from "../../api/requests"
import { curUserID } from "../../config/global"

export const ApplicationForm = ({positions, reserveTypes, setError, subdivisions, bosses, educationTypes, ...props}: ApplicationFormProps) => {
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm<IApplicationForm>();

    const onFinish = (data: IApplicationForm) => {
        createRequest({...data, private_phone_number: "+7" + data.private_phone_number, work_phone_number: "+7" + data.work_phone_number})
            .then(({message}) => openNotification(message))
            .catch(setError)
    }

    const onDraftClick = () => {
        const data = form.getFieldsValue();
        createRequest({
            ...data, 
            private_phone_number: data.private_phone_number ? "+7"+data.private_phone_number : "", 
            work_phone_number: data.work_phone_number ? "+7"+data.work_phone_number: "", 
            isDraft: true
        })
            .then(({message}) => openNotification(message))
            .catch(setError)
    }

    const openNotification = (text: string) => {
        api.open({
            message: 'Успешно',
            description:(
                <Space>
                    <span>{text}</span>
                    <Button onClick={redirectToRequestsPage} type="primary">ОК</Button>
                </Space>
            ),
            placement: 'top'
        });
    };

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
                <Form.Item label="Целевая должность" name="target_position_id" rules={[requiredField]}>
                    <Select options={reserveTypes} />
                </Form.Item>

                <Form.Item label="Текущая должность" name="current_position_id" rules={[requiredField]}>
                    <Select options={positions} />
                </Form.Item>

                <Form.Item label="Стаж работы в текущей должности" name="experience_in_current_position" rules={[requiredField]}>
                    <Input type="number" />
                </Form.Item>

                <Form.Item label="Общий стаж работы" name="general_experience" rules={[requiredField]}>
                    <Input type="number" />
                </Form.Item>

                <Form.Item label="Подразделение" name="subdivision_id" rules={[requiredField]}>
                    <Select options={subdivisions} />
                </Form.Item>

                <EducationFormBlock educationTypes={educationTypes}/>
                <CorporateUnivercityBlock/>

                <Form.Item label="Опыт участия в комитетах и наставничестве" name="mentoring_experience" rules={[requiredField]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Личный номер телефона" name="private_phone_number" rules={[requiredField, validatePhone]}>
                    <Input addonBefore="+7"/>
                </Form.Item>

                <Form.Item label="Рабочий номер телефона" name="work_phone_number" rules={[requiredField, validatePhone]}>
                    <Input addonBefore="+7"/>
                </Form.Item>

                <Form.Item label="Корпоративная почта" name="corporate_email" rules={[requiredField, { type: 'email', message: 'Некорректная почта' }]}>
                    <Input/>
                </Form.Item>

                <Form.Item label="Личная почта" name="private_email" rules={[requiredField, { type: 'email', message: 'Некорректная почта' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Руководитель" name="boss_id" rules={[requiredField]}>
                    <Select options={bosses}/>
                </Form.Item>

                <Space>
                    <Form.Item>
                        <Button onClick={onDraftClick} type="primary">Сохранить как черновик</Button>
                    </Form.Item>
                    <Form.Item >
                        <Button htmlType="submit">Создать</Button>
                    </Form.Item>
                </Space>
            </Form>
        </>
        
    )
}