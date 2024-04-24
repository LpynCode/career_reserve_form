import { Form, Card, Button, Input } from "antd"
import TextArea from "antd/es/input/TextArea"
import { requiredField } from "../../constants/required-field"
import Select, { DefaultOptionType } from "antd/es/select"
import { useState } from "react"

export const EducationFormBlock = ({educationTypes}: {educationTypes: DefaultOptionType[]}) => {
    const [isTypeWithoutComment, setIsTypeWithoutComment] = useState<boolean>(false);

    const onSelectType = (value: string) => {
        educationTypes.find((educationType) => educationType.label && typeof educationType.label === 'string' && educationType.label.toLowerCase() === 'незаконченное высшее')?.value === value ? setIsTypeWithoutComment(true) : setIsTypeWithoutComment(false);
    }
    return (
        <Form.List name="education">
            {(fields,  { add, remove }) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16, marginBottom: 16 }}>
                        {fields.map(({key, name, ...restFields}) => (
                            <Card key={key} title="Образование" extra={<Button disabled={fields.length === 1} onClick={() => remove(name)}>Удалить</Button>}>
                                <Form.Item
                                    {...restFields}
                                    label="Тип образования"
                                    name={[name, "type_id"]}
                                    rules={[requiredField]}
                                >
                                    <Select options={educationTypes} onSelect={onSelectType} />
                                </Form.Item>
                                <Form.Item
                                    {...restFields}
                                    label="Комментарий"
                                    name={[name, "comment"]}
                                    rules={[{required: isTypeWithoutComment, message: 'Поле обязательно для заполнения'}]}
                                >
                                    <TextArea />
                                </Form.Item >
                                <Form.Item
                                    {...restFields}
                                    label="Название учебного заведения"
                                    name={[name, "institute_name"]}
                                    rules={[requiredField]}
                                >
                                    <Input />
                                </Form.Item >
                                <Form.Item
                                    {...restFields}
                                    label="Специальность"
                                    name={[name, "profession_name"]}
                                    rules={[requiredField]}
                                >
                                    <Input />
                                </Form.Item >
                            </Card>
                        ))}

                        <Button type="dashed" onClick={() => add()} block >
                            Добавить образование
                        </Button>
                    </div>
                )
            }}
        </Form.List>
    )
}
