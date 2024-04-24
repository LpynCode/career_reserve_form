import { $api } from ".";


export const getBosses = async () => {
    const {data} = await $api.post('', {method: 'getBosses'});
    return data;
}