import Joi from "joi";
import * as Yup from "yup";
import { registerAllValidators } from "../src/ValidatorHelpers";
import { benchmarkFunctions } from "@trapcode/benchmark";
import { Abolish } from "../index";

registerAllValidators(Abolish);

const abolish = new Abolish();

const compiled = Abolish.compile({ typeof: "string" });
// const compiledValue = 18;
const compiledValue = "A String";

function Abolish_TypeOfString() {
    compiled.validateVariable(compiledValue);
    // abolish.check(compiledValue, compiled);
}

// compile joi input
const joiSchema = Joi.string();

function Joi_TypeOfString() {
    joiSchema.validate(compiledValue);
}

// compile yup input

const yupSchema = Yup.string();

function Yup_TypeOfString() {
    yupSchema.validateSync(compiledValue);
}
//
benchmarkFunctions("TypeOfString", [
    Abolish_TypeOfString,
    Joi_TypeOfString,
    Yup_TypeOfString
]).run();

const arrayData = [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
    { id: 3, name: "Jack" },
    { id: 4, name: "Jill" },
    { id: 5, name: "John" },
    { id: 6, name: "Jane" },
    { id: 7, name: "Jack" },
    { id: 8, name: "Jill" },
    { id: 9, name: "John" },
    { id: 10, name: "Jane" },
    { id: 11, name: "Jack" },
    { id: 12, name: "Jill" },
    { id: 13, name: "John" },
    { id: 14, name: "Jane" },
    { id: 15, name: "Jack" },
    { id: 16, name: "Jill" },
    { id: 17, name: "John" },
    { id: 18, name: "Jane" },
    { id: 19, name: "Jack" },
    { id: 20, name: "Jill" },
    { id: 21, name: "John" },
    { id: 22, name: "Jane" },
    { id: 23, name: "Jack" },
    { id: 24, name: "Jill" },
    { id: 25, name: "John" },
    { id: 26, name: "Jane" },
    { id: 27, name: "Jack" },
    { id: 28, name: "Jill" },
    { id: 29, name: "John" },
    { id: 30, name: "Jane" }
];

const objData = { id: 1, name: "John" };
const objSchema = Abolish.compileObject({
    $: "required",
    id: { typeof: "number" },
    name: { typeof: "string" }
});

const arrayValuesSchema = Abolish.compile({
    arrayValues: Abolish.compile({ object: objSchema })
});

function Abolish_Object() {
    // objSchema.validate(objData);
    abolish.validate(objData, objSchema);
}

function Abolish_ArrayValues() {
    // arrayValuesSchema.validateVariable(arrayData);
    abolish.check(arrayData, arrayValuesSchema);
}

const joiObjSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required()
});

const joiArrayValues = Joi.array().items(joiObjSchema);

function Joi_Object() {
    joiObjSchema.validate(objData);
}

function Joi_ArrayValues() {
    joiArrayValues.validate(arrayData);
}

benchmarkFunctions("Object", [Abolish_Object, Joi_Object]).run();
benchmarkFunctions("ArrayValues", [Abolish_ArrayValues, Joi_ArrayValues]).run();
