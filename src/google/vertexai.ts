import { VertexAI, HarmCategory, HarmBlockThreshold, GenerateContentResponse } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

// Path to your service account key file
const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
const datastore = process.env.NEXT_PUBLIC_DATASTORE;

async function getVertexAIClient(): Promise<VertexAI> {
  console.log("Initializing VertexAI client");
  console.log("Project ID:", projectId);
  
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_PROJECT_ID is not defined');
  }
    const authClient = new GoogleAuth({
      keyFile: keyFilePath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  
    // Get the authorization client
    await authClient.getClient();

  const vertexAI = new VertexAI({
    project: projectId,
    location: 'europe-west8',
  });

  return vertexAI;
}

async function searchContent() {
  try {
    const vertexAI = await getVertexAIClient();
    const model = 'gemini-1.5-pro';

    console.log("Creating generative model");
    const generativeModel = vertexAI.preview.getGenerativeModel({
      model: model,
      generationConfig: {
        'maxOutputTokens': 8192,
        'temperature': 1,
        'topP': 0.95,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        }
      ],
      tools: [
        {
          retrieval: {
            vertexAiSearch: {
              datastore: `projects/${projectId}/locations/global/collections/default_collection/dataStores/${datastore}`,
            }
          },
        },
      ],
    });

    console.log("Starting chat");
    const chat = generativeModel.startChat({});
    return chat;
  } catch (error) {
    console.error('Error in searchContent:', error);
    throw error;
  }
}

export async function getChatResponse(prompt: string = 'tell me about racer 5'): Promise<GenerateContentResponse> {
  try {
    console.log("getResponse called with prompt:", prompt);
    const chat = await searchContent();
    console.log("Chat created, sending message stream");
    const streamResult = await chat.sendMessageStream(prompt);

    console.log("Message stream sent, waiting for response");
    const streamingResponse = await streamResult.response;
    process.stdout.write('stream result: ' + JSON.stringify(streamingResponse) + '\n');
    
    return streamingResponse;
  } catch (error) {
    console.error('Error in getResponse:', error);
    throw error;
  }
}
