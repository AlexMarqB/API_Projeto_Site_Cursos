import { ConflictError } from "../errors/conflict-error";
import { ForbiddenError } from "../errors/forbidden-error";
import { NotFoundError } from "../errors/not-found-error";
import { authenticateUser } from "../lib/extensions/authenticate-user";
import { ICoursesRepository } from "../repositories/i-courses-repository";
import { IEnrollmentsRepository } from "../repositories/i-enrollments-repository";
import { IUsersRepository } from "../repositories/i-users-repository";

export class EnrollmentsService {

    constructor(
        private readonly _usersRepository: IUsersRepository,
        private readonly _enrollmentsRepository: IEnrollmentsRepository,
        private readonly _coursesRepository: ICoursesRepository
    ) { }

    public async createEnrollment(authorization: string, courseId: string) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "student")
            throw new ForbiddenError("Access denied");

        const course = await this._coursesRepository.getCourseById(courseId);
        if (course == null)
            throw new NotFoundError("Could not find course");

        const alreadyHasEnrollment = await this._enrollmentsRepository
            .existsEnrollmentForStudentAtCourseByIds(authenticatedUser.id, course.id);

        if (alreadyHasEnrollment)
            throw new ConflictError(`Already have a enrollment at course ${course.name}`);

        const enrollment = await this._enrollmentsRepository.createEnrollment({
            studentId: authenticatedUser.id,
            courseId: course.id
        })

        return enrollment;
    }

    public async findEnrollmentsByStudentId(authorization: string) {
        const authenticatedUser = await authenticateUser(authorization, this._usersRepository);
        if (authenticatedUser.privilege != "student")
            throw new ForbiddenError("Access denied");

        const studentEnrollments = await this._enrollmentsRepository.findEnrollmentsByStudentId(authenticatedUser.id);
        return studentEnrollments;

    }
}