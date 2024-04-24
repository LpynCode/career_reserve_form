import { $api } from ".";


export const getEducationTypes = async () => {
    const {data} = await $api.post('', {method: 'getEducationTypes'});
    return data;
}