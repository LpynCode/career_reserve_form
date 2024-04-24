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

interface ICreateRequestDto extends Object {
	isDraft: boolean;
	target_position_id: string;
    current_position_id: string;
    experience_in_current_position: number;
    general_experience: number;
    subdivision_id: string;

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

    boss_id: string;
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
		const request_type_id = findRequestTypeIDByCode("request_personnel_reserve").id;
		const new_request = tools.new_doc_by_name<RequestDocument>("request");
		const te_new_request = new_request.TopElem;
		te_new_request.request_type_id = OptInt(request_type_id);
		te_new_request.status_id = "active";
		te_new_request.person_id = curUserId;
		tools.common_filling("collaborator", te_new_request, curUserId);
		te_new_request.custom_elems.ObtainChildByKey("current_position").value = OptInt(data.current_position_id);
		te_new_request.custom_elems.ObtainChildByKey("experience_in_current_position").value = OptInt(data.experience_in_current_position);
		te_new_request.custom_elems.ObtainChildByKey("general_experience").value = OptInt(data.general_experience);
		te_new_request.custom_elems.ObtainChildByKey("subdivision").value = OptInt(data.subdivision_id);
		te_new_request.custom_elems.ObtainChildByKey("private_phone_number").value = data.private_phone_number;
		te_new_request.custom_elems.ObtainChildByKey("work_phone_number").value = data.work_phone_number;
		te_new_request.custom_elems.ObtainChildByKey("private_email").value = data.private_email;
		te_new_request.custom_elems.ObtainChildByKey("corporate_email").value = data.corporate_email;
		te_new_request.custom_elems.ObtainChildByKey("boss").value = OptInt(data.boss_id);
		te_new_request.custom_elems.ObtainChildByKey("mentoring_experience").value = data.mentoring_experience;
		te_new_request.custom_elems.ObtainChildByKey("target_position").value = OptInt(data.target_position_id);

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
		createdDoc.BindToDb();
		createdDoc.Save();
		if (isDraft) {
			return {message: "Заявка сохранена на этапе «Черновик» и не отправлена на согласование!"}
		}
		const sended = tools.create_notification("petrovich_career_reserve_42487_notif_type", OptInt(data.boss_id), "", createdDoc.DocID);
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