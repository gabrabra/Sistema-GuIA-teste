import { fileSearchTool, Agent, AgentInputItem, Runner, withTrace, OpenAIProvider } from "@openai/agents";
import { OpenAI } from "openai";
import { z } from "zod";

// Tool definitions
const fileSearch = fileSearchTool([
  "vs_69b066f4fe00819198cf2854ea00bb96"
]);

// Shared client for guardrails and file search
let client: OpenAI;
function getClient() {
  if (!client) {
    client = new OpenAI({ 
      apiKey: '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',
    });
  }
  return client;
}

const provider = new OpenAIProvider({ openAIClient: getClient() });

const defaultModel = "gpt-4o-mini";
const reasoningModel = "o3-mini";

// Classify definitions
const ClassifySchema = z.object({ category: z.enum(["portugues", "geral"]) });
const classify = new Agent({
  name: "Classify",
  instructions: "",
  model: defaultModel,
  outputType: ClassifySchema,
  modelSettings: {
    temperature: 0
  }
});

const guiaRespondeGeral = new Agent({
  name: "GuIA Responde-Geral",
  instructions: "",
  model: defaultModel,
  tools: [
    fileSearch
  ],
  modelSettings: {
    temperature: 0.25,
    topP: 1,
    maxTokens: 911,
    store: true
  }
});

const guiaRespondePortuguS4oMini = new Agent({
  name: "GuIA Responde-Português-4o-mini",
  instructions: "",
  model: reasoningModel,
  modelSettings: {
    reasoning: {
      effort: "medium"
    },
    store: true
  }
});

type WorkflowInput = { input_as_text: string };

// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("1-GuIA Responde-4o-mini", async () => {
    const state: any = {
      ultima_questao: workflow.input_as_text,
      ultima_questao_geral: null
    };
    const conversationHistory: AgentInputItem[] = [
      { role: "user", content: [{ type: "input_text", text: workflow.input_as_text }] }
    ];
    const runner = new Runner({
      modelProvider: provider,
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_69b053fd5a2c8190a39f249a4ece65060af2a944fc0a98fe",
        version: "draft"
      }
    });

    // Simple regex check for portugues
    const isPortugues = /.*(crase|acentua|ortograf|concord|regenc|colocac|pronome|relativ|pontuac|morfossint|sintax|verbo|substantiv|adjetiv|adverb|preposic|artigo).*/i.test(workflow.input_as_text);
    const route_hint = isPortugues ? "portugues" : "unknown";

    if (route_hint === "portugues") {
      state.ultima_questao = workflow.input_as_text;
      const rag_query = "[NOVA QUESTÃO - IGNORE TODO O HISTÓRICO ANTERIOR]\\n\\n" + state.ultima_questao;
      
      try {
        await getClient().vectorStores.search("vs_69a3098120f48191aa372a865ddb5398", {
          query: rag_query,
          max_num_results: 8
        });
      } catch (e) {
        console.warn("Vector store search failed, continuing without it", e);
      }

      const resultTemp = await runner.run(
        guiaRespondePortuguS4oMini,
        [...conversationHistory]
      );

      if (!resultTemp.finalOutput) {
          throw new Error("Agent result is undefined");
      }

      return resultTemp.finalOutput;
    } else {
      const classifyInput = workflow.input_as_text;
      let classifyResultTemp;
      try {
        classifyResultTemp = await runner.run(
          classify,
          [
            { role: "user", content: [{ type: "input_text", text: classifyInput }] }
          ]
        );
      } catch (err) {
        console.error("Error running classify agent:", err);
        throw err;
      }

      if (!classifyResultTemp.finalOutput) {
          throw new Error("Agent result is undefined");
      }

      const classifyCategory = (classifyResultTemp.finalOutput as any).category;
      
      if (classifyCategory === "portugues") {
        state.ultima_questao = workflow.input_as_text;
        const rag_query = "[NOVA QUESTÃO - IGNORE TODO O HISTÓRICO ANTERIOR]\\n\\n" + state.ultima_questao;
        
        try {
          await getClient().vectorStores.search("vs_69a3098120f48191aa372a865ddb5398", {
            query: rag_query,
            max_num_results: 8
          });
        } catch (e) {
          console.warn("Vector store search failed, continuing without it", e);
        }

        const resultTemp = await runner.run(
          guiaRespondePortuguS4oMini,
          [...conversationHistory]
        );

        if (!resultTemp.finalOutput) {
            throw new Error("Agent result is undefined");
        }

        return resultTemp.finalOutput;
      } else {
        state.ultima_questao_geral = workflow.input_as_text;
        const resultTemp = await runner.run(
          guiaRespondeGeral,
          [...conversationHistory]
        );

        if (!resultTemp.finalOutput) {
            throw new Error("Agent result is undefined");
        }

        return resultTemp.finalOutput;
      }
    }
  });
};
