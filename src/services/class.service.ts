import { CreateClassRequest } from "../http/requests/class.request";
import { IClassRepository } from "../repositories/i-class-repository";


export class ClassService {
   constructor(
      private readonly _testRepository: IClassRepository
   ) { }

   public async createClass({moduleId, name, description, url}: CreateClassRequest) {
      
   }
}