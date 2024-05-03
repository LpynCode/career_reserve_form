import { Button, Form, Input, Select, Space,  notification } from "antd"
import { ApplicationFormProps } from "./Form.props"
import { IApplicationForm } from "../../shared/models/form.interface"
import { validatePhone } from "../../helpers/phone-validator"
import { requiredField } from "../../constants/required-field"
import { EducationFormBlock } from "../EducationFormBlock/EducationFormBlock"
import { CorporateUnivercityBlock } from "../CorporateUnivercityBlock/CorporateUnivercityBlock"
import { createRequest, removeRequest } from "../../api/requests"
import { curUserID } from "../../config/global"
import { openNotification } from "../../helpers/open-notification"
import { BossStageForm } from "../BossStageForm/BossStageForm"

export const ApplicationForm = ({
    positions,
    reserveTypes, 
    setError, 
    subdivisions, 
    bosses,
    educationTypes, 
    formData,
    disabled,
    isFirst,
    initialValues,
    ...props
}: ApplicationFormProps) => {
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm<IApplicationForm>();

    const onFinish = (data: IApplicationForm) => {
        const form_id = formData ? formData.id : "";
        createRequest({...data, form_id, private_phone_number: "+7" + data.private_phone_number, work_phone_number: "+7" + data.work_phone_number})
            .then(({message}) => openNotification(message, api))
            .catch(setError)
    }

    const onDraftClick = () => {
        const data = form.getFieldsValue();
        const form_id = formData ? formData.id : "";
        createRequest({
            ...data, 
            form_id,
            private_phone_number: data.private_phone_number ? "+7"+data.private_phone_number : "", 
            work_phone_number: data.work_phone_number ? "+7"+data.work_phone_number: "", 
            isDraft: true
        })
            .then(({message}) => openNotification(<Space>
                <span>{message}</span>
                <Button onClick={redirectToRequestsPage} type="primary">ОК</Button>
            </Space>, api))
            .catch(setError)
    }

    const onRemoveClick = () => {
        if(!formData) return;
        removeRequest(formData.id)
            .then(({message}) => openNotification(<Space>
                <span>{message}</span>
                <Button onClick={redirectToRequestsPage} type="primary">ОК</Button>
            </Space>, api))
            .catch(setError)
    }

    const redirectToRequestsPage = () => {
        window.location.href = `/requests/${curUserID}`
    }
    return (
        <>
            {contextHolder}
            <Form 
                disabled={disabled}
                form={form}
                onFinish={onFinish} 
                initialValues={initialValues}
                {...props}
            >
                <Form.Item label="Целевая должность" name="target_position" rules={[requiredField]}>
                    <Select options={reserveTypes} />
                </Form.Item>

                <Form.Item label="Текущая должность" name="current_position" rules={[requiredField]}>
                    <Select options={positions} />
                </Form.Item>

                <Form.Item label="Стаж работы в текущей должности" name="experience_in_current_position" rules={[requiredField]}>
                    <Input type="number" />
                </Form.Item>

                <Form.Item label="Общий стаж работы" name="general_experience" rules={[requiredField]}>
                    <Input type="number" />
                </Form.Item>

                <Form.Item label="Подразделение" name="subdivision" rules={[requiredField]}>
                    <Select options={subdivisions} />
                </Form.Item>

                <EducationFormBlock educationTypes={educationTypes}/>
                <CorporateUnivercityBlock disabled={disabled}/>

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

                <Form.Item label="Руководитель" name="boss" rules={[requiredField]}>
                    <Select options={bosses}/>
                </Form.Item>

                {formData?.state === 'mentor' && <BossStageForm initialValues={initialValues} setError={setError} formData={formData} disabled={true}/>}

                {!disabled && <Space>
                     {!isFirst && 
                        <Form.Item>
                            <Button onClick={onRemoveClick} danger type="primary">Удалить</Button>
                        </Form.Item>
                    }
                    <Form.Item>
                        <Button onClick={onDraftClick} type="primary">Сохранить как черновик</Button>
                    </Form.Item>
                    <Form.Item >
                        <Button htmlType="submit">Создать</Button>
                    </Form.Item>
                </Space>}
                
            </Form>
        </>
    )
}