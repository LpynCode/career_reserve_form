const DEV_MODE = ArrayOptFirstElem(XQuery(`sql:
	SELECT id
	FROM dbo.custom_web_templates
	WHERE code = 'petrovich_personnel_reserve_42487_backend' --Код шаблона
		AND enable_anonymous_access = true`)) != undefined
if (DEV_MODE) {
	// Для тестирования, шаблон должен быть анонимным.
	Request.AddRespHeader("Access-Control-Allow-Origin", "*", false);
	Request.AddRespHeader("Access-Control-Expose-Headers", "Error-Message");
	Request.AddRespHeader("Access-Control-Allow-Headers", "origin, content-type, accept");
	Request.AddRespHeader("Access-Control-Allow-Credentials", "true");
}

Request.RespContentType = "application/json";
Request.AddRespHeader("Content-Security-Policy", "frame-ancestors 'self'");
Request.AddRespHeader("X-XSS-Protection", "1");
Request.AddRespHeader("X-Frame-Options", "SAMEORIGIN");

/* --- types --- */
interface IError {
	code: number;
	message:string;
}

interface IRequestForm {
	form_id?: string;
	isDraft: boolean;
	target_position: string;
    current_position: string;
    experience_in_current_position: number;
    general_experience: number;
    subdivision: string;

    education: {
		type_id: string;
		comment?: string;
		institute_name: string;
		profeccion_name: string;
	}[];

    corporate_university: {
		year: string;
		programm_name?: string;
	}[];

    mentoring_experience: number;

    private_phone_number: string;
    work_phone_number: string;

    private_email: string;
    corporate_email: string;

    boss: string;
}

interface ICreateRequestDto extends IRequestForm{
	isDraft: boolean;
}

interface IRecursivePart {
	part: KnowledgePartCatalogDocumentTopElem;
	children_parts: IRecursivePart[];
}

interface ICloseRequestDto {
	covering_letter: string;
	recommendations: boolean;
}

/**
 * Выбирает все записи sql запроса
 * @param {string} query - sql-выражение
 */
function selectAll<T>(query: string) {
	return ArraySelectAll<T>(tools.xquery(`sql: ${query}`));
}

function selectOne<T>(query: string, defaultObj: any = undefined) {
	return ArrayOptFirstElem<T>(tools.xquery(`sql: ${query}`), defaultObj);
}

/**
 * Создает поток ошибки с объектом error
 * @param {object} errorObject - объект ошибки
 */
function HttpError(errorObject: IError) {
	throw new Error(EncodeJson(errorObject));
}

function getRecursiveParts(parts: KnowledgePartCatalogDocumentTopElem[], parent_id: number = null) {
	const result: IRecursivePart[] = [];
	let childrens: IRecursivePart[] = [];
	for (let i = 0; i < parts.length; i++) {
		if (parts[i].parent_object_id.Value === parent_id) {

			childrens = getRecursiveParts(parts, parts[i].id.Value);

			result.push({
				part: parts[i],
				children_parts: childrens
			});
		}
	}

	return result;
}

/* --- global --- */
const curUserId: number = DEV_MODE ? OptInt("1105387902724063510") : OptInt(Request.Session.Env.curUserID);


/* --- logic --- */

function getSubdivisions() {
	return selectAll<SubdivisionDocumentTopElem>("select * from dbo.subdivisions");
}

function getAllPositions() {
	return selectAll<PositionDocumentTopElem>("select * from dbo.positions");
}

function getCareerReserveTypes() {
	return selectAll<CareerReserveTypeDocumentTopElem>("select * from dbo.career_reserve_types");
}

function getBosses() {
	return selectAll<FuncManagerCatalogDocumentTopElem>("SELECT person_fullname, person_id FROM dbo.func_managers GROUP BY person_id,person_fullname");
}

function getCollaboratorInfo() {

	const collaborator = selectOne<CollaboratorDocumentTopElem>("select * from dbo.collaborators WHERE id = " + curUserId);
	const boss = tools.get_uni_user_boss(curUserId);

	return {collaborator, boss};
}

function getEducationTypes() {
	return selectAll<EducationTypeDocumentTopElem>("select * from dbo.education_types");
}

