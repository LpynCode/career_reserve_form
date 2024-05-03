import { $api } from ".";


export const getEducationTypes = async () => {
    const {data} = await $api.post('', {method: 'getEducationTypes'});
    return data;
}

export const getEducationPrograms = async (career_reserve_type: string) => {
    const {data} = await $api.post('', {method: 'getEducationPrograms', career_reserve_type});
    return data;
}