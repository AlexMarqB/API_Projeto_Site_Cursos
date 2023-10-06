import { Answer, Test } from "@prisma/client";
import { ITestsRepository } from "../i-tests-repository";
import { CreateAnswerPrismaType } from "../../types/create-answer-prisma.types";
import { CreateTestPrismaType } from "../../types/create-test-prisma.types";
import { randomUUID } from "crypto";

export class InMemoryTestsRepository implements ITestsRepository {
    private tests: Test[]
    private answers: Answer[]

    constructor() {
        this.tests = []
        this.answers = []
    }

    public async createTest(test: CreateTestPrismaType): Promise<Test> {
        return await new Promise(resolve => {
            const newTest: Test = {
                id: randomUUID(),
                moduleId: test.moduleId!,
                question: test.question,
                answers: test.answers,
                correctAnswer: test.correctAnswer
            }
            this.tests.push(newTest);
            resolve(newTest);
        })
    }

    public async getAllTestsByQuestion(question: string): Promise<Test[] | null> {
        return new Promise(resolve => {
            const tests = this.tests.filter(test => test.question === question);
            resolve(tests);
        })
    }

    public async getAllTestsByModuleId(moduleId: string): Promise<Test[] | null> {
        return new Promise(resolve => {
            const tests = this.tests.filter(test => test.moduleId === moduleId);
            resolve(tests);
        })
    }

    public async getTestById(id: string): Promise<Test | null> {
        return new Promise(resolve => {
            const test = this.tests.find(test => test.id === id)
            resolve(test ? test : null)
        })
    }

    public async createAnswer(answer: CreateAnswerPrismaType): Promise<{ id: string; testId: string; userId: string; answer: string; } | null> {
        return new Promise(resolve => {
            const newAnswer: Answer = {
                id: randomUUID(),
                answer: answer.answer,
                testId: answer.testId!,
                userId: answer.userId!
            }
            this.answers.push(newAnswer);
            resolve(newAnswer);
        })
    }

    public async getAllAnswersByUserAndTestId(userId: string, testId: string): Promise<{ id: string; testId: string; userId: string; answer: string; }[] | null> {
        return new Promise(resolve => {
            const answers = this.answers.filter(answer => answer.userId === userId && answer.testId === testId);
            resolve(answers);
        })
    }

}