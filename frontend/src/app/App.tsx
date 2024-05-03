import { useEffect, useState } from "react"
import { DefaultOptionType } from "antd/es/select";
import { getPositions } from "../api/positions";
import { positionsToOptions } from "../helpers/positions-to-options";
import { getUserInfo } from "../api/user-info";
import { getUserInfoToForm } from "../helpers/user-info-to-form";
import { getSubdivisions } from "../api/subdivisions";
import { getBosses } from "../api/bosses";
import { bossesToOptions } from "../helpers/bosses-to-options";
import { message } from "antd";
import { getEducationTypes } from "../api/education-types";
import { getCareerReserveTypes } from "../api/career-reserve-types";
import { IApplicationForm } from "../shared/models/form.interface";
import { getRequestById } from "../api/requests";
import { BossStageForm } from "../components/BossStageForm/BossStageForm";
import { ApplicationForm } from "../components/Form/Form";
import { MentorStageForm } from "../components/MentorStageForm/MentorStageForm";
import { COStageForm } from "../components/COStageForm/COStageForm";
import { FormState } from "../shared/models/form-states.type";


export const App = () => {
    const [positions, setPositions] = useState<DefaultOptionType[]>([]);
    const [reserveTypes, setReserveTypes] = useState<DefaultOptionType[]>([]);
    const [subdivisions, setSubdivisions] = useState<DefaultOptionType[]>([]);
    const [bosses, setBosses] = useState<DefaultOptionType[]>([]);
    const [educationTypes, setEducationTypes] = useState<DefaultOptionType[]>([]);
    const [formInfo, setFormInfo] = useState<IApplicationForm | null>(null); 
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<{id: string, state: FormState} | null>(null); 

    const [isLoading, setIsLoading] = useState<boolean>(true);


    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        setIsLoading(true);

        const reqID = new URLSearchParams(window.location.search).get('request_id');
        if(reqID) {
            getRequestById(reqID).then((data) => {
                setFormInfo(data);
                setFormData({id: data.id, state: data.workflow_state || 'first'});
            }).catch(() => setErrorMessage('Произошла ошибка при загрузке данных'));
        } else {
            getUserInfo()
                .then((data) => {
                    setFormInfo(getUserInfoToForm(data))
                    setFormData({id: '', state: 'first'})
                })
                .catch(() => setErrorMessage('Произошла ошибка при загрузке данных'));
        }
        Promise.all([getPositions(), getSubdivisions(), getBosses(), getEducationTypes(), getCareerReserveTypes()])
            .then(([positions, subdivisions, bosses, educationTypes, reserveTypes]) => {
                setPositions(positionsToOptions(positions))
                setSubdivisions(positionsToOptions(subdivisions))
                setBosses(bossesToOptions(bosses))
                setEducationTypes(positionsToOptions(educationTypes))
                setReserveTypes(positionsToOptions(reserveTypes))
            })
            .catch(() => setErrorMessage('Произошла ошибка при загрузке данных'))
            .finally(() => setIsLoading(false));
    }, [])

    useEffect(() => {
        if(!errorMessage) return;

        messageApi.error(errorMessage, 3, () => setErrorMessage(null));
    }, [errorMessage, formInfo, messageApi])

    if(isLoading || !formInfo) return <> Загрузка...</>;

    return <>
        {contextHolder}
        <ApplicationForm 
            isFirst={formData?.state === 'first'}
            disabled={formData?.state !== 'first' && formData?.state !== 'draft'}
            setError={setErrorMessage} 
            reserveTypes={reserveTypes} 
            educationTypes={educationTypes} 
            bosses={bosses} 
            subdivisions={subdivisions} 
            initialValues={formInfo} 
            positions={positions}
            formData={formData}
        />
        {formData?.state === 'mentor' && <MentorStageForm formData={formData} setError={setErrorMessage}/>}
        {formData?.state === 'boss' && <BossStageForm formData={formData} setError={setErrorMessage}/>}
        {formData?.state === 'co' && <COStageForm formData={{id: formData!.id, career_reserve_type_id: formInfo!.target_position}} setError={setErrorMessage}/>}
    </>

    
}