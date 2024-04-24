import { $api } from ".";


export const getCareerReserveTypes = async () => {
    const {data} = await $api.post('', {method: 'getCareerReserveTypes'});
    return data;
}