import { BaseOptionType } from "antd/es/select"


export const bossesToOptions = (bosses: {person_id: string, person_fullname: string}[]): BaseOptionType[] => {
    return bosses.map((boss) => ({value: boss.person_id, label: boss.person_fullname}))
}