function findRequestTypeIDByCode(code: string) {
	return selectOne<RequestTypeDocumentTopElem>("select * from dbo.request_types WHERE code = '" + code + "'");
}
function createRequestDocument(data: ICreateRequestDto): RequestDocument {
	try {
		let new_request;
		if (!data.GetProperty("form_id")) {
			new_request = tools.new_doc_by_name<RequestDocument>("request");
		} else {
			new_request = tools.open_doc<RequestDocument>(OptInt(data.form_id));
		}
		const te_new_request = new_request.TopElem;
		const request_type_id = findRequestTypeIDByCode("request_personnel_reserve").id;

		te_new_request.request_type_id = OptInt(request_type_id);
		te_new_request.status_id = "active";
		te_new_request.person_id = curUserId;
		tools.common_filling("collaborator", te_new_request, curUserId);
		te_new_request.custom_elems.ObtainChildByKey("current_position").value = OptInt(data.current_position);
		te_new_request.custom_elems.ObtainChildByKey("experience_in_current_position").value = OptInt(data.experience_in_current_position);
		te_new_request.custom_elems.ObtainChildByKey("general_experience").value = OptInt(data.general_experience);
		te_new_request.custom_elems.ObtainChildByKey("subdivision").value = OptInt(data.subdivision);
		te_new_request.custom_elems.ObtainChildByKey("private_phone_number").value = data.private_phone_number;
		te_new_request.custom_elems.ObtainChildByKey("work_phone_number").value = data.work_phone_number;
		te_new_request.custom_elems.ObtainChildByKey("private_email").value = data.private_email;
		te_new_request.custom_elems.ObtainChildByKey("corporate_email").value = data.corporate_email;
		te_new_request.custom_elems.ObtainChildByKey("boss").value = OptInt(data.boss);
		te_new_request.custom_elems.ObtainChildByKey("mentoring_experience").value = data.mentoring_experience;
		te_new_request.custom_elems.ObtainChildByKey("target_position").value = OptInt(data.target_position);

		te_new_request.custom_elems.ObtainChildByKey("education").value = EncodeJson(data.education);
		te_new_request.custom_elems.ObtainChildByKey("corporate_university").value = EncodeJson(data.corporate_university);

		te_new_request.workflow_id = selectOne<WorkflowDocumentTopElem>("select * from dbo.workflows WHERE code = 'petrovich_career_reserve_42487_do'").id;
		te_new_request.is_workflow_init = true;

		return new_request;
	} catch (e) {
		alert(e);

		return undefined;
	}
}

function getRequestByID(requestID: number) {
	const req: RequestCatalogDocumentTopElem = tools.open_doc(requestID).TopElem;
	const res = new Object;
	let field;
	for (field in req.custom_elems.custom_elem) {
		if (field.name == "education" || field.name == "corporate_university") {
			res[field.name] = ParseJson(field.value.Value)
			continue;
		}
		res[field.name] = field.value != "undefined" ? field.value.Value : "";
	}
	res.id = req.id.Value;
	res.code = req.code.Value;
	res.workflow_state = req.workflow_state.Value;

	return res
}

function createRequest(data: ICreateRequestDto) {
	try {
		const createdDoc = createRequestDocument(data);
		if (createdDoc == undefined) throw Error("Ошибка при создании заявки");
		const isDraft = data.GetOptProperty("isDraft");
		if (isDraft != undefined) {
			createdDoc.TopElem.workflow_state = "draft";
		} else {
			createdDoc.TopElem.workflow_state = "boss";
		}
		if (!data.GetProperty("form_id")) {
			createdDoc.BindToDb();
		}
		createdDoc.Save();
		if (isDraft) {
			return {message: "Заявка сохранена на этапе «Черновик» и не отправлена на согласование!"}
		}
		const sended = tools.create_notification("petrovich_career_reserve_42487_notif_type", OptInt(data.boss), "", createdDoc.DocID);
		if (!sended) throw Error("Не удалось отправить уведомление руководителю");

		return {message: "Заявка отправлена руководителю!"}
	} catch (e) {
		alert(e);
		throw HttpError({
			code: 400,
			message: "Ошибка создания заявки"
		});
	}
}

function removeRequest(requestID: number) {
	const request = selectOne<RequestDocumentTopElem>("select * from dbo.requests WHERE id = " + requestID);
	if (request == undefined) throw Error("Заявка не найдена");

	DeleteDoc(UrlFromDocID(requestID));

	return {message: "Заявка удалена"}
}

function getEducationPrograms(career_reserve_type: string) {
	const programs = selectAll("SELECT * FROM dbo.typical_development_programs");

	const result = [];

	for (program in programs) {
		obj = new Object;
		el = tools.open_doc(program.id).TopElem
		if (el.custom_elems.ObtainChildByKey("type_of_personnel_reserve").value == career_reserve_type) {
			obj.id = el.id.Value
			obj.name = el.name.Value;
			result.push(obj);
		}
	}

	return result;
}

function closeReuqestWithProgram(requestID: number, reqData: {comment?: string, education_program: string}) {
	const reqDoc = tools.open_doc(requestID);
	reqDoc.TopElem.workflow_state = "closed";
	reqDoc.TopElem.status_id = "close";
	reqDoc.TopElem.close_date = Date();
	reqDoc.TopElem.custom_elems.ObtainChildByKey("education_program").value = OptInt(reqData.education_program);
	reqDoc.TopElem.custom_elems.ObtainChildByKey("mentor_comment").value = reqData.GetOptProperty("comment");

	const userDoc = tools.open_doc(curUserId).TopElem;
	const typicalPosDoc = tools.open_doc(OptInt(reqDoc.TopElem.custom_elems.ObtainChildByKey("typical_position").value));

	const careerDoc = tools.new_doc_by_name("career_reserve");
	const te_career = careerDoc.TopElem;
	te_career.person_id = reqDoc.TopElem.person_id;
	te_career.position_id = reqDoc.TopElem.custom_elems.ObtainChildByKey("typical_position").value;
	te_career.status = "active";
	te_career.personnel_reserve_id = reqDoc.TopElem.custom_elems.ObtainChildByKey("target_position").value;
	careerDoc.BindToDb();
	careerDoc.Save();
	reqDoc.Save();

	return {message: "Заявка успешно закрыта!"}
}

