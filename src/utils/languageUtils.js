/**
 * Utility functions
 */

import { Language } from "codemaker-sdk";

const languages = new Map([
    ["java", Language.java],
    ["js", Language.javascript],
    ["jsx", Language.javascript],
    ["ts", Language.typescript],
    ["tsx", Language.typescript],
    ["kt", Language.kotlin],
    ["go", Language.go],
    ["cs", Language.csharp]
]);

export const isFileSupported = (fileName) => {
    const extension = fileName.split('.').pop();
    return !!extension && languages.has(extension);
}

export const langFromFileExtension = (fileName) => {
    const extension = fileName.split('.').pop();
    if (!extension) {
        throw new UnsupportedLanguageError("Could not determine file language " + fileName);
    }
    const language = languages.get(extension);
    if (!language) {
        throw new UnsupportedLanguageError("Language is not supported for file with extension " + extension);
    }
    return language;
}
