import {MergeSaveFilesController} from "../controllers/MergeSaveFilesController";
import {createMergeSaveFiles} from "./useCaseFactories";

export const mergeSaveFilesController = new MergeSaveFilesController(createMergeSaveFiles);
