import { $api } from ".";

export const getPositions = async () => {
    const {data} = await $api.post('', {method: 'getAllPositions'});
    return data;
}