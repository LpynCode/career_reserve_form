import { IGetUserInfoResponse } from "../shared/models/api/user-info.response"
import { IApplicationForm } from "../shared/models/form.interface";


const getYearsDiff = (date1: string) => {
    const diff = Math.abs(Date.now() - new Date(date1).getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
}

export const getUserInfoToForm = (userInfo: IGetUserInfoResponse): IApplicationForm => {
    return {
        target_position: "",
        isDraft: false,
        mentoring_experience: "",
        private_phone_number: "",
        private_email: "",
        current_position: userInfo.collaborator.position_id,
        experience_in_current_position: getYearsDiff(userInfo.collaborator.position_date),
        general_experience: getYearsDiff(userInfo.collaborator.hire_date),
        subdivision: userInfo.collaborator.position_parent_id,
        work_phone_number: userInfo.collaborator.phone,
        corporate_email: userInfo.collaborator.email,
        boss: userInfo.boss.id,
        education: [{type_id: "", comment: "", institute_name: "", profession_name: ""}],
        corporate_university: [{year: "", programm_name: ""}],

    }
}