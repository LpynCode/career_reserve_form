

export type IKnowledgeMap = IKnowledgePart[];
export interface IKnowledgePart {
    part: {
        id: string;
        code: string;
        name: string;
    }
    children_parts: IKnowledgeMap;
}