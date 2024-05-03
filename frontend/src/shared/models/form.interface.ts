

interface IEducationFormBlock {
    type_id: string;
    comment: string;
    institute_name: string;
    profession_name: string;
}

interface ICorpUnivercityFormBlock {
    year: string;
    programm_name?: string;
}

export interface IApplicationForm {
    code?: string;

    isDraft: boolean;
    target_position: string;
    current_position: string;
    experience_in_current_position: number;
    general_experience: number;
    subdivision: string;

    education: IEducationFormBlock[];

    corporate_university: ICorpUnivercityFormBlock[];

    mentoring_experience: string;

    private_phone_number: string;
    work_phone_number: string;

    private_email: string;
    corporate_email: string;

    boss: string;

}