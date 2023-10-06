import { BadRequestError } from "../../src/errors/bad-request";
import { ForbiddenError } from "../../src/errors/forbidden-error";
import { NotFoundError } from "../../src/errors/not-found-error";
import { ConflictError } from "../errors/conflict-error";
import { CreateModuleRequest, UpdateModuleRequest } from "../http/requests/modules.requests";
import { authenticateUser } from "../lib/extensions/authenticate-user";
import { ICoursesRepository } from "../repositories/i-courses-repository";
import { IEnrollmentsRepository } from "../repositories/i-enrollments-repository";
import { IModulesRepository } from "../repositories/i-modules-repository";
import { IUsersRepository } from "../repositories/i-users-repository";

export class ModulesService {
    constructor(
        private readonly _usersRepository: IUsersRepository,
        private readonly _coursesRepository: ICoursesRepository,
        private readonly _modulesRepository: IModulesRepository,
        private readonly _enrollmentsRepository: IEnrollmentsRepository
    ) { }

    public async createModule(authorization: string, courseId: string, createModuleRequest: CreateModuleRequest) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "administrator")
            throw new ForbiddenError("Access denied");

        const course = await this._coursesRepository.getCourseById(courseId);
        if (course == null)
            throw new NotFoundError("Could not find course");

        if (course.ownerId != authenticatedUser.id)
            throw new ForbiddenError("Access denied");

        const sameNameCourse = await this._modulesRepository.getModuleByCourseIdAndName(course.id, createModuleRequest.name);
        if (sameNameCourse != null)
            throw new ConflictError(`Course with name \"${createModuleRequest.name}\" already exists`);

        const module = await this._modulesRepository.createModule({
            courseId: course.id,
            name: createModuleRequest.name,
            description: createModuleRequest.description,
        })

        return module;
    }

    public async getModuleById(authorization: string, moduleId: string) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);

        const module = await this._modulesRepository.getModuleById(moduleId);
        if (module == null)
            throw new NotFoundError("Could not find module");

        const course = await this._coursesRepository.getCourseById(module.courseId);

        const existsEnrollmentForStudent = await this._enrollmentsRepository
            .existsEnrollmentForStudentAtCourseByIds(authenticatedUser.id, course!.id);

        if (course!.ownerId == authenticatedUser.id || existsEnrollmentForStudent) {
            return module;
        }

        throw new ForbiddenError("Access denied");
    }

    public async getModulesByCourseId(authorization: string, courseId: string) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);

        const course = await this._coursesRepository.getCourseById(courseId);
        if (course == null)
            throw new NotFoundError("Could not find module");

        const existsEnrollmentForStudent = await this._enrollmentsRepository
            .existsEnrollmentForStudentAtCourseByIds(authenticatedUser.id, course!.id);

        if (course!.ownerId == authenticatedUser.id || existsEnrollmentForStudent) {
            const modules = await this._modulesRepository.getModulesByCourseId(course.id);
            return modules;
        }

        throw new ForbiddenError("Access denied");
    }

    public async updateModuleById(authorization: string, moduleId: string, updateModuleRequest: UpdateModuleRequest) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "administrator")
            throw new ForbiddenError("Access denied");

        const module = await this._modulesRepository.getModuleById(moduleId);
        if (module == null)
            throw new BadRequestError("Could not find module");

        const course = await this._coursesRepository.getCourseById(module.courseId);
        if (course!.ownerId != authenticatedUser.id)
            throw new ForbiddenError("Access denied");

        if (updateModuleRequest.name)
            module.name = updateModuleRequest.name;

        if (updateModuleRequest.description)
            module.description = updateModuleRequest.description;

        await this._modulesRepository.replaceModuleById(module.id, module);
        return module;
    }
}