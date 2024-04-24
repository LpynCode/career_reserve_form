import { ICollaborator } from "../collaborator.interface";

export interface IGetUserInfoResponse {
    collaborator: ICollaborator;
    boss: ICollaborator; 
}