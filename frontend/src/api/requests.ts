import { $api } from ".";
import { IApplicationForm } from "../shared/models/form.interface";


export const createRequest = async (createData: IApplicationForm) => {

    const {data} = await $api.post('', {method: 'createRequest', data: createData});
    return data;
}