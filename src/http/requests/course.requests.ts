export type CreateCourseRequest = {
    name: string,
    photo: string,
    price: number,
}

export type UpdateCourseRequest = {
    name?: string,
    photo?: string,
    price?: number
}

export type RateCourseRequest = {
    rating: number
}