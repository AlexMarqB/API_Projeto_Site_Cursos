import { CreateCourseRequest, RateCourseRequest, UpdateCourseRequest } from "../http/requests/course.requests";
import { authenticateUser } from "../lib/extensions/authenticate-user";
import { ICoursesRepository } from "../repositories/i-courses-repository";
import { IUsersRepository } from "../repositories/i-users-repository";
import { ForbiddenError } from "../errors/forbidden-error";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import { IEnrollmentsRepository } from "../repositories/i-enrollments-repository";
import { BadRequestError } from "../errors/bad-request";

export class CoursesService {
    constructor(
        private readonly _usersRepository: IUsersRepository,
        private readonly _coursesRepository: ICoursesRepository,
        private readonly _enrollmentsRepository: IEnrollmentsRepository
    ) { }

    public async createCourse(authorization: string, createCourseRequest: CreateCourseRequest) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "administrator")
            throw new ForbiddenError("Access denied");

        const courseWithSameName = await this._coursesRepository.getCourseByName(createCourseRequest.name);
        if (courseWithSameName != null)
            throw new ConflictError(`Course with name "${createCourseRequest.name}" already exists`);

        const course = await this._coursesRepository.createCourse({
            name: createCourseRequest.name,
            photo: createCourseRequest.photo,
            enrollmentsNumber: 0,
            price: createCourseRequest.price,
            rating: 0,
            numberOfRatings: 0,
            ownerId: authenticatedUser.id
        })

        return course;
    }

    public async getCourseById(courseId: string) {
        const course = await this._coursesRepository.getCourseById(courseId);
        if (!course)
            throw new NotFoundError("Could not Find Course");

        return course;
    }

    public async getAllCourses() {
        return await this._coursesRepository.getAllCourses();
    }

    public async updateCourse(authorization: string, courseId: string, updateCourseRequest: UpdateCourseRequest) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "administrator")
            throw new ForbiddenError("Access denied");

        const course = await this._coursesRepository.getCourseById(courseId);
        if (course == null)
            throw new NotFoundError("Could not find course");

        if (course.ownerId != authenticatedUser.id)
            throw new ForbiddenError("Access denied");

        const existentCourse = await this._coursesRepository.getCourseByName(updateCourseRequest.name!);
        if (
            updateCourseRequest.name &&
            !existentCourse
        ) {
            course.name = updateCourseRequest.name;
        }

        if (updateCourseRequest.photo)
            course.photo = updateCourseRequest.photo;

        if (updateCourseRequest.price)
            course.price = updateCourseRequest.price;

        return await this._coursesRepository.replaceCourseById(course.id, course);
    }

    public async rateCourse(authorization: string, courseId: string, rateCourseRequest: RateCourseRequest) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "student")
            throw new ForbiddenError("Access denied");

        const enrollment = await this._enrollmentsRepository.findEnrollmentByStudentIdAndCourseId(authenticatedUser.id, courseId);
        if (!enrollment)
            throw new BadRequestError("Could not Find enrollment to course");

        if (enrollment.hasRatedCourse)
            throw new ConflictError("Already has rated this course");

        const course = await this._coursesRepository.getCourseById(courseId);
        if (!course)
            throw new BadRequestError(`Could not find Course ${courseId}`)

        course.numberOfRatings++;
        course.rating += rateCourseRequest.rating;

        await this._enrollmentsRepository.setHasRatedACourseToTrueById(enrollment.id);
        await this._coursesRepository.replaceCourseById(course.id, course);
        return course;
    }

    public async deleteCourse(authorization: string, courseId: string) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "administrator")
            throw new ForbiddenError("Access denied");

        const course = await this._coursesRepository.getCourseById(courseId);
        if (course == null)
            throw new NotFoundError("Could not find course");

        if (course.ownerId != authenticatedUser.id)
            throw new ForbiddenError("Access denied");

        await this._coursesRepository.deleteCourseById(course.id);
    }
}