function bossSendRequest(requestID: number, data: {boss_comment: string, recommendation: string}) {
	try {
		const req = tools.open_doc(requestID);
		req.TopElem.workflow_state = "mentor";
		req.TopElem.custom_elems.ObtainChildByKey("boss_comment").value = data.boss_comment;
		req.TopElem.custom_elems.ObtainChildByKey("recommendation").value = data.recommendation;
		req.Save();

		const sended = tools.create_notification("petrovich_career_reserve_42490_notif_boss_type", OptInt(req.TopElem.person_id.Value), "", OptInt(req.TopElem.id.Value));
		if (!sended) throw Error("Не удалось отправить уведомление куратору");

		return {message: "Заявка отправлена куратору!"}
	} catch (e) {
		throw HttpError({
			code: 400,
			message: "Ошибка отправки заявки"
		});
	}

}

function sendToCO(requestID: number) {
	const req = tools.open_doc(requestID);
	req.TopElem.workflow_state = "co";
	req.Save();

	return {message: "Успешно"}
}

function getKnowledgeMap() {
	const classifier = selectOne<KnowledgeClassifierDocumentTopElem>("select * from dbo.knowledge_classifiers WHERE name = 'Кадровый резерв'");
	const parts = selectAll<KnowledgePartCatalogDocumentTopElem>("select * from dbo.knowledge_parts WHERE knowledge_classifier_id = " + classifier.id);

	return getRecursiveParts(parts);
}

function closeRequest(requestID: number, data: ICloseRequestDto) {
	const req = tools.open_doc(requestID);
	req.TopElem.custom_elems.ObtainChildByKey("recommendations").value = EncodeJson(data.recommendations);
	req.TopElem.custom_elems.ObtainChildByKey("covering_letter").value = data.covering_letter;
	req.TopElem.workflow_state = "closed";
	req.TopElem.status_id = "close";
	req.TopElem.close_date = Date();
	req.Save();
	tools.create_notification("petrovich_career_reserve_42490_boss_notif", OptInt(req.TopElem.person_id.Value), "", req.DocID);

	return {message: "Заявка закрыта!"}
}


function handler(body: Record<string, any>, method: string) {

	if (method === "getSubdivisions")
		return getSubdivisions();

	if ( method === "getCareerReserveTypes")
		return getCareerReserveTypes();

	if (method === "getAllPositions")
		return getAllPositions();

	if (method === "getCollaboratorInfo")
		return getCollaboratorInfo();

	if (method === "getBosses")
		return getBosses();

	if (method === "getEducationTypes")
		return getEducationTypes();

	if (method === "createRequest") {
		const data = body.GetOptProperty("data")

		return createRequest(data);
	}

	if (method === "removeRequest") {
		const requestID = OptInt(body.GetOptProperty("requestID"))

		return removeRequest(requestID);
	}
	if (method === "getRequestByID") {
		const requestID = OptInt(body.GetOptProperty("requestID"))

		return getRequestByID(requestID);
	}

	if (method === "sendBossRequest") {
		const requestID = OptInt(body.GetOptProperty("requestID"))
		const data = body.GetOptProperty("reqData")

		return bossSendRequest(requestID, data);
	}

	if (method === "getKnowledgeMap")
		return getKnowledgeMap();

	if (method === "closeRequest") {
		const requestID = OptInt(body.GetOptProperty("requestID"));
		const data = body.GetOptProperty("reqData");

		return closeRequest(requestID, data);
	}

	if (method === "sendToCO") {
		const requestID = OptInt(body.GetOptProperty("requestID"));

		return sendToCO(requestID);
	}

	if (method === "getEducationPrograms") {
		const career_reserve_type = body.GetOptProperty("career_reserve_type");

		return getEducationPrograms(career_reserve_type);
	}

	if (method === "closeReuqestWithProgram") {
		const requestID = OptInt(body.GetOptProperty("requestID"));
		const reqData = body.GetOptProperty("reqData");

		return closeReuqestWithProgram(requestID, reqData);
	}
}

/* --- start point --- */
function main(req: Request, res: Response) {
	try {

		const body = tools.read_object(req.Body);
		const method = tools_web.convert_xss(body.GetOptProperty("method"))
		if (method === undefined) {
			throw HttpError({
				code: 400,
				message: "unknown method"
			});
		}
		const payload = handler(body, method);

		res.Write(tools.object_to_text(payload, "json"));

	} catch (error) {
		const errorObject = tools.read_object(error);
		Request.RespContentType = "application/json";
		Request.SetRespStatus(errorObject.GetOptProperty("code", 500), "");
		Response.Write(errorObject.GetOptProperty("message", error));
	}
}

main(Request, Response);

export {}