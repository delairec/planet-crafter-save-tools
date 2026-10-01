import {LoadAndValidateSaveFileController} from "../controllers/LoadAndValidateSaveFileController";
import {ValidateSaveFileController} from "../controllers/ValidateSaveFileController";
import {createValidateSaveFile, createLoadAndValidateSaveFile} from "./useCaseFactories";

export const validateSaveFileController = new ValidateSaveFileController(createValidateSaveFile);
export const loadAndValidateSaveFileController = new LoadAndValidateSaveFileController(createLoadAndValidateSaveFile);
