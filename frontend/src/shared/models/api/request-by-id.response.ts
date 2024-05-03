import { IApplicationForm } from "../form.interface";


export interface IGetRequestByIdResponse extends IApplicationForm {
    id: string;
    code: string;
    workflow_state: 'first' | 'draft' | 'boss' | 'mentor';
}