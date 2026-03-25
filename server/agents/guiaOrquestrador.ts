import { runWorkflow as runResponde } from './guiaResponde.js';
import { runWorkflow as runRedige } from './guiaRedige.js';

type WorkflowInput = { input_as_text: string, intent: 'responde' | 'redige' };

export const runWorkflow = async (workflow: WorkflowInput) => {
  if (workflow.intent === 'redige') {
    return await runRedige({ input_as_text: workflow.input_as_text });
  } else {
    return await runResponde({ input_as_text: workflow.input_as_text });
  }
};
