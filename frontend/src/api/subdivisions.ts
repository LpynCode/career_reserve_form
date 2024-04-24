import { $api } from ".";


export const getSubdivisions = async () => {
    const {data} = await $api.post('', {method: 'getSubdivisions'});
    return data;
}