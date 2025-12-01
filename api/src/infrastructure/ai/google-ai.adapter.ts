import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  IAiAssistantService,
  GenerateChallengeRequest,
  GenerateChallengeResponse,
} from '../../domain/interfaces/iai-assistant.service';

@Injectable()
export class GoogleAiAdapter implements IAiAssistantService {
  private readonly logger = new Logger(GoogleAiAdapter.name);
  private readonly genAI: GoogleGenerativeAI | null;
  private model: any = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY no está configurada');
      this.genAI = null;
    } else {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        // Intentar inicializar con el modelo más común
        this.initializeModel();
        this.logger.log('Google AI inicializado correctamente');
      } catch (error) {
        this.logger.error(`Error al inicializar Google AI: ${error.message}`);
        this.genAI = null;
      }
    }
  }

  private async initializeModel() {
    if (!this.genAI) return;

    try {
      // Listar modelos disponibles usando la API REST directamente
      const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      
      const listResponse = await fetch(listUrl);
      if (listResponse.ok) {
        const data = await listResponse.json();
        const availableModels = data.models
          ?.filter((m: any) => 
            m.supportedGenerationMethods?.includes('generateContent') &&
            (m.name.includes('gemini') || m.name.includes('models/gemini'))
          )
          ?.map((m: any) => {
            // Extraer solo el nombre del modelo sin el prefijo "models/"
            const name = m.name.replace('models/', '');
            return name;
          })
          .filter((name: string) => name) || [];

        this.logger.log(`Modelos disponibles encontrados: ${availableModels.join(', ')}`);

        if (availableModels.length > 0) {
          // Priorizar modelos estables sobre previews
          const preferredModels = [
            'gemini-2.5-flash',
            'gemini-flash-latest',
            'gemini-2.0-flash',
            'gemini-2.5-pro',
            'gemini-pro-latest',
          ];

          let selectedModel: string = '';
          for (const preferred of preferredModels) {
            if (availableModels.includes(preferred)) {
              selectedModel = preferred;
              break;
            }
          }

          // Si no hay modelo preferido, usar el primero disponible
          if (!selectedModel && availableModels.length > 0) {
            selectedModel = availableModels[0];
          }

          if (selectedModel) {
            this.model = this.genAI.getGenerativeModel({ model: selectedModel });
            this.logger.log(`Modelo seleccionado: ${selectedModel}`);
            return;
          }
        }
      }
    } catch (error: any) {
      this.logger.warn(`Error al listar modelos: ${error.message}`);
    }

    // Fallback: intentar con modelos comunes
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    for (const modelName of modelsToTry) {
      try {
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        this.logger.log(`Usando modelo: ${modelName}`);
        return;
      } catch (error) {
        continue;
      }
    }

    // Último recurso
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.logger.warn('Usando modelo por defecto: gemini-1.5-flash');
  }

  async generateChallenge(request: GenerateChallengeRequest): Promise<GenerateChallengeResponse> {
    if (!this.genAI || !this.model) {
      throw new Error('GEMINI_API_KEY no está configurada o no se pudo inicializar el modelo');
    }

    const prompt = this.buildPrompt(request.theme);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      if (!generatedText) {
        throw new Error('No se recibió respuesta válida de Gemini');
      }

      return this.parseResponse(generatedText, request.theme);
    } catch (error: any) {
      this.logger.error(`Error al generar challenge: ${error.message}`);
      
      // Si el error es 404, intentar reinicializar con otro modelo
      if (error?.status === 404 || error?.message?.includes('404')) {
        this.logger.warn('Modelo actual no disponible, intentando con otros modelos...');
        await this.initializeModel();
        
        // Intentar una vez más con el nuevo modelo
        if (this.model) {
          try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const generatedText = response.text();
            if (generatedText) {
              return this.parseResponse(generatedText, request.theme);
            }
          } catch (retryError) {
            this.logger.error(`Error en reintento: ${retryError}`);
          }
        }
      }
      
      throw new Error(`Error al generar challenge: ${error.message}`);
    }
  }

  private buildPrompt(theme: string): string {
    return `Eres un asistente experto en crear problemas de programación competitiva y algoritmos.

Genera un reto de programación sobre el tema: "${theme}"

Responde SOLO con un JSON válido en el siguiente formato (sin texto adicional, sin markdown, sin code blocks):
{
  "title": "Título del reto",
  "description": "Descripción detallada del problema. Incluye qué debe hacer el programa, restricciones, y ejemplos claros.",
  "difficulty": "EASY|MEDIUM|HARD",
  "tags": ["tag1", "tag2", "tag3"],
  "samples": [
    {
      "input": "entrada ejemplo 1",
      "expectedOutput": "salida esperada 1"
    },
    {
      "input": "entrada ejemplo 2",
      "expectedOutput": "salida esperada 2"
    }
  ],
  "suggestedTimeLimit": 2000,
  "suggestedMemoryLimit": 256
}

Reglas importantes:
- El JSON debe ser válido y parseable
- Incluye al menos 2 ejemplos en samples
- La descripción debe ser clara y completa
- Los tags deben ser relevantes al tema
- suggestedTimeLimit en milisegundos (típicamente 1000-5000)
- suggestedMemoryLimit en MB (típicamente 128-512)

Tema: ${theme}`;
  }

  private parseResponse(text: string, theme: string): GenerateChallengeResponse {
    try {
      let jsonText = text.trim();
      
      // Remover markdown code blocks si existen
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);

      return {
        title: parsed.title || `Reto sobre ${theme}`,
        description: parsed.description || 'Descripción no disponible',
        difficulty: parsed.difficulty || 'MEDIUM',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [theme],
        samples: Array.isArray(parsed.samples) ? parsed.samples : [],
        suggestedTimeLimit: parsed.suggestedTimeLimit || 2000,
        suggestedMemoryLimit: parsed.suggestedMemoryLimit || 256,
      };
    } catch (error) {
      this.logger.error(`Error al parsear respuesta de Gemini: ${error.message}`);
      this.logger.debug(`Texto recibido: ${text.substring(0, 200)}...`);
      
      // Retornar respuesta por defecto si falla el parsing
      return {
        title: `Reto sobre ${theme}`,
        description: `Genera un reto de programación relacionado con ${theme}. El asistente de IA tuvo problemas al generar la respuesta completa.`,
        difficulty: 'MEDIUM',
        tags: [theme],
        samples: [
          {
            input: 'Ejemplo de entrada',
            expectedOutput: 'Ejemplo de salida esperada',
          },
        ],
        suggestedTimeLimit: 2000,
        suggestedMemoryLimit: 256,
      };
    }
  }
}
