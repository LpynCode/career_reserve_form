import { useEffect, useState } from "react"
import { ApplicationForm } from "../components/Form/Form"
import { DefaultOptionType } from "antd/es/select";
import { getPositions } from "../api/positions";
import { positionsToOptions } from "../helpers/positions-to-options";
import { IGetUserInfoResponse } from "../shared/models/api/user-info.response";
import { getUserInfo } from "../api/user-info";
import { getUserInfoToForm } from "../helpers/user-info-to-form";
import { getSubdivisions } from "../api/subdivisions";
import { getBosses } from "../api/bosses";
import { bossesToOptions } from "../helpers/bosses-to-options";
import { message } from "antd";
import { getEducationTypes } from "../api/education-types";
import { getCareerReserveTypes } from "../api/career-reserve-types";


export const App = () => {
    const [positions, setPositions] = useState<DefaultOptionType[]>([]);
    const [reserveTypes, setReserveTypes] = useState<DefaultOptionType[]>([]);
    const [subdivisions, setSubdivisions] = useState<DefaultOptionType[]>([]);
    const [bosses, setBosses] = useState<DefaultOptionType[]>([]);
    const [educationTypes, setEducationTypes] = useState<DefaultOptionType[]>([]);
    const [curUserInfo, setCurUserInfo] = useState<IGetUserInfoResponse | null>(null); 
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);


    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        setIsLoading(true);
        Promise.all([getPositions(), getSubdivisions(), getBosses(), getUserInfo(), getEducationTypes(), getCareerReserveTypes()])
            .then(([positions, subdivisions, bosses, curUserInfo, educationTypes, reserveTypes]) => {
                setPositions(positionsToOptions(positions))
                setSubdivisions(positionsToOptions(subdivisions))
                setBosses(bossesToOptions(bosses))
                setCurUserInfo(curUserInfo)
                setEducationTypes(positionsToOptions(educationTypes))
                setReserveTypes(positionsToOptions(reserveTypes))
            })
            .catch(() => setErrorMessage('Произошла ошибка при загрузке данных'))
            .finally(() => setIsLoading(false));
    }, [])

    useEffect(() => {
        if(!errorMessage) return;

        messageApi.error(errorMessage, 3, () => setErrorMessage(null));
    }, [errorMessage, curUserInfo, messageApi])

    if(isLoading || !curUserInfo) return <> Загрузка...</>;
    
    return (
        <>
            {contextHolder}
            <ApplicationForm 
                setError={setErrorMessage} 
                reserveTypes={reserveTypes} 
                educationTypes={educationTypes} 
                bosses={bosses} 
                subdivisions={subdivisions} 
                initialValues={getUserInfoToForm(curUserInfo)} 
                positions={positions}
            />
        </>
    )
}