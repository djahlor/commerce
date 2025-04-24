# OpenAI with Vercel AI SDK - Implementation Reference

## Setup
The OpenAI provider is available in the `@ai-sdk/openai` module:

```bash
pnpm add @ai-sdk/openai
```

## Provider Instance
Basic import:
```javascript
import { openai } from '@ai-sdk/openai';
```

For customized setup:
```javascript
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
});
```

## Configuration Options
- **baseURL**: Use a different URL prefix for API calls
- **apiKey**: API key (defaults to OPENAI_API_KEY environment variable)
- **headers**: Custom headers for requests
- **compatibility**: 'strict' (OpenAI API) or 'compatible' (3rd party providers)

## Usage Examples

### Text Generation
```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

### Streaming Text
```javascript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const result = streamText({
  model: openai('gpt-4o'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});

// Stream the response
for await (const chunk of result.stream) {
  process.stdout.write(chunk);
}
```

### Analyzing PDFs
```javascript
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import fs from 'fs';

const result = await generateText({
  model: openai('gpt-4o'),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What is the main topic of this PDF?',
        },
        {
          type: 'file',
          data: fs.readFileSync('./data/document.pdf'),
          mimeType: 'application/pdf',
          filename: 'document.pdf',
        },
      ],
    },
  ],
});
```

### Structured Output Generation
```javascript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const result = await generateObject({
  model: openai('gpt-4o', {
    structuredOutputs: true,
  }),
  schemaName: 'analysis',
  schemaDescription: 'Analysis of website content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    keyPoints: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  prompt: 'Analyze this website content and provide recommendations.',
});
```

## Environment Variables
Required environment variables:
```
OPENAI_API_KEY=your_api_key
```