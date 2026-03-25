import { runWorkflow as runRedige } from './guiaRedige.js';

type WorkflowInput = { input_as_text: string, intent: 'redige' };

export const runWorkflow = async (workflow: WorkflowInput) => {
  if (workflow.intent === 'redige') {
    return await runRedige({ input_as_text: workflow.input_as_text });
  }
  return "Intent not handled locally (Migrated to ChatKit)";
};
