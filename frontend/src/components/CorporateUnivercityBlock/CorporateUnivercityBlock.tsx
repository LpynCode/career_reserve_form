import { Button, Card, Form, Input, Select } from "antd"
import { corporateInstituteYearsOptions } from "../../constants/corp-institute-years";
import { requiredField } from "../../constants/required-field";
import { useState } from "react";


export const CorporateUnivercityBlock = ({disabled}: {disabled?: boolean}) => {
    const [isDisabled, setIsDisabled] = useState<boolean>(disabled || false); 

    const onSelectYear = (value: string) => {
        setIsDisabled(value === 'Не проходил');
    }
    return (
        <Form.List name={"corporate_university"}>
            {(fields,  { add, remove }) => {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 16, marginBottom: 16 }}>
                        {fields.map(({key, name, ...restFields}) => (
                            <Card key={key} title="Корпоративный университет" extra={<Button disabled={fields.length === 1} onClick={() => remove(name)}>Удалить</Button>}>
                                <Form.Item
                                    {...restFields}
                                    label="Год окончания"
                                    name={[name, "year"]}
                                    rules={[requiredField]}
                                >
                                    <Select options={corporateInstituteYearsOptions} onSelect={onSelectYear} />
                                </Form.Item>
                                <Form.Item
                                    {...restFields}
                                    label="Название программы"
                                    name={[name, "programm_name"]}
                                    rules={[{required: !isDisabled, message: 'Поле обязательно для заполнения'}]}
                                >
                                    <Input disabled={isDisabled}/>
                                </Form.Item >
                            </Card>
                        ))}

                        <Button disabled={isDisabled} type="dashed" onClick={() => add()} block >
                            Добавить год окончания корпоративного университета
                        </Button>
                    </div>
                )
            }}  
        </Form.List>
    )
}