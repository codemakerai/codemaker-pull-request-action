import {isEmptyString} from "./commonUtils";

export const orderComments = (comments) => {
    comments.sort((first, second) => lineNumber(second) - lineNumber(first));
};

export const lineNumber = (comment) => {
    if (!isEmptyString(comment.start_line) && comment.start_line !== "-1") {
        return comment.start_line;
    } else {
        return comment.line;
    }
}