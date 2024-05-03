import { Button, Form, Select } from "antd"
import { requiredField } from "../../constants/required-field"
import { useEffect, useState } from "react"
import { getEducationPrograms } from "../../api/education-types";
import { positionsToOptions } from "../../helpers/positions-to-options";


interface IProgramFormProps {
    career_reserve_type_id: string
    closeRequest: (data: {education_program: string}) => void
}

export const ProgramForm = ({career_reserve_type_id, closeRequest}: IProgramFormProps) => {
    const [programs, setPrograms] = useState<{id: string, name: string}[]>([]);

    useEffect(() => {
        getEducationPrograms(career_reserve_type_id).then((data) => setPrograms(data))
    }, [])

    const onFinish = (data: {education_program: string}) => {
        closeRequest(data)
    }

    return (
        <Form onFinish={onFinish}>
            <Form.Item label="Программа развития" name="education_program" rules={[requiredField]}>
                <Select options={positionsToOptions(programs)}/>
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit">Закрыть заявку</Button>
            </Form.Item>
        </Form>
    )
}