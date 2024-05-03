import { $api } from ".";
import { IMentorForm } from "../shared/models/mentor-form.interface";
import { IGetRequestByIdResponse } from "../shared/models/api/request-by-id.response";
import { IBossForm } from "../shared/models/boss-form.interface";
import { IApplicationForm } from "../shared/models/form.interface";
import { ICoForm } from "../shared/models/co-form.interface";


export const createRequest = async (createData: IApplicationForm & {form_id?: string}) => {
    const {data} = await $api.post('', {method: 'createRequest', data: createData});
    return data;
}

export const getRequestById = async (requestID: string) => {
    const {data} = await $api.post<IGetRequestByIdResponse>('', {method: 'getRequestByID', requestID});
    return {
        ...data, 
        private_phone_number: data.private_phone_number ? data.private_phone_number.slice(2) : "", 
        work_phone_number: data.work_phone_number ? data.work_phone_number.slice(2) : ""
    };
}

export const removeRequest = async (requestID: string) => {
    const {data} = await $api.post('', {method: 'removeRequest', requestID});
    return data;
}

export const sendBossRequest = async (requestID: string, reqData: IBossForm) => {
    const {data} = await $api.post('', {method: 'sendBossRequest', requestID, reqData});
    return data;
}

export const closeRequest =  async(requestID: string, reqData: IMentorForm) => {
    const {data} = await $api.post('', {method: 'closeRequest', requestID, reqData});
    return data;
}

export const closeReuqestWithProgram = async (requestID: string, reqData: ICoForm) => {
    const {data} = await $api.post('', {method: 'closeReuqestWithProgram', requestID, reqData});
    return data;
}

export const sendToCO = async (requestID: string) => {
    const {data} = await $api.post('', {method: 'sendToCO', requestID});
    return data;
}