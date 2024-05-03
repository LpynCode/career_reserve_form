import { $api } from ".";


export const getKnowledgeMap = async () => {
    const {data} = await $api.post('', {method: 'getKnowledgeMap'});
    return data;
}