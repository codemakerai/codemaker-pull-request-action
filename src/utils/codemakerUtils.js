import { Status, Mode, Modify } from 'codemaker-sdk';

const pollingIntervalMilliseconds = 500;
const timeoutMilliseconds = 10 * 60 * 1000;

/**
 * Process generation task.
 * 
 * @param {*} client                      CodeMaker client.
 * @param {*} createProcessRequest        Request object.
 * @param {*} pollingIntervalMilliseconds How often to poll the processing status.
 * @param {*} timeoutMilliseconds         Processing time out.
 * @returns Generated source code.
 */
export const processTask = async (client, createProcessRequest) => {
    const processTask = await client.createProcess(createProcessRequest);
    const taskId = processTask.data.id;
    let status = Status.inProgress;
    let success = false;

    const timeout = Date.now() + timeoutMilliseconds;
    while (status === Status.inProgress && timeout > Date.now()) {
        const processStatus = await client.getProcessStatus({
            id: taskId
        });
        status = processStatus.data.status;
        if (processStatus.data.status === Status.completed) {
            success = true;
            break;
        }
        await new Promise(resolve => setTimeout(resolve, pollingIntervalMilliseconds));
    }

    if (!success) {
        throw Error('Processing task failed.');
    }

    const processOutput = await client.getProcessOutput({
        id: taskId
    });
    return processOutput.data.output.source;
}

export const createProcessRequest = (language, source, lineNumber, prompt) => {
    return {
        process: {
            mode: Mode.editCode,
            language,
            input: {
                source,
            },
            options: {
                modify: Modify.none,
                codePath: `#${lineNumber}`,
                prompt
            }
        }
    };
}
