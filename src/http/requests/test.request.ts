type createTestRequest = {
   moduleId: string;
   question: string;
   answers: string;
   correctAnswer: string;
};

type createAnswerRequest = {
   testId: string;
   userId: string;
   answer: string;
};
