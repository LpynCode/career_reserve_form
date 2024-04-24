import { $api } from ".";
import { IGetUserInfoResponse } from "../shared/models/api/user-info.response";


export const getUserInfo = async () => {
    const {data} = await $api.post<IGetUserInfoResponse>('', {method: 'getCollaboratorInfo'});
    return data;
}