import { Button, Cascader, Form, FormProps, Upload } from "antd"
import TextArea from "antd/es/input/TextArea"
import { IMentorForm } from "../../shared/models/mentor-form.interface"
import { requiredField } from "../../constants/required-field"
import { mapToOptions } from "../../helpers/map-to-options"
import { useState, useEffect } from "react"
import { getKnowledgeMap } from "../../api/knowledge-map"
import { IKnowledgeMap } from "../../shared/models/knowledge-map.interface"


interface MentorRejectFormProps extends FormProps {
    closeRequest: (reqData: IMentorForm) => void
}

export const MentorRejectForm = ({ closeRequest, ...props }: MentorRejectFormProps) => {
    const [map, setMap] = useState<IKnowledgeMap | null>(null);

    useEffect(() => {
        getKnowledgeMap().then((data) => setMap(data))
    }, [])
    
    const onFinish = (data: IMentorForm) => {
        const arrayOfReccomendations = data.recommendations.map((rec) => rec[rec.length-1]);
        closeRequest({...data, recommendations: arrayOfReccomendations})
    }
    return (
        <Form onFinish={onFinish} {...props}>
            <Form.Item label="Сопроводительное письмо" name="covering_letter">
                <TextArea />
            </Form.Item>
            <Form.Item label="Добавить файл" name="file">
                <Upload  listType="picture-card">
                    <button style={{ border: 0, background: 'none' }} type="button">
                        <span>Загрузить</span>
                    </button>
                </Upload>
            </Form.Item>
            <Form.Item label="Рекоммендации для развития" name="recommendations" rules={[requiredField]}>
                <Cascader
                    multiple
                    options={mapToOptions(map)}
                />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" type="primary">Закрыть заявку</Button>
            </Form.Item>
        </Form>
    )
